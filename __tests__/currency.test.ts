import { describe, it, expect } from 'vitest'
import { eurToNok, formatNok } from '@/lib/currency'

describe('eurToNok', () => {
  it('runder til nærmeste 10', () => {
    // 200 * 11.80 * 1.03 = 2431.2 → 2430
    expect(eurToNok(200, 11.80)).toBe(2430)
  })

  it('runder ned', () => {
    // 145 * 11.80 * 1.03 = 1762.93 → 1760
    expect(eurToNok(145, 11.80)).toBe(1760)
  })

  it('bruker angitt rate korrekt', () => {
    const expected = Math.round(100 * 12.00 * 1.03 / 10) * 10
    expect(eurToNok(100, 12.00)).toBe(expected)
  })

  it('håndterer 0', () => {
    expect(eurToNok(0, 11.80)).toBe(0)
  })
})

describe('formatNok', () => {
  it('formaterer med nb-NO locale og kr suffix', () => {
    expect(formatNok(2360)).toBe('2 360 kr')
  })

  it('formaterer tre-sifret tall', () => {
    expect(formatNok(890)).toBe('890 kr')
  })
})
