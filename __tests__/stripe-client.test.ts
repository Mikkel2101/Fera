import { describe, it, expect, afterEach, vi } from 'vitest'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'

describe('getStripe', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('kaster tydelig feil når nøkkelen mangler ved bruk', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '')
    expect(() => getStripe('checkout')).toThrow('STRIPE_SECRET_KEY mangler')
  })

  it('lager en Stripe-klient når nøkkelen finnes', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123')
    expect(getStripe('checkout')).toBeInstanceOf(Stripe)
    expect(getStripe('webhook')).toBeInstanceOf(Stripe)
  })
})
