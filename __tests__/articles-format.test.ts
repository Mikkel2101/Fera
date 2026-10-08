import { describe, it, expect } from 'vitest'
import { formatArticleDate, toDateInput, fromDateInput } from '@/lib/articles/format'

describe('formatArticleDate', () => {
  it('formaterer på norsk', () => {
    expect(formatArticleDate('2026-05-20T12:00:00.000Z')).toBe('20. mai 2026')
  })
  it('bruker Oslo-tid (sent UTC-kveld er neste dag i Norge)', () => {
    expect(formatArticleDate('2026-05-20T23:30:00.000Z')).toBe('21. mai 2026')
  })
  it('gir tom streng for null', () => {
    expect(formatArticleDate(null)).toBe('')
  })
})

describe('toDateInput / fromDateInput', () => {
  it('konverterer ISO til datofelt', () => {
    expect(toDateInput('2026-05-20T12:00:00.000Z')).toBe('2026-05-20')
    expect(toDateInput(null)).toBe('')
  })
  it('konverterer datofelt til ISO ved middag UTC', () => {
    expect(fromDateInput('2026-05-20')).toBe('2026-05-20T12:00:00.000Z')
  })
  it('gir null for tom eller ugyldig verdi', () => {
    expect(fromDateInput('')).toBeNull()
    expect(fromDateInput('20.05.2026')).toBeNull()
  })
})
