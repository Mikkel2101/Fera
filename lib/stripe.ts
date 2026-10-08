import Stripe from 'stripe'

// Klienten lages ved bruk, ikke ved import: `next build` laster API-rutene,
// og en klient på modulnivå krever da STRIPE_SECRET_KEY i alle miljøer.
// Stripe kobles på først når Fera AS er stiftet — til da skal bygget gå uten nøkkel.

// vipps_preview=v1 krever at preview-flagget er en del av Stripe-Version-headeren
const API_VERSIONS = {
  checkout: '2026-05-27.dahlia; vipps_preview=v1',
  webhook:  '2026-05-27.dahlia',
} as const

export type StripeUse = keyof typeof API_VERSIONS

export function getStripe(use: StripeUse): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY mangler')
  return new Stripe(key, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: API_VERSIONS[use] as any,
  })
}
