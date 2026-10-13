import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import NewsletterPanel from '@/components/admin/NewsletterPanel'
import type { NewsletterStatus } from '@/lib/newsletter/status'

const actions = vi.hoisted(() => ({
  sendNewsletterTest: vi.fn(),
  startNewsletter: vi.fn(),
  resumeNewsletter: vi.fn(),
}))
vi.mock('@/lib/actions/newsletter', () => actions)
const refresh = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

const notSent = (recipientCount: number): NewsletterStatus => ({ kind: 'not_sent', recipientCount })

// Knappene er deaktivert til transisjonen er ferdig; klikk først når de er aktive.
async function clickWhenEnabled(name: string) {
  const button = await screen.findByRole('button', { name })
  await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false))
  fireEvent.click(button)
}

beforeEach(() => {
  actions.sendNewsletterTest.mockResolvedValue({ ok: true, data: { to: 'mikkel@ferabrand.com' } })
  actions.startNewsletter.mockResolvedValue({ ok: true, data: { status: 'done', sent: 3, failed: 0 } })
  actions.resumeNewsletter.mockResolvedValue({ ok: true, data: { status: 'done', sent: 1, failed: 0 } })
})
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('NewsletterPanel', () => {
  it('sier fra når nyhetsbrev ikke er satt opp', () => {
    render(<NewsletterPanel articleId="a1" isPublished status={null} />)
    expect(screen.getByText(/ikke satt opp ennå/)).toBeTruthy()
  })

  it('ber om publisering før utsending', () => {
    render(<NewsletterPanel articleId="a1" isPublished={false} status={notSent(3)} />)
    expect(screen.getByText(/Publiser artikkelen før/)).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('krever test før utsending og bekreftelse med antall mottakere', async () => {
    render(<NewsletterPanel articleId="a1" isPublished status={notSent(3)} />)
    expect(screen.queryByRole('button', { name: /Send til/ })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Send test til meg' }))
    expect(await screen.findByText(/Test sendt til mikkel@ferabrand.com/)).toBeTruthy()
    expect(actions.sendNewsletterTest).toHaveBeenCalledWith('a1')

    await clickWhenEnabled('Send til 3 mottakere')
    expect(screen.getByText(/kan ikke angres/)).toBeTruthy()
    expect(actions.startNewsletter).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Ja, send nå' }))
    expect(await screen.findByText('Nyhetsbrevet er sendt.')).toBeTruthy()
    expect(actions.startNewsletter).toHaveBeenCalledWith('a1')
  })

  it('deaktiverer utsending når det ikke finnes mottakere', async () => {
    render(<NewsletterPanel articleId="a1" isPublished status={notSent(0)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Send test til meg' }))
    const send = await screen.findByRole('button', { name: 'Send til 0 mottakere' })
    expect((send as HTMLButtonElement).disabled).toBe(true)
  })

  it('viser feilmelding fra testutsending', async () => {
    actions.sendNewsletterTest.mockResolvedValue({ ok: false, error: 'RESEND_API_KEY mangler' })
    render(<NewsletterPanel articleId="a1" isPublished status={notSent(3)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Send test til meg' }))
    expect(await screen.findByText('RESEND_API_KEY mangler')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Send til/ })).toBeNull()
  })

  it('lar admin fortsette en avbrutt utsending', async () => {
    const status: NewsletterStatus = {
      kind: 'sending', recipientCount: 10, sentCount: 4, failedCount: 0, completedAt: null, isLocked: false,
    }
    render(<NewsletterPanel articleId="a1" isPublished status={status} />)
    expect(screen.getByText(/4 av 10/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Fortsett utsending' }))
    expect(await screen.findByText('Nyhetsbrevet er sendt.')).toBeTruthy()
    expect(actions.resumeNewsletter).toHaveBeenCalledWith('a1')
  })

  it('henter ny status når utsendingen kaster (f.eks. tidsavbrudd)', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    actions.startNewsletter.mockRejectedValue(new Error('504'))
    render(<NewsletterPanel articleId="a1" isPublished status={notSent(3)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Send test til meg' }))
    await clickWhenEnabled('Send til 3 mottakere')
    fireEvent.click(screen.getByRole('button', { name: 'Ja, send nå' }))
    expect(await screen.findByText(/Noe gikk galt/)).toBeTruthy()
    expect(refresh).toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Ja, send nå' })).toBeNull()
    spy.mockRestore()
  })

  it('viser ferdig utsending uten knapper', () => {
    const status: NewsletterStatus = {
      kind: 'sent', recipientCount: 10, sentCount: 9, failedCount: 1, completedAt: '2026-10-09T10:00:00.000Z', isLocked: false,
    }
    render(<NewsletterPanel articleId="a1" isPublished={false} status={status} />)
    expect(screen.getByText(/Sendt 9\. oktober 2026 til 10 mottakere/)).toBeTruthy()
    expect(screen.getByText(/1 kunne ikke leveres/)).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })
})
