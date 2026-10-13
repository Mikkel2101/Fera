import { createHash } from 'node:crypto'
import type { EmailMessage } from './compose'

export const BATCH_SIZE = 100 // Resends grense per batch-kall
export const TIME_BUDGET_MS = 240_000 // under maxDuration (300 s) på admin-siden
const BATCH_PAUSE_MS = 600 // Resend tillater 2 kall i sekundet på standardplanen

export type DeliveryResult = {
  email: string
  status: 'sent' | 'failed'
  resend_id: string | null
  error: string | null
}

export type SendStore = {
  claim(sendId: string): Promise<boolean>
  nextPending(sendId: string, limit: number): Promise<string[]>
  record(sendId: string, results: DeliveryResult[]): Promise<void>
  release(sendId: string): Promise<void>
}

export type MailResult = { id: string | null; error: string | null }

// ok: false betyr at hele kallet feilet (nettverk, 5xx, rate limit) — ingen ble sendt.
export type BatchMailer = (
  messages: EmailMessage[],
  idempotencyKey: string,
) => Promise<{ ok: true; results: MailResult[] } | { ok: false; error: string }>

export type RunResult = {
  status: 'done' | 'locked' | 'interrupted' | 'time_budget'
  sent: number
  failed: number
  error?: string
}

type SendDeps = {
  store: SendStore
  mailer: BatchMailer
  compose: (email: string) => EmailMessage
  now?: () => number
  sleep?: (ms: number) => Promise<void>
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// Samme utsending + samme mottakere gir samme nøkkel. Krasjer vi etter at Resend
// har sendt, men før databasen er oppdatert, sender Resend ikke på nytt (24 t).
export function batchIdempotencyKey(sendId: string, emails: readonly string[]): string {
  const hash = createHash('sha256').update(emails.join('\n')).digest('hex').slice(0, 40)
  return `newsletter/${sendId}/${hash}`
}

// Resend (permissive) gir id-er bare for e-postene som gikk gjennom, og feil med indeks.
export function toPositionalResults(
  count: number,
  ids: ReadonlyArray<{ id: string }>,
  errors: ReadonlyArray<{ index: number; message: string }>,
): MailResult[] {
  const errorByIndex = new Map(errors.map((e) => [e.index, e.message]))
  const remainingIds = ids.map((entry) => entry.id)
  return Array.from({ length: count }, (_, index): MailResult => {
    const error = errorByIndex.get(index)
    if (error !== undefined) return { id: null, error }
    const id = remainingIds.shift()
    return id ? { id, error: null } : { id: null, error: 'Mangler svar fra e-posttjenesten' }
  })
}

function toDelivery(email: string, result: MailResult | undefined): DeliveryResult {
  if (result?.id && !result.error) return { email, status: 'sent', resend_id: result.id, error: null }
  return { email, status: 'failed', resend_id: null, error: result?.error ?? 'Mangler svar fra e-posttjenesten' }
}

export async function runNewsletterSend(sendId: string, deps: SendDeps): Promise<RunResult> {
  const { store, mailer, compose, now = Date.now, sleep = defaultSleep } = deps
  if (!(await store.claim(sendId))) return { status: 'locked', sent: 0, failed: 0 }

  const started = now()
  let sent = 0
  let failed = 0
  try {
    for (;;) {
      const emails = await store.nextPending(sendId, BATCH_SIZE)
      if (emails.length === 0) return { status: 'done', sent, failed }

      if (now() - started >= TIME_BUDGET_MS) {
        await store.release(sendId)
        return { status: 'time_budget', sent, failed }
      }

      const outcome = await mailer(emails.map(compose), batchIdempotencyKey(sendId, emails))
      if (!outcome.ok) {
        await store.release(sendId)
        return { status: 'interrupted', sent, failed, error: outcome.error }
      }

      const deliveries = emails.map((email, i) => toDelivery(email, outcome.results[i]))
      await store.record(sendId, deliveries)
      sent += deliveries.filter((d) => d.status === 'sent').length
      failed += deliveries.filter((d) => d.status === 'failed').length

      if (emails.length < BATCH_SIZE) return { status: 'done', sent, failed }
      await sleep(BATCH_PAUSE_MS)
    }
  } catch (error) {
    // Låsen frigis så admin kan fortsette; pending-mottakere sendes med samme nøkkel.
    await store.release(sendId).catch(() => {})
    throw error
  }
}
