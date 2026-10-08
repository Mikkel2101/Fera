import { describe, it, expect } from 'vitest'
import { safeNextPath } from '@/lib/auth/next-path'

describe('safeNextPath', () => {
  it('beholder interne stier', () => {
    expect(safeNextPath('/travels/abc/book')).toBe('/travels/abc/book')
  })

  it('faller tilbake til / når verdien mangler', () => {
    expect(safeNextPath(null)).toBe('/')
    expect(safeNextPath(undefined)).toBe('/')
  })

  it('avviser eksterne URL-er (åpen redirect)', () => {
    expect(safeNextPath('https://evil.example')).toBe('/')
  })

  it('avviser protokoll-relative URL-er', () => {
    expect(safeNextPath('//evil.example')).toBe('/')
  })

  it('avviser backslash-triks som nettlesere tolker som //', () => {
    expect(safeNextPath('/\\evil.example')).toBe('/')
  })
})
