import { createServiceClient } from '@/lib/supabase/service'
import { readUnsubscribeSecret } from './config'
import { verifyUnsubscribe } from './token'

export type UnsubscribeOutcome = 'ok' | 'invalid' | 'error'

type Deps = {
  secret?: string | null
  remove?: (email: string) => Promise<boolean>
}

// Service role, fordi mottakeren ikke er innlogget. Tilgangen er HMAC-lenken.
async function removeWithServiceRole(email: string): Promise<boolean> {
  const { error } = await createServiceClient().rpc('newsletter_unsubscribe', { p_email: email })
  if (error) console.error('[newsletter] avmelding feilet', error.message)
  return !error
}

// Idempotent: en adresse som ikke (lenger) står på listen gir også 'ok'.
export async function unsubscribe(
  encodedEmail: string | null | undefined,
  token: string | null | undefined,
  deps: Deps = {},
): Promise<UnsubscribeOutcome> {
  const secret = deps.secret === undefined ? readUnsubscribeSecret() : deps.secret
  if (!secret) {
    console.error('[newsletter] NEWSLETTER_UNSUBSCRIBE_SECRET mangler — avmelding er ikke mulig')
    return 'error'
  }
  const email = verifyUnsubscribe(encodedEmail, token, secret)
  if (!email) return 'invalid'
  try {
    return (await (deps.remove ?? removeWithServiceRole)(email)) ? 'ok' : 'error'
  } catch (error) {
    console.error('[newsletter] avmelding kastet', error)
    return 'error'
  }
}
