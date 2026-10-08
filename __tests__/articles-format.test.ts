import { describe, it, expect } from 'vitest'
import { formatArticleDate, toDateInput, fromDateInput, keepPublishedTime } from '@/lib/articles/format'

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
  it('bruker Oslo-dato om sommeren (00:30 CEST er fortsatt forrige dag i UTC)', () => {
    expect(toDateInput('2026-05-20T22:30:00.000Z')).toBe('2026-05-21')
  })
  it('bruker Oslo-dato om vinteren (00:30 CET)', () => {
    expect(toDateInput('2026-01-15T23:30:00.000Z')).toBe('2026-01-16')
    expect(toDateInput('2026-01-15T22:30:00.000Z')).toBe('2026-01-15')
  })
  it('stemmer med visningsdatoen', () => {
    const iso = '2026-05-20T23:30:00.000Z'
    expect(formatArticleDate(iso)).toBe('21. mai 2026')
    expect(toDateInput(iso)).toBe('2026-05-21')
  })
  it('konverterer datofelt til ISO ved middag UTC', () => {
    expect(fromDateInput('2026-05-20')).toBe('2026-05-20T12:00:00.000Z')
  })
  it('gir null for tom eller ugyldig verdi', () => {
    expect(fromDateInput('')).toBeNull()
    expect(fromDateInput('20.05.2026')).toBeNull()
  })
})

describe('keepPublishedTime', () => {
  const previous = '2026-05-20T22:30:00.000Z' // 21. mai 00:30 i Oslo

  it('beholder eksisterende tidspunkt når Oslo-datoen er uendret', () => {
    expect(keepPublishedTime('2026-05-21T12:00:00.000Z', previous)).toBe(previous)
  })
  it('bruker ny verdi når datoen er endret', () => {
    expect(keepPublishedTime('2026-05-22T12:00:00.000Z', previous)).toBe('2026-05-22T12:00:00.000Z')
  })
  it('bruker ny verdi når det ikke fantes noen dato fra før', () => {
    expect(keepPublishedTime('2026-05-22T12:00:00.000Z', null)).toBe('2026-05-22T12:00:00.000Z')
  })
  it('lar tom dato være tom', () => {
    expect(keepPublishedTime(null, previous)).toBeNull()
  })
})
