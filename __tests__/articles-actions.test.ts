import { describe, it, expect, vi, beforeEach } from 'vitest'

type Result = { data: unknown; error: unknown }

const updates: unknown[] = []
let results: Result[] = []

function chain() {
  const builder: Record<string, unknown> = {}
  for (const method of ['select', 'eq']) builder[method] = () => builder
  builder.update = (payload: unknown) => { updates.push(payload); return builder }
  const next = () => Promise.resolve(results.shift() ?? { data: null, error: null })
  builder.maybeSingle = next
  builder.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) => next().then(resolve, reject)
  return builder
}

vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: async () => ({ supabase: { from: () => chain() }, user: { id: 'u1' } }),
}))
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))
vi.mock('next/navigation', () => ({ redirect: () => {} }))

import { saveArticle, publishArticle } from '@/lib/actions/articles'

const meta = {
  title: 'Tittel',
  slug: 'min-artikkel',
  excerpt: 'Ingress',
  category: 'Tips',
  cover_image: '',
  cover_image_alt: '',
  meta_description: '',
  published_at: '',
  author_name: 'Petter',
} as const

const doc = { type: 'doc', content: [] }

beforeEach(() => {
  updates.length = 0
  results = []
})

describe('saveArticle', () => {
  it('beholder eksisterende publiseringstidspunkt når datoen er uendret', async () => {
    const previous = '2026-05-20T22:30:00.000Z' // 21. mai i Oslo
    results = [
      { data: { slug: 'min-artikkel', status: 'published', published_at: previous }, error: null },
      { data: { id: '1' }, error: null },
    ]
    const result = await saveArticle('1', { ...meta, published_at: '2026-05-21T12:00:00.000Z' }, doc)
    expect(result.ok).toBe(true)
    expect(updates[0]).toMatchObject({ published_at: previous })
  })

  it('lagrer ny dato når den er endret', async () => {
    results = [
      { data: { slug: 'min-artikkel', status: 'published', published_at: '2026-05-20T22:30:00.000Z' }, error: null },
      { data: { id: '1' }, error: null },
    ]
    await saveArticle('1', { ...meta, published_at: '2026-06-01T12:00:00.000Z' }, doc)
    expect(updates[0]).toMatchObject({ published_at: '2026-06-01T12:00:00.000Z' })
  })

  it('avviser adresseendring på publisert artikkel', async () => {
    results = [{ data: { slug: 'gammel-adresse', status: 'published', published_at: null }, error: null }]
    const result = await saveArticle('1', meta, doc)
    expect(result).toMatchObject({ ok: false, fieldErrors: { slug: expect.stringContaining('Avpubliser') } })
    expect(updates).toHaveLength(0)
  })

  it('tillater adresseendring på utkast', async () => {
    results = [
      { data: { slug: 'gammel-adresse', status: 'draft', published_at: null }, error: null },
      { data: { id: '1' }, error: null },
    ]
    const result = await saveArticle('1', meta, doc)
    expect(result).toEqual({ ok: true, data: { slug: 'min-artikkel' } })
  })

  it('navngir feltene som mangler, så redaktøren ser hva som må fikses', async () => {
    const result = await saveArticle('1', {
      ...meta,
      author_name: '',
      cover_image: 'https://evil.com/x.jpg',
      cover_image_alt: '',
    }, doc)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toBe('Sjekk feltene som er markert: Forfatter, Forsidebilde, Bildebeskrivelse (alt-tekst)')
    expect(updates).toHaveLength(0)
  })

  it('svarer at artikkelen ikke finnes når oppslaget er tomt', async () => {
    results = [{ data: null, error: null }]
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await saveArticle('1', meta, doc)
    spy.mockRestore()
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining('Fant ikke') })
    expect(updates).toHaveLength(0)
  })
})

describe('publishArticle', () => {
  const ready = {
    slug: 'min-artikkel',
    excerpt: 'Ingress',
    cover_image: 'https://x/y.jpg',
    content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hei' }] }] },
  }

  it('returnerer publiseringstidspunktet serveren satte', async () => {
    results = [{ data: { ...ready, published_at: null }, error: null }, { data: null, error: null }]
    const result = await publishArticle('1')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.published_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(updates[0]).toMatchObject({ status: 'published', published_at: result.data.published_at })
  })

  it('beholder datoen som allerede var satt', async () => {
    const existing = '2026-05-20T12:00:00.000Z'
    results = [{ data: { ...ready, published_at: existing }, error: null }, { data: null, error: null }]
    const result = await publishArticle('1')
    expect(result).toEqual({ ok: true, data: { published_at: existing } })
  })
})
