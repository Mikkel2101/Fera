import { createHmac, timingSafeEqual } from 'node:crypto'

const MAX_EMAIL_LENGTH = 320
const BASE64URL = /^[A-Za-z0-9_-]+$/
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+$/

export type UnsubscribeLinks = { page: string; oneClick: string }

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function signEmail(email: string, secret: string): string {
  if (!secret) throw new Error('Mangler hemmelighet for avmeldingstoken')
  return createHmac('sha256', secret).update(normalizeEmail(email)).digest('base64url')
}

export function encodeEmail(email: string): string {
  return Buffer.from(normalizeEmail(email), 'utf8').toString('base64url')
}

export function decodeEmail(value: string): string | null {
  if (!BASE64URL.test(value)) return null
  const email = normalizeEmail(Buffer.from(value, 'base64url').toString('utf8'))
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_SHAPE.test(email) ? email : null
}

// Gir e-posten (små bokstaver) når lenken er ekte, ellers null.
export function verifyUnsubscribe(
  encodedEmail: string | null | undefined,
  token: string | null | undefined,
  secret: string,
): string | null {
  if (!encodedEmail || !token || !secret) return null
  const email = decodeEmail(encodedEmail)
  if (!email) return null
  const expected = Buffer.from(signEmail(email, secret))
  const given = Buffer.from(token)
  return expected.length === given.length && timingSafeEqual(expected, given) ? email : null
}

export function unsubscribeLinks(email: string, secret: string, siteUrl: string): UnsubscribeLinks {
  const query = `e=${encodeEmail(email)}&t=${signEmail(email, secret)}`
  return {
    page: `${siteUrl}/nyhetsbrev/avmeld?${query}`,
    oneClick: `${siteUrl}/api/nyhetsbrev/avmeld?${query}`,
  }
}
