import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import type { Article, ArticleCategory, ArticleDoc, ArticleStatus, ArticleSummary } from './types'
import { readingTimeMinutes } from './content'

type ArticleRow = Database['public']['Tables']['articles']['Row']

export function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category as ArticleCategory,
    cover_image: row.cover_image,
    cover_image_alt: row.cover_image_alt,
    meta_description: row.meta_description,
    content: row.content as unknown as ArticleDoc,
    status: row.status as ArticleStatus,
    published_at: row.published_at,
    author_name: row.author_name,
    updated_at: row.updated_at,
  }
}

// content hentes bare for å regne ut lesetid.
const SUMMARY_COLUMNS = 'slug, title, excerpt, category, cover_image, cover_image_alt, published_at, content'

export async function getPublishedArticles(limit?: number): Promise<ArticleSummary[]> {
  const supabase = await createClient()
  const base = supabase
    .from('articles')
    .select(SUMMARY_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  const { data, error } = await (limit ? base.limit(limit) : base)
  if (error || !data) {
    console.error('[articles] getPublishedArticles feilet', error)
    return []
  }
  return data.map(({ content, ...row }) => ({
    ...row,
    category: row.category as ArticleCategory,
    reading_minutes: readingTimeMinutes(content as unknown as ArticleDoc),
  }))
}

// Filtrerer eksplisitt på status: RLS slipper admin gjennom til utkast.
// cache(): generateMetadata og siden deler samme oppslag i én forespørsel.
export const getPublishedArticle = cache(async (slug: string): Promise<Article | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) console.error('[articles] getPublishedArticle feilet', slug, error)
  return data ? toArticle(data) : null
})

export async function getArticleForAdmin(id: string): Promise<Article | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).maybeSingle()
  if (error) console.error('[articles] getArticleForAdmin feilet', id, error)
  return data ? toArticle(data) : null
}

export async function listArticlesForAdmin() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, status, published_at, author_name, updated_at')
    .order('updated_at', { ascending: false })
  if (error) console.error('[articles] listArticlesForAdmin feilet', error)
  return (data ?? []).map((row) => ({ ...row, status: row.status as ArticleStatus }))
}

// Forslag i forfatterfeltet. Feiler den, kan man fortsatt skrive navnet selv.
export async function getTeamNames(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('team_members')
  if (error) {
    console.error('[articles] getTeamNames feilet', error)
    return []
  }
  return (data ?? []).map((row) => row.full_name)
}
