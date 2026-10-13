import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({}) }))

import { scaledDimensions, pickOutputFormat } from '@/lib/images/compress'
import { validateImageFile } from '@/lib/articles/upload'

const MB = 1024 * 1024

describe('scaledDimensions', () => {
  it('lar små bilder være', () => {
    expect(scaledDimensions(1200, 800)).toEqual({ width: 1200, height: 800 })
  })
  it('skalerer ned brede bilder proporsjonalt', () => {
    expect(scaledDimensions(4032, 3024)).toEqual({ width: 2000, height: 1500 })
  })
  it('respekterer egen maksbredde', () => {
    expect(scaledDimensions(1000, 500, 500)).toEqual({ width: 500, height: 250 })
  })
})

describe('pickOutputFormat', () => {
  it('bruker WebP når nettleseren kan kode det', () => {
    expect(pickOutputFormat('image/webp')).toEqual({ contentType: 'image/webp', extension: 'webp' })
  })
  it('bruker JPEG når det er det vi fikk', () => {
    expect(pickOutputFormat('image/jpeg')).toEqual({ contentType: 'image/jpeg', extension: 'jpg' })
  })
  it('ber om JPEG-fallback når Safari gir PNG i stedet for WebP', () => {
    expect(pickOutputFormat('image/png')).toBeNull()
  })
})

describe('validateImageFile', () => {
  it('godtar vanlige bilder', () => {
    expect(validateImageFile({ type: 'image/jpeg', size: 3 * MB })).toBeNull()
  })
  it('avviser andre filtyper', () => {
    expect(validateImageFile({ type: 'application/pdf', size: MB })).toBe('Filen må være et bilde (JPG, PNG eller WebP)')
  })
  it('avviser HEIC med forklaring', () => {
    expect(validateImageFile({ type: 'image/heic', size: MB }))
      .toBe('iPhone-bilder (HEIC) støttes ikke. Eksporter som JPG først.')
  })
  it('avviser enorme filer', () => {
    expect(validateImageFile({ type: 'image/png', size: 25 * MB })).toBe('Bildet er for stort (maks 20 MB)')
  })
})
