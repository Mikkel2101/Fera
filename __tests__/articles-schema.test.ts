import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  slugify, articleMetaSchema, fieldErrors, missingForPublish, mapDbError,
} from '@/lib/articles/schema'

const IMG = 'https://test.supabase.co/storage/v1/object/public/articles/a/b.webp'

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co'))
afterEach(() => vi.unstubAllEnvs())

const valid = {
  title: 'En uke i Albir',
  slug: 'en-uke-i-albir',
  excerpt: 'Kort ingress',
  category: 'Reiserapport',
  cover_image: IMG,
  cover_image_alt: 'Spillere på bane',
  meta_description: '',
  published_at: '',
  author_name: 'Petter Skimmeland',
}

describe('slugify', () => {
  it.each([
    ['En uke i Albir', 'en-uke-i-albir'],
    ['Hvorfor vi elsker Costa Blanca!', 'hvorfor-vi-elsker-costa-blanca'],
    ['Ærlig talt: Øvelser på Åsane', 'aerlig-talt-ovelser-pa-asane'],
    ['Café & padel — én dag', 'cafe-padel-en-dag'],
    ['  --mellomrom--  ', 'mellomrom'],
  ])('%s → %s', (input, expected) => expect(slugify(input)).toBe(expected))

  it('kutter til maks 80 tegn uten bindestrek på slutten', () => {
    const slug = slugify(`${'a'.repeat(79)} b`)
    expect(slug.length).toBeLessThanOrEqual(80)
    expect(slug.endsWith('-')).toBe(false)
  })
})

describe('articleMetaSchema', () => {
  it('godtar gyldig metadata og gjør tomme valgfrie felt til null', () => {
    const result = articleMetaSchema.parse(valid)
    expect(result.meta_description).toBeNull()
    expect(result.published_at).toBeNull()
  })

  it('godtar valgfritt forfatternavn (ghostwriting) og trimmer det', () => {
    const result = articleMetaSchema.parse({ ...valid, author_name: '  André Schlyter ' })
    expect(result.author_name).toBe('André Schlyter')
  })

  it('krever forfatter', () => {
    const result = articleMetaSchema.safeParse({ ...valid, author_name: '   ' })
    expect(result.success).toBe(false)
    if (!result.success) expect(fieldErrors(result.error).author_name).toBe('Velg eller skriv inn en forfatter')
  })

  it('avviser forfatternavn over 100 tegn', () => {
    const result = articleMetaSchema.safeParse({ ...valid, author_name: 'x'.repeat(101) })
    expect(result.success).toBe(false)
    if (!result.success) expect(fieldErrors(result.error).author_name).toBe('Forfatternavnet kan ha maks 100 tegn')
  })

  it('godtar ISO-dato', () => {
    const result = articleMetaSchema.parse({ ...valid, published_at: '2026-05-20T12:00:00.000Z' })
    expect(result.published_at).toBe('2026-05-20T12:00:00.000Z')
  })

  it('krever tittel på minst 3 tegn', () => {
    const result = articleMetaSchema.safeParse({ ...valid, title: 'Hi' })
    expect(result.success).toBe(false)
    if (!result.success) expect(fieldErrors(result.error).title).toBe('Tittelen må ha minst 3 tegn')
  })

  it('avviser ugyldig slug', () => {
    const result = articleMetaSchema.safeParse({ ...valid, slug: 'Med Store Bokstaver' })
    expect(result.success).toBe(false)
    if (!result.success) expect(fieldErrors(result.error).slug).toBe('Bruk kun små bokstaver, tall og bindestrek')
  })

  it('avviser ukjent kategori', () => {
    expect(articleMetaSchema.safeParse({ ...valid, category: 'Shop' }).success).toBe(false)
  })

  it('krever alt-tekst når forsidebilde er satt', () => {
    const result = articleMetaSchema.safeParse({ ...valid, cover_image_alt: '' })
    expect(result.success).toBe(false)
    if (!result.success) expect(fieldErrors(result.error).cover_image_alt).toBe('Skriv en kort bildebeskrivelse (alt-tekst)')
  })

  it('avviser forsidebilde fra fremmed domene', () => {
    const result = articleMetaSchema.safeParse({ ...valid, cover_image: 'https://evil.com/x.jpg' })
    expect(result.success).toBe(false)
    if (!result.success) expect(fieldErrors(result.error).cover_image).toBe('Last opp bildet her i admin')
  })

  it('avviser for lang ingress og meta-beskrivelse', () => {
    expect(articleMetaSchema.safeParse({ ...valid, excerpt: 'x'.repeat(301) }).success).toBe(false)
    expect(articleMetaSchema.safeParse({ ...valid, meta_description: 'x'.repeat(201) }).success).toBe(false)
  })
})

describe('missingForPublish', () => {
  const doc = { type: 'doc' as const, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hei' }] }] }

  it('er tom når alt er på plass', () => {
    expect(missingForPublish({ excerpt: 'Ingress', cover_image: IMG, content: doc })).toEqual([])
  })

  it('lister alt som mangler', () => {
    expect(missingForPublish({ excerpt: '  ', cover_image: null, content: { type: 'doc', content: [] } }))
      .toEqual(['ingress', 'forsidebilde', 'innhold'])
  })

  it('behandler tom editor (enkelt avsnitt uten tekst) som manglende innhold', () => {
    expect(missingForPublish({ excerpt: 'Ingress', cover_image: IMG, content: { type: 'doc', content: [{ type: 'paragraph' }] } }))
      .toEqual(['innhold'])
  })

  it('behandler avsnitt med bare whitespace som manglende innhold', () => {
    expect(missingForPublish({
      excerpt: 'Ingress',
      cover_image: IMG,
      content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '   ' }] }] }
    }))
      .toEqual(['innhold'])
  })

  it('godtar bilde som meningsfullt innhold', () => {
    expect(missingForPublish({
      excerpt: 'Ingress',
      cover_image: IMG,
      content: { type: 'doc', content: [{ type: 'image', attrs: { src: IMG, alt: '' } }] }
    }))
      .toEqual([])
  })

  it('godtar tekst nestet i bulletList → listItem → paragraph som meningsfullt innhold', () => {
    expect(missingForPublish({
      excerpt: 'Ingress',
      cover_image: IMG,
      content: {
        type: 'doc',
        content: [{
          type: 'bulletList',
          content: [{
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: 'Punkt' }]
            }]
          }]
        }]
      }
    }))
      .toEqual([])
  })
})

describe('mapDbError', () => {
  it('gir feltfeil for duplikat-slug', () => {
    expect(mapDbError({ code: '23505', message: 'duplicate key value violates unique constraint "articles_slug_key"' }))
      .toEqual({ error: 'Denne adressen er allerede i bruk', fieldErrors: { slug: 'Denne adressen er allerede i bruk' } })
  })

  it('gir feltfeil når publisert artikkel mangler dato', () => {
    expect(mapDbError({ code: '23514', message: 'violates check constraint "articles_published_has_date"' }))
      .toEqual({ error: 'Publiserte artikler må ha en dato', fieldErrors: { published_at: 'Publiserte artikler må ha en dato' } })
  })

  it('gir generell melding ellers', () => {
    expect(mapDbError({ code: '42501', message: 'permission denied' })).toEqual({ error: 'Noe gikk galt. Prøv igjen.' })
  })
})
