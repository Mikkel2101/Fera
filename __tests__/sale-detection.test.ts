import { describe, it, expect } from 'vitest'
import { computeSaleFields } from '@/lib/padelpoint/sync'

describe('computeSaleFields', () => {
  it('nytt produkt → ikke salg', () => {
    expect(computeSaleFields(200, null)).toEqual({ is_on_sale: false, previous_price_eur: null })
  })

  it('prisen faller 11 % → salg, previous = gammel pris', () => {
    const existing = { price_eur: 200, is_on_sale: false, previous_price_eur: null, name: 'Test' }
    expect(computeSaleFields(178, existing)).toEqual({ is_on_sale: true, previous_price_eur: 200 })
  })

  it('allerede på salg, pris faller videre → behold original previous_price_eur', () => {
    const existing = { price_eur: 178, is_on_sale: true, previous_price_eur: 200, name: 'Test' }
    expect(computeSaleFields(150, existing)).toEqual({ is_on_sale: true, previous_price_eur: 200 })
  })

  it('pris faller nøyaktig 10 % → ikke salg (threshold er >10 %)', () => {
    const existing = { price_eur: 200, is_on_sale: false, previous_price_eur: null, name: 'Test' }
    expect(computeSaleFields(180, existing)).toEqual({ is_on_sale: false, previous_price_eur: null })
  })

  it('pris faller 10.1 % → salg', () => {
    const existing = { price_eur: 200, is_on_sale: false, previous_price_eur: null, name: 'Test' }
    expect(computeSaleFields(179.8, existing)).toEqual({ is_on_sale: true, previous_price_eur: 200 })
  })

  it('pris går opp → salg avsluttet', () => {
    const existing = { price_eur: 178, is_on_sale: true, previous_price_eur: 200, name: 'Test' }
    expect(computeSaleFields(195, existing)).toEqual({ is_on_sale: false, previous_price_eur: null })
  })

  it('pris uendret → ingen salg', () => {
    const existing = { price_eur: 200, is_on_sale: false, previous_price_eur: null, name: 'Test' }
    expect(computeSaleFields(200, existing)).toEqual({ is_on_sale: false, previous_price_eur: null })
  })
})
