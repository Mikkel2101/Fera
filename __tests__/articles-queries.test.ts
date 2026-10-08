import { describe, it, expect, vi, beforeEach } from 'vitest'

const calls: Array<[string, unknown[]]> = []
let nextResult: unknown = { data: [], error: null }

function chain() {
  const builder: Record<string, unknown> = {}
  for (const method of ['select', 'eq', 'order', 'limit']) {
    builder[method] = (...args: unknown[]) => { calls.push([method, args]); return builder }
  }
  builder.maybeSingle = () => Promise.resolve(nextResult)
  builder.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(nextResult).then(resolve, reject)
  return builder
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ from: (table: string) => { calls.push(['from', [table]]); return chain() } }),
}))

import { getPublishedArticles, getPublishedArticle } from '@/lib/articles/queries'

const row = {
  id: '1', slug: 'utkast', title: 'T', excerpt: 'E', category: 'Coaching',
  cover_image: null, cover_image_alt: null, meta_description: null,
  content: { type: 'doc', content: [] }, status: 'published', published_at: '2026-05-20T12:00:00.000Z',
  author_id: null, author_name: 'Petter', created_at: '', updated_at: '',
}

beforeEach(() => { calls.length = 0 })

describe('offentlige artikkelspørringer', () => {
  it('getPublishedArticle filtrerer på publisert status', async () => {
    nextResult = { data: null, error: null }
    expect(await getPublishedArticle('utkast')).toBeNull()
    expect(calls).toContainEqual(['eq', ['status', 'published']])
    expect(calls).toContainEqual(['eq', ['slug', 'utkast']])
  })

  it('getPublishedArticles filtrerer, sorterer nyeste først og regner lesetid', async () => {
    nextResult = { data: [row], error: null }
    const articles = await getPublishedArticles(3)
    expect(calls).toContainEqual(['eq', ['status', 'published']])
    expect(calls).toContainEqual(['order', ['published_at', { ascending: false }]])
    expect(calls).toContainEqual(['limit', [3]])
    expect(articles[0]).toMatchObject({ slug: 'utkast', reading_minutes: 1 })
  })

  it('getPublishedArticles henter bare kolonnene kortene trenger', async () => {
    nextResult = { data: [row], error: null }
    await getPublishedArticles()
    const select = calls.find(([method]) => method === 'select')
    expect(select?.[1][0]).not.toBe('*')
    expect(select?.[1][0]).not.toContain('meta_description')
    expect(select?.[1][0]).toContain('content')
  })

  it('getPublishedArticles gir tom liste ved databasefeil', async () => {
    nextResult = { data: null, error: { message: 'nede' } }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await getPublishedArticles()).toEqual([])
    spy.mockRestore()
  })
})
