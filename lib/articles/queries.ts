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

export async function getPublishedArticles(limit?: number): Promise<ArticleSummary[]> {
  const supabase = await createClient()
  const base = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  const { data, error } = await (limit ? base.limit(limit) : base)
  if (error || !data) {
    console.error('[articles] getPublishedArticles feilet', error)
    return []
  }
  return data.map((row) => {
    const article = toArticle(row)
    return {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      cover_image: article.cover_image,
      cover_image_alt: article.cover_image_alt,
      published_at: article.published_at,
      reading_minutes: readingTimeMinutes(article.content),
    }
  })
}

// Filtrerer eksplisitt på status: RLS slipper admin gjennom til utkast.
export async function getPublishedArticle(slug: string): Promise<Article | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) console.error('[articles] getPublishedArticle feilet', slug, error)
  return data ? toArticle(data) : null
}

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
