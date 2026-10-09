import { describe, it, expect, vi } from 'vitest'
import {
  runNewsletterSend, batchIdempotencyKey, toPositionalResults,
  BATCH_SIZE, TIME_BUDGET_MS,
  type BatchMailer, type DeliveryResult, type SendStore,
} from '@/lib/newsletter/send'
import type { EmailMessage } from '@/lib/newsletter/compose'

const SEND_ID = 'send-1'

function emails(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `user${String(i).padStart(4, '0')}@example.no`)
}

// Minne-store som oppfører seg som SQL-funksjonene: pending sortert på e-post.
function memoryStore(recipients: string[], { canClaim = true } = {}) {
  const status = new Map(recipients.map((email) => [email, 'pending' as string]))
  const store: SendStore & { released: number; recorded: DeliveryResult[] } = {
    released: 0,
    recorded: [],
    claim: vi.fn(async () => canClaim),
    nextPending: async (_id, limit) =>
      [...status].filter(([, s]) => s === 'pending').map(([e]) => e).sort().slice(0, limit),
    record: async (_id, results) => {
      for (const r of results) status.set(r.email, r.status)
      store.recorded.push(...results)
    },
    release: async () => { store.released += 1 },
  }
  return { store, status }
}

const compose = (email: string): EmailMessage => ({ to: email, subject: 'S', html: '<p>h</p>', text: 't', headers: {} })
const noSleep = async () => {}

function okMailer(): BatchMailer & { calls: Array<{ count: number; key: string }> } {
  const calls: Array<{ count: number; key: string }> = []
  const mailer = (async (messages: EmailMessage[], key: string) => {
    calls.push({ count: messages.length, key })
    return { ok: true as const, results: messages.map((m) => ({ id: `id-${m.to}`, error: null })) }
  }) as BatchMailer & { calls: typeof calls }
  mailer.calls = calls
  return mailer
}

describe('runNewsletterSend', () => {
  it('sender i batcher på maks 100 og merker alle som sendt', async () => {
    const { store, status } = memoryStore(emails(250))
    const mailer = okMailer()
    const result = await runNewsletterSend(SEND_ID, { store, mailer, compose, sleep: noSleep })
    expect(mailer.calls.map((c) => c.count)).toEqual([100, 100, 50])
    expect(result).toEqual({ status: 'done', sent: 250, failed: 0 })
    expect([...status.values()].every((s) => s === 'sent')).toBe(true)
    expect(BATCH_SIZE).toBe(100)
  })

  it('merker adresser Resend avviser som feilet og sender resten', async () => {
    const { store, status } = memoryStore(emails(3))
    const mailer: BatchMailer = async (messages) => ({
      ok: true,
      results: messages.map((m, i) => (i === 1 ? { id: null, error: 'Invalid `to` field' } : { id: `id-${i}`, error: null })),
    })
    const result = await runNewsletterSend(SEND_ID, { store, mailer, compose, sleep: noSleep })
    expect(result).toEqual({ status: 'done', sent: 2, failed: 1 })
    expect(status.get('user0001@example.no')).toBe('failed')
    expect(store.recorded.find((r) => r.email === 'user0001@example.no')?.error).toBe('Invalid `to` field')
  })

  it('stopper ved API-feil, lar resten stå som pending og frigir låsen', async () => {
    const { store, status } = memoryStore(emails(150))
    let call = 0
    const mailer: BatchMailer = async (messages) => {
      call += 1
      if (call === 2) return { ok: false, error: 'rate_limit_exceeded' }
      return { ok: true, results: messages.map(() => ({ id: 'x', error: null })) }
    }
    const result = await runNewsletterSend(SEND_ID, { store, mailer, compose, sleep: noSleep })
    expect(result).toEqual({ status: 'interrupted', sent: 100, failed: 0, error: 'rate_limit_exceeded' })
    expect([...status.values()].filter((s) => s === 'pending')).toHaveLength(50)
    expect(store.released).toBe(1)
  })

  it('sender ingenting når utsendingen er låst av en annen', async () => {
    const { store } = memoryStore(emails(5), { canClaim: false })
    const mailer = okMailer()
    const result = await runNewsletterSend(SEND_ID, { store, mailer, compose, sleep: noSleep })
    expect(result).toEqual({ status: 'locked', sent: 0, failed: 0 })
    expect(mailer.calls).toHaveLength(0)
  })

  it('setter utsendingen på pause når tidsbudsjettet er brukt opp', async () => {
    const { store, status } = memoryStore(emails(250))
    const mailer = okMailer()
    let clock = 0
    const now = () => clock
    const sleep = async () => { clock += TIME_BUDGET_MS }
    const result = await runNewsletterSend(SEND_ID, { store, mailer, compose, now, sleep })
    expect(result.status).toBe('time_budget')
    expect(mailer.calls).toHaveLength(1)
    expect([...status.values()].filter((s) => s === 'pending')).toHaveLength(150)
    expect(store.released).toBe(1)
  })

  it('frigir låsen og kaster videre når registrering feiler', async () => {
    const { store } = memoryStore(emails(2))
    store.record = async () => { throw new Error('db nede') }
    await expect(runNewsletterSend(SEND_ID, { store, mailer: okMailer(), compose, sleep: noSleep })).rejects.toThrow('db nede')
    expect(store.released).toBe(1)
  })

  it('bruker samme idempotensnøkkel når samme batch sendes på nytt etter krasj', async () => {
    const { store } = memoryStore(emails(3))
    store.record = async () => { throw new Error('krasj etter sending') }
    const first = okMailer()
    await expect(runNewsletterSend(SEND_ID, { store, mailer: first, compose, sleep: noSleep })).rejects.toThrow()

    const { store: retryStore } = memoryStore(emails(3))
    const second = okMailer()
    await runNewsletterSend(SEND_ID, { store: retryStore, mailer: second, compose, sleep: noSleep })
    expect(second.calls[0].key).toBe(first.calls[0].key)
  })
})

describe('batchIdempotencyKey', () => {
  it('er stabil for samme utsending og mottakere, og ulik ellers', () => {
    const a = batchIdempotencyKey(SEND_ID, ['a@x.no', 'b@x.no'])
    expect(a).toBe(batchIdempotencyKey(SEND_ID, ['a@x.no', 'b@x.no']))
    expect(a).not.toBe(batchIdempotencyKey(SEND_ID, ['a@x.no', 'c@x.no']))
    expect(a).not.toBe(batchIdempotencyKey('send-2', ['a@x.no', 'b@x.no']))
    expect(a.startsWith(`newsletter/${SEND_ID}/`)).toBe(true)
    expect(a.length).toBeLessThanOrEqual(256)
  })
})

describe('toPositionalResults', () => {
  it('fordeler id-er på e-postene som ikke feilet, i rekkefølge', () => {
    expect(toPositionalResults(4, [{ id: 'a' }, { id: 'b' }, { id: 'c' }], [{ index: 1, message: 'ugyldig' }])).toEqual([
      { id: 'a', error: null },
      { id: null, error: 'ugyldig' },
      { id: 'b', error: null },
      { id: 'c', error: null },
    ])
  })

  it('markerer manglende svar som feil', () => {
    expect(toPositionalResults(2, [{ id: 'a' }], [])).toEqual([
      { id: 'a', error: null },
      { id: null, error: 'Mangler svar fra e-posttjenesten' },
    ])
  })
})
