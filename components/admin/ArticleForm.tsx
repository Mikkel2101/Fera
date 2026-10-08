'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ArticleBody from '@/components/articles/ArticleBody'
import ArticleEditor from './ArticleEditor'
import ArticleMetaFields, { type MetaState } from './ArticleMetaFields'
import { saveArticle, publishArticle, unpublishArticle, deleteArticle } from '@/lib/actions/articles'
import { slugify, type ArticleMetaInput, type FieldErrors } from '@/lib/articles/schema'
import { fromDateInput, toDateInput } from '@/lib/articles/format'
import type { Article, ArticleDoc } from '@/lib/articles/types'

type Message = { tone: 'error' | 'success'; text: string }

function toMetaState(article: Article): MetaState {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: article.category,
    cover_image: article.cover_image ?? '',
    cover_image_alt: article.cover_image_alt ?? '',
    meta_description: article.meta_description ?? '',
    published_date: toDateInput(article.published_at),
  }
}

function toMetaInput(meta: MetaState): ArticleMetaInput {
  const { published_date, ...rest } = meta
  return { ...rest, published_at: fromDateInput(published_date) ?? '' } as ArticleMetaInput
}

const PRIMARY = 'bg-(--color-cta) text-white font-sans font-semibold rounded-full px-5 py-2.5 text-sm hover:bg-(--color-dark-mid) transition-colors disabled:opacity-50'
const SECONDARY = 'border border-(--color-border) text-(--color-text) font-sans font-medium rounded-full px-5 py-2.5 text-sm hover:border-(--color-cta) disabled:opacity-50'

export default function ArticleForm({ article }: { article: Article }) {
  const router = useRouter()
  const [meta, setMeta] = useState<MetaState>(() => toMetaState(article))
  const [content, setContent] = useState<ArticleDoc>(article.content)
  const [status, setStatus] = useState(article.status)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [message, setMessage] = useState<Message | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isSlugLocked = useRef(article.status === 'published' || !article.slug.startsWith('utkast-'))

  function updateMeta(patch: Partial<MetaState>) {
    setMeta((current) => {
      const next = { ...current, ...patch }
      return patch.title !== undefined && !isSlugLocked.current ? { ...next, slug: slugify(patch.title) } : next
    })
  }

  const showError = (text: string) => setMessage({ tone: 'error', text })

  async function save(): Promise<boolean> {
    const result = await saveArticle(article.id, toMetaInput(meta), content)
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {})
      showError(result.error)
      return false
    }
    setErrors({})
    return true
  }

  function run(task: () => Promise<void>) {
    setMessage(null)
    startTransition(async () => {
      try {
        await task()
      } catch (error) {
        console.error('[articles] handling feilet', error)
        showError('Noe gikk galt. Endringene dine er ikke lagret — prøv igjen.')
      }
    })
  }

  const handleSave = () => run(async () => {
    if (await save()) setMessage({ tone: 'success', text: 'Lagret' })
  })

  const handlePublish = () => run(async () => {
    if (!(await save())) return
    const result = await publishArticle(article.id)
    if (!result.ok) {
      showError(result.error)
      return
    }
    setStatus('published')
    isSlugLocked.current = true
    setMessage({ tone: 'success', text: 'Publisert! Artikkelen er nå synlig på nettsiden.' })
    router.refresh()
  })

  const handleUnpublish = () => run(async () => {
    const result = await unpublishArticle(article.id)
    if (!result.ok) {
      showError(result.error)
      return
    }
    setStatus('draft')
    setMessage({ tone: 'success', text: 'Avpublisert. Artikkelen er skjult fra nettsiden.' })
  })

  const handleDelete = () => {
    if (!window.confirm(`Slette «${meta.title}» for godt? Dette kan ikke angres.`)) return
    run(async () => {
      const result = await deleteArticle(article.id)
      if (!result.ok) {
        showError(result.error)
        return
      }
      router.push('/admin/articles')
    })
  }

  const isPublished = status === 'published'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${isPublished ? 'bg-(--color-success) text-white' : 'bg-(--color-sand) text-(--color-subtle)'}`}>
          {isPublished ? 'Publisert' : 'Utkast'}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" className={SECONDARY} onClick={() => setIsPreview((v) => !v)}>
            {isPreview ? 'Tilbake til redigering' : 'Forhåndsvis'}
          </button>
          <button type="button" className={SECONDARY} disabled={isPending} onClick={handleSave}>Lagre</button>
          {isPublished ? (
            <button type="button" className={SECONDARY} disabled={isPending} onClick={handleUnpublish}>Avpubliser</button>
          ) : (
            <button type="button" className={PRIMARY} disabled={isPending} onClick={handlePublish}>Publiser</button>
          )}
        </div>
      </div>

      {message && (
        <p role="status" className={`text-sm font-medium ${message.tone === 'error' ? 'text-(--color-cta)' : 'text-(--color-success)'}`}>
          {message.text}
        </p>
      )}

      {isPreview ? (
        <article className="bg-white border border-(--color-border) rounded-2xl px-6 py-10 max-w-3xl">
          <h1 className="font-display font-bold text-3xl text-(--color-text) mb-6">{meta.title}</h1>
          <ArticleBody doc={content} />
        </article>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <ArticleEditor articleId={article.id} initialContent={content} onChange={setContent} onError={showError} />
          <aside className="bg-white border border-(--color-border) rounded-2xl p-5">
            <ArticleMetaFields
              articleId={article.id}
              value={meta}
              errors={errors}
              onChange={updateMeta}
              onSlugEdited={() => { isSlugLocked.current = true }}
              onError={showError}
            />
            <button type="button" onClick={handleDelete} disabled={isPending} className="mt-8 text-sm text-(--color-muted) hover:text-(--color-cta)">
              Slett artikkel
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}
