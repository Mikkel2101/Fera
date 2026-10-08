import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  isSafeHref, isAllowedImageSrc, sanitizeDoc, readingTimeMinutes,
} from '@/lib/articles/content'

const PREFIX = 'https://test.supabase.co/storage/v1/object/public/'

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co'))
afterEach(() => vi.unstubAllEnvs())

describe('isSafeHref', () => {
  it.each(['https://ferapadel.com', 'http://example.com/x', 'mailto:hei@fera.no', '/travels', '/travels/inspirasjon'])(
    'godtar %s', (href) => expect(isSafeHref(href)).toBe(true),
  )
  it.each(['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,hi', '//evil.com', 'vbscript:x', '', 'ikke en url', 42, null, '/\\evil.com', '/\t/evil.com', '/\n/evil.com', '/\\\\evil.com'])(
    'avviser %s', (href) => expect(isSafeHref(href)).toBe(false),
  )
})

describe('isAllowedImageSrc', () => {
  it('godtar bilder fra prosjektets Storage', () => {
    expect(isAllowedImageSrc(`${PREFIX}articles/a/b.webp`)).toBe(true)
    expect(isAllowedImageSrc(`${PREFIX}photos/palm-sunset.jpg`)).toBe(true)
  })
  it('avviser andre domener og ikke-strenger', () => {
    expect(isAllowedImageSrc('https://evil.com/x.jpg')).toBe(false)
    expect(isAllowedImageSrc('https://test.supabase.co.evil.com/storage/v1/object/public/x.jpg')).toBe(false)
    expect(isAllowedImageSrc(undefined)).toBe(false)
  })
  it('avviser alt når Supabase-URL mangler', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    expect(isAllowedImageSrc(`${PREFIX}x.jpg`)).toBe(false)
  })
})

describe('sanitizeDoc', () => {
  it('returnerer tomt dokument for ugyldig input', () => {
    expect(sanitizeDoc(null)).toEqual({ type: 'doc', content: [] })
    expect(sanitizeDoc({ type: 'paragraph' })).toEqual({ type: 'doc', content: [] })
  })

  it('beholder tillatte noder og marks', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Tittel' }] },
        { type: 'paragraph', content: [
          { type: 'text', text: 'fet', marks: [{ type: 'bold' }] },
          { type: 'hardBreak' },
          { type: 'text', text: 'lenke', marks: [{ type: 'link', attrs: { href: '/travels', target: '_blank' } }] },
        ] },
      ],
    }
    expect(sanitizeDoc(doc)).toEqual({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Tittel' }] },
        { type: 'paragraph', content: [
          { type: 'text', text: 'fet', marks: [{ type: 'bold' }] },
          { type: 'hardBreak' },
          { type: 'text', text: 'lenke', marks: [{ type: 'link', attrs: { href: '/travels' } }] },
        ] },
      ],
    })
  })

  it('fjerner ukjente noder og marks (innlimt fra Word/Docs)', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'table', content: [] },
        { type: 'codeBlock', content: [{ type: 'text', text: 'x' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'farget', marks: [{ type: 'textStyle', attrs: { color: 'red' } }, { type: 'italic' }] }] },
      ],
    }
    expect(sanitizeDoc(doc)).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'farget', marks: [{ type: 'italic' }] }] }],
    })
  })

  it('fjerner farlige lenker men beholder teksten', () => {
    const doc = { type: 'doc', content: [{ type: 'paragraph', content: [
      { type: 'text', text: 'klikk', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] },
    ] }] }
    expect(sanitizeDoc(doc)).toEqual({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'klikk' }] }] })
  })

  it('fjerner bilder fra fremmede domener og normaliserer alt', () => {
    const doc = { type: 'doc', content: [
      { type: 'image', attrs: { src: 'https://evil.com/x.jpg', alt: 'x' } },
      { type: 'image', attrs: { src: `${PREFIX}articles/a.webp`, title: 'ignoreres' } },
    ] }
    expect(sanitizeDoc(doc)).toEqual({ type: 'doc', content: [
      { type: 'image', attrs: { src: `${PREFIX}articles/a.webp`, alt: '' } },
    ] })
  })

  it('tvinger overskriftsnivå til 2 eller 3 og hopper over søppel-noder', () => {
    const doc = { type: 'doc', content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'H1' }] },
      'ikke et objekt',
      { type: 'text', text: '' },
    ] }
    expect(sanitizeDoc(doc)).toEqual({ type: 'doc', content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'H1' }] },
    ] })
  })
})

describe('readingTimeMinutes', () => {
  const words = (n: number) => Array.from({ length: n }, () => 'ord').join(' ')
  it('er minst 1 minutt', () => {
    expect(readingTimeMinutes({ type: 'doc', content: [] })).toBe(1)
  })
  it('regner 200 ord per minutt og runder opp', () => {
    const doc = { type: 'doc' as const, content: [
      { type: 'paragraph', content: [{ type: 'text', text: words(250) }] },
      { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: words(160) }] }] }] },
    ] }
    expect(readingTimeMinutes(doc)).toBe(3)
  })
})
