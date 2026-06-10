import { describe, it, expect, vi } from 'vitest'

// Pure logic extracted for testing — mirrors sync.ts behaviour

const PRICE_CHANGE_THRESHOLD = 0.40

function isBrandRestricted(brand: string, restrictedBrands: Set<string>): boolean {
  return restrictedBrands.has(brand.toLowerCase())
}

function checkPriceSanity(
  proposedPrice: number,
  currentPrice:  number | null,
): { ok: boolean; reason?: string } {
  if (proposedPrice <= 0) {
    return { ok: false, reason: 'Pris er 0 eller negativ — avvist automatisk' }
  }
  if (currentPrice != null) {
    const change = Math.abs(proposedPrice - currentPrice) / currentPrice
    if (change > PRICE_CHANGE_THRESHOLD) {
      return {
        ok:     false,
        reason: `Prisendring på ${(change * 100).toFixed(1)} % overstiger 40 %-grensen`,
      }
    }
  }
  return { ok: true }
}

describe('Brand guard', () => {
  const restricted = new Set(['babolat'])

  it('avviser Babolat (eksakt match)', () => {
    expect(isBrandRestricted('Babolat', restricted)).toBe(true)
  })

  it('avviser babolat (case-insensitive)', () => {
    expect(isBrandRestricted('BABOLAT', restricted)).toBe(true)
  })

  it('tillater Bullpadel', () => {
    expect(isBrandRestricted('Bullpadel', restricted)).toBe(false)
  })

  it('tillater NOX', () => {
    expect(isBrandRestricted('NOX', restricted)).toBe(false)
  })

  it('tillater Wilson', () => {
    expect(isBrandRestricted('Wilson', restricted)).toBe(false)
  })
})

describe('Pris-sanity', () => {
  it('avviser pris = 0', () => {
    const result = checkPriceSanity(0, null)
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('0 eller negativ')
  })

  it('avviser negativ pris', () => {
    const result = checkPriceSanity(-5, null)
    expect(result.ok).toBe(false)
  })

  it('godtar ny pris uten eksisterende (ingen endring å sammenligne)', () => {
    const result = checkPriceSanity(199.95, null)
    expect(result.ok).toBe(true)
  })

  it('godtar endring <= 40 %', () => {
    expect(checkPriceSanity(139, 100).ok).toBe(true)  // 39 %
    expect(checkPriceSanity(61,  100).ok).toBe(true)  // 39 % ned
  })

  it('avviser endring > 40 % opp', () => {
    const result = checkPriceSanity(200, 100) // 100 %
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('%')
  })

  it('avviser endring > 40 % ned', () => {
    const result = checkPriceSanity(50, 100) // 50 % ned
    expect(result.ok).toBe(false)
  })

  it('grenseverdi: nøyaktig 40 % endring er godkjent', () => {
    const result = checkPriceSanity(140, 100) // 40.0 % — ikke over grensen
    expect(result.ok).toBe(true)
  })

  it('grenseverdi: 40.1 % avvises', () => {
    const result = checkPriceSanity(140.1, 100)
    expect(result.ok).toBe(false)
  })
})

describe('Fixtures adapter', () => {
  it('returnerer produkter med padelpoint_url', async () => {
    const { fixturesAdapter } = await import('@/lib/padelpoint/fixtures')
    const products = await fixturesAdapter.fetchProducts()
    expect(products.length).toBeGreaterThan(0)
    for (const p of products) {
      expect(p.padelpoint_url).toMatch(/^https:\/\//)
    }
  })

  it('inneholder et Babolat-produkt (for å teste brand-guard mot fixtures)', async () => {
    const { fixturesAdapter } = await import('@/lib/padelpoint/fixtures')
    const products = await fixturesAdapter.fetchProducts()
    const babolat = products.find(p => p.brand.toLowerCase() === 'babolat')
    expect(babolat).toBeDefined()
  })
})

describe('Scraper-stub', () => {
  it('returnerer tom liste (ingen nettverkskall)', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
    const { scraperStubAdapter } = await import('@/lib/padelpoint/scraper-stub')
    const products = await scraperStubAdapter.fetchProducts()
    expect(products).toHaveLength(0)
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
