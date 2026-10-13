import { z } from 'zod'

// Lister lagres i newsletter_subscribers.brands. Uten liste = vanlig nyhetsbrev.
// Bare 'nyhetsbrev' får artikkel-utsendingene; 'kolleksjon' er ventelista for egne varer.
export const GENERAL_LIST = 'nyhetsbrev'
export const NEWSLETTER_LISTS = [GENERAL_LIST, 'kolleksjon'] as const
export type NewsletterList = (typeof NEWSLETTER_LISTS)[number]

export type SubscribeRequest =
  | { ok: true; email: string; list: NewsletterList }
  | { ok: false; error: string }

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  list:  z.string().optional(),
})

export function parseSubscribeRequest(body: unknown): SubscribeRequest {
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return { ok: false, error: 'Ugyldig e-postadresse' }

  const { email, list } = parsed.data
  if (list === undefined) return { ok: true, email, list: GENERAL_LIST }
  if (!(NEWSLETTER_LISTS as readonly string[]).includes(list)) {
    return { ok: false, error: 'Ukjent liste' }
  }
  return { ok: true, email, list: list as NewsletterList }
}

export function addList(existing: readonly string[], list: string): string[] {
  return existing.includes(list) ? [...existing] : [...existing, list]
}
