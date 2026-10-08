import { describe, it, expect } from 'vitest'
import { toNewsletterStatus } from '@/lib/newsletter/status'

const NOW = Date.parse('2026-10-09T10:00:00.000Z')
const row = {
  status: 'sending',
  recipient_count: 10,
  sent_count: 4,
  failed_count: 1,
  locked_until: null as string | null,
  completed_at: null as string | null,
}

describe('toNewsletterStatus', () => {
  it('gir ikke sendt med antall mottakere når det ikke finnes noen utsending', () => {
    expect(toNewsletterStatus(null, 7, NOW)).toEqual({ kind: 'not_sent', recipientCount: 7 })
  })

  it('viser pågående utsending som låst mens låsen er gyldig', () => {
    const status = toNewsletterStatus({ ...row, locked_until: '2026-10-09T10:03:00.000Z' }, 0, NOW)
    expect(status).toEqual({
      kind: 'sending', recipientCount: 10, sentCount: 4, failedCount: 1, completedAt: null, isLocked: true,
    })
  })

  it('viser avbrutt utsending som ulåst når låsen er utløpt', () => {
    const status = toNewsletterStatus({ ...row, locked_until: '2026-10-09T09:59:00.000Z' }, 0, NOW)
    expect(status).toMatchObject({ kind: 'sending', isLocked: false })
  })

  it('viser ferdig utsending', () => {
    const status = toNewsletterStatus(
      { ...row, status: 'sent', sent_count: 9, completed_at: '2026-10-09T09:00:00.000Z' }, 0, NOW,
    )
    expect(status).toMatchObject({ kind: 'sent', sentCount: 9, failedCount: 1, completedAt: '2026-10-09T09:00:00.000Z' })
  })
})
