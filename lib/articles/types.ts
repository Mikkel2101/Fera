export const ARTICLE_CATEGORIES = ['Reiserapport', 'Coaching', 'Destinasjon', 'Tips', 'Nyheter'] as const
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]

export type ArticleStatus = 'draft' | 'published'

export type DocMark = { type: string; attrs?: Record<string, unknown> }

export type DocNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: DocNode[]
  text?: string
  marks?: DocMark[]
}

export type ArticleDoc = { type: 'doc'; content: DocNode[] }

export const EMPTY_DOC: ArticleDoc = { type: 'doc', content: [] }

export type Article = {
  id: string
  slug: string
  title: string
  excerpt: string
  category: ArticleCategory
  cover_image: string | null
  cover_image_alt: string | null
  meta_description: string | null
  content: ArticleDoc
  status: ArticleStatus
  published_at: string | null
  author_name: string | null
  updated_at: string
}

export type ArticleSummary = Pick<
  Article,
  'slug' | 'title' | 'excerpt' | 'category' | 'cover_image' | 'cover_image_alt' | 'published_at'
> & { reading_minutes: number }
