'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { Json } from '@/lib/supabase/types'
import type { ArticleDoc } from '@/lib/articles/types'
import { sanitizeDoc } from '@/lib/articles/content'
import {
  articleMetaSchema, fieldErrors, mapDbError, missingForPublish,
  type ActionResult, type ArticleMetaInput,
} from '@/lib/articles/schema'

const MAX_CONTENT_CHARS = 500_000
const BUCKET = 'articles'

function revalidateArticle(...slugs: string[]) {
  revalidatePath('/admin/articles')
  revalidatePath('/travels/inspirasjon')
  for (const slug of slugs) revalidatePath(`/travels/inspirasjon/${slug}`)
  revalidatePath('/')
  revalidatePath('/sitemap.xml')
}

export async function createArticleAndOpen(): Promise<void> {
  const { supabase, user } = await requireAdmin()
  const { data: profile } = await supabase.from('users').select('full_name').eq('id', user.id).maybeSingle()

  const { data, error } = await supabase
    .from('articles')
    .insert({
      title: 'Uten tittel',
      slug: `utkast-${crypto.randomUUID().slice(0, 8)}`,
      author_id: user.id,
      author_name: profile?.full_name ?? null,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[articles] opprett feilet', error)
    throw new Error('Kunne ikke opprette artikkel')
  }
  revalidatePath('/admin/articles')
  redirect(`/admin/articles/${data.id}`)
}

export async function saveArticle(
  id: string,
  meta: ArticleMetaInput,
  content: unknown,
): Promise<ActionResult<{ slug: string }>> {
  const { supabase } = await requireAdmin()

  const parsed = articleMetaSchema.safeParse(meta)
  if (!parsed.success) {
    return { ok: false, error: 'Sjekk feltene som er markert', fieldErrors: fieldErrors(parsed.error) }
  }

  const doc = sanitizeDoc(content)
  if (JSON.stringify(doc).length > MAX_CONTENT_CHARS) {
    return { ok: false, error: 'Artikkelen er for lang til å lagres' }
  }

  const { data: previous } = await supabase.from('articles').select('slug').eq('id', id).maybeSingle()

  const { error } = await supabase
    .from('articles')
    .update({ ...parsed.data, content: doc as unknown as Json })
    .eq('id', id)

  if (error) {
    console.error('[articles] lagring feilet', id, error)
    return { ok: false, ...mapDbError(error) }
  }

  const oldSlugs = previous && previous.slug !== parsed.data.slug ? [previous.slug] : []
  revalidateArticle(parsed.data.slug, ...oldSlugs)
  revalidatePath(`/admin/articles/${id}`)
  return { ok: true, data: { slug: parsed.data.slug } }
}

export async function publishArticle(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin()

  const { data: article, error } = await supabase
    .from('articles')
    .select('slug, excerpt, cover_image, content, published_at')
    .eq('id', id)
    .maybeSingle()
  if (error || !article) {
    console.error('[articles] publiser: fant ikke', id, error)
    return { ok: false, error: 'Fant ikke artikkelen' }
  }

  const missing = missingForPublish({ ...article, content: article.content as unknown as ArticleDoc })
  if (missing.length > 0) {
    return { ok: false, error: `Mangler før publisering: ${missing.join(', ')}` }
  }

  const { error: updateError } = await supabase
    .from('articles')
    .update({ status: 'published', published_at: article.published_at ?? new Date().toISOString() })
    .eq('id', id)
  if (updateError) {
    console.error('[articles] publisering feilet', id, updateError)
    return { ok: false, ...mapDbError(updateError) }
  }

  revalidateArticle(article.slug)
  revalidatePath(`/admin/articles/${id}`)
  return { ok: true, data: undefined }
}

export async function unpublishArticle(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase
    .from('articles')
    .update({ status: 'draft' })
    .eq('id', id)
    .select('slug')
    .maybeSingle()
  if (error || !data) {
    console.error('[articles] avpublisering feilet', id, error)
    return { ok: false, error: 'Kunne ikke avpublisere. Prøv igjen.' }
  }
  revalidateArticle(data.slug)
  revalidatePath(`/admin/articles/${id}`)
  return { ok: true, data: undefined }
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin()

  const { data: files, error: listError } = await supabase.storage.from(BUCKET).list(id)
  if (listError) console.error('[articles] kunne ikke liste bilder', id, listError)
  if (files && files.length > 0) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove(files.map((f) => `${id}/${f.name}`))
    if (removeError) console.error('[articles] kunne ikke slette bilder', id, removeError)
  }

  const { data, error } = await supabase.from('articles').delete().eq('id', id).select('slug').maybeSingle()
  if (error || !data) {
    console.error('[articles] sletting feilet', id, error)
    return { ok: false, error: 'Kunne ikke slette artikkelen. Prøv igjen.' }
  }
  revalidateArticle(data.slug)
  return { ok: true, data: undefined }
}
