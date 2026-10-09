export type NewsletterConfig = {
  from: string
  replyTo: string
  senderInfo: string
  siteUrl: string
  secret: string
}

type Env = Record<string, string | undefined>

export const CONTACT_EMAIL = 'post@ferabrand.com'
const MIN_SECRET_LENGTH = 32

// Standardvalg til Mikkel bestemmer noe annet — alle kan overstyres i Vercel.
const DEFAULTS = {
  from: 'Fera Padel <nyhetsbrev@ferabrand.com>',
  replyTo: CONTACT_EMAIL,
  senderInfo: `Fera Padel · ferapadel.com · ${CONTACT_EMAIL}`,
  siteUrl: 'https://ferapadel.com',
}

function valueOr(env: Env, key: string, fallback: string): string {
  const raw = env[key]?.trim()
  return raw ? raw : fallback
}

export function readUnsubscribeSecret(env: Env = process.env): string | null {
  const secret = env.NEWSLETTER_UNSUBSCRIBE_SECRET?.trim() ?? ''
  return secret.length >= MIN_SECRET_LENGTH ? secret : null
}

// Kaster uten hemmelighet: da kan ingen avmeldingslenke lages, og vi sender
// aldri markedsføring uten fungerende avmelding (markedsføringsloven § 15).
export function newsletterConfig(env: Env = process.env): NewsletterConfig {
  const secret = readUnsubscribeSecret(env)
  if (!secret) {
    throw new Error(`NEWSLETTER_UNSUBSCRIBE_SECRET mangler eller er kortere enn ${MIN_SECRET_LENGTH} tegn`)
  }
  return {
    from: valueOr(env, 'NEWSLETTER_FROM', DEFAULTS.from),
    replyTo: valueOr(env, 'NEWSLETTER_REPLY_TO', DEFAULTS.replyTo),
    senderInfo: valueOr(env, 'NEWSLETTER_SENDER_INFO', DEFAULTS.senderInfo),
    siteUrl: valueOr(env, 'NEWSLETTER_SITE_URL', DEFAULTS.siteUrl).replace(/\/+$/, ''),
    secret,
  }
}
