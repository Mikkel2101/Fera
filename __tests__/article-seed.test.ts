// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { parseNorwegianDate, sqlText } from '@/scripts/generate-article-seed'

describe('parseNorwegianDate', () => {
  it('tolker norske datoer', () => {
    expect(parseNorwegianDate('20. mai 2026')).toBe('2026-05-20T12:00:00.000Z')
    expect(parseNorwegianDate('3. desember 2025')).toBe('2025-12-03T12:00:00.000Z')
  })
  it('kaster ved ukjent format', () => {
    expect(() => parseNorwegianDate('May 20, 2026')).toThrow('Ukjent dato')
  })
})

describe('sqlText', () => {
  it('escaper apostrof og håndterer null', () => {
    expect(sqlText("Padel'n")).toBe("'Padel''n'")
    expect(sqlText(null)).toBe('null')
  })
})
