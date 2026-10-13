import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { EmailMessage } from '@/lib/newsletter/compose'
import type { BatchMailer, SendStore } from '@/lib/newsletter/send'

const rpc = vi.fn()
const sentMessages: EmailMessage[] = []
let article: Record<string, unknown> | null = null
let pending: string[] = []

vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: async () => ({ supabase: { rpc }, user: { id: 'u1', email: 'mikkel@ferabrand.com' } }),
}))
vi.mock('@/lib/articles/queries', () => ({ getArticleForAdmin: async () => article }))
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))
vi.mock('@/lib/newsletter/runtime', () => ({
  resendBatchMailer: (): BatchMailer => async (messages) => {
    sentMessages.push(...messages)
    return { ok: true, results: messages.map((m) => ({ id: `id-${m.to}`, error: null })) }
  },
  supabaseSendStore: (): SendStore => ({
    claim: async () => true,
    nextPending: async (_id, limit) => pending.slice(0, limit),
    record: async (_id, results) => { pending = pending.filter((e) => !results.some((r) => r.email === e)) },
    release: async () => {},
  }),
  findSendIdForArticle: async () => 'send-1',
}))

import { sendNewsletterTest, startNewsletter, resumeNewsletter } from '@/lib/actions/newsletter'

const published = {
  id: 'a1', slug: 'tur', title: 'Tur til Albir', excerpt: 'Ingress', category: 'Reiserapport',
  cover_image: null, cover_image_alt: null, meta_description: null, author_name: 'Petter',
  content: { type: 'doc', content: [] }, status: 'published', published_at: '2026-05-20T12:00:00.000Z', updated_at: '',
}

beforeEach(() => {
  vi.stubEnv('RESEND_API_KEY', 're_test')
  vi.stubEnv('NEWSLETTER_UNSUBSCRIBE_SECRET', 'x'.repeat(40))
  rpc.mockReset()
  sentMessages.length = 0
  article = published
  pending = []
})
afterEach(() => vi.unstubAllEnvs())

describe('sendNewsletterTest', () => {
  it('sender én test til innlogget admin med [Test] i emnet', async () => {
    const result = await sendNewsletterTest('a1')
    expect(result).toEqual({ ok: true, data: { to: 'mikkel@ferabrand.com' } })
    expect(sentMessages).toHaveLength(1)
    expect(sentMessages[0]).toMatchObject({ to: 'mikkel@ferabrand.com', subject: '[Test] Tur til Albir' })
    expect(rpc).not.toHaveBeenCalled()
  })

  it('avviser upubliserte artikler', async () => {
    article = { ...published, status: 'draft' }
    const result = await sendNewsletterTest('a1')
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining('publiserte') })
    expect(sentMessages).toHaveLength(0)
  })
})

describe('startNewsletter', () => {
  it('nekter å sende uten avmeldingshemmelighet', async () => {
    vi.stubEnv('NEWSLETTER_UNSUBSCRIBE_SECRET', '')
    const result = await startNewsletter('a1')
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining('NEWSLETTER_UNSUBSCRIBE_SECRET') })
    expect(rpc).not.toHaveBeenCalled()
  })

  it('nekter å sende uten Resend-nøkkel', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const result = await startNewsletter('a1')
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining('RESEND_API_KEY') })
    expect(rpc).not.toHaveBeenCalled()
  })

  it('gir norsk melding når artikkelen allerede er sendt', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'already_sent', code: 'P0001' } })
    const result = await startNewsletter('a1')
    expect(result).toEqual({ ok: false, error: 'Denne artikkelen er allerede sendt som nyhetsbrev.' })
    expect(sentMessages).toHaveLength(0)
  })

  it('starter utsending og sender til alle frosne mottakere', async () => {
    rpc.mockResolvedValue({ data: 'send-1', error: null })
    pending = ['a@x.no', 'b@x.no']
    const result = await startNewsletter('a1')
    expect(rpc).toHaveBeenCalledWith('start_newsletter_send', { p_article_id: 'a1' })
    expect(result).toEqual({ ok: true, data: { status: 'done', sent: 2, failed: 0 } })
    expect(sentMessages.map((m) => m.to)).toEqual(['a@x.no', 'b@x.no'])
    expect(sentMessages[0].subject).toBe('Tur til Albir')
  })
})

describe('resumeNewsletter', () => {
  it('fortsetter ikke hvis artikkelen er avpublisert', async () => {
    article = { ...published, status: 'draft' }
    pending = ['a@x.no']
    const result = await resumeNewsletter('a1')
    expect(result).toEqual({ ok: false, error: 'Bare publiserte artikler kan sendes som nyhetsbrev.' })
    expect(sentMessages).toEqual([])
  })

  it('sender til resten av de frosne mottakerne', async () => {
    pending = ['b@x.no']
    const result = await resumeNewsletter('a1')
    expect(result).toEqual({ ok: true, data: { status: 'done', sent: 1, failed: 0 } })
    expect(sentMessages.map((m) => m.to)).toEqual(['b@x.no'])
  })
})
