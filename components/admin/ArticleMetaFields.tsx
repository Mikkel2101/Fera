'use client'

import type { ReactNode } from 'react'
import { ARTICLE_CATEGORIES } from '@/lib/articles/types'
import type { FieldErrors } from '@/lib/articles/schema'
import ImageUpload from './ImageUpload'

export type MetaState = {
  title: string
  slug: string
  excerpt: string
  category: string
  cover_image: string
  cover_image_alt: string
  meta_description: string
  published_date: string
  author_name: string
}

type Props = {
  articleId: string
  value: MetaState
  isPublished: boolean
  teamNames: string[]
  errors: FieldErrors
  onChange: (patch: Partial<MetaState>) => void
  onSlugEdited: () => void
  onError: (message: string) => void
}

const INPUT = 'w-full border border-(--color-border) rounded-lg px-3 py-2 text-sm text-(--color-text) bg-white focus:outline-none focus:border-(--color-cta)'
const META_RECOMMENDED = 160

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-(--color-text)">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-(--color-muted)">{hint}</span>}
      {error && <span className="block text-xs text-(--color-cta) font-medium">{error}</span>}
    </label>
  )
}

export default function ArticleMetaFields({ articleId, value, isPublished, teamNames, errors, onChange, onSlugEdited, onError }: Props) {
  return (
    <div className="space-y-5">
      <Field label="Tittel" error={errors.title}>
        <input className={INPUT} value={value.title} onChange={(e) => onChange({ title: e.target.value })} />
      </Field>
      <Field label="Forfatter" hint="Velg fra teamet eller skriv et annet navn (f.eks. gjesteskribent)" error={errors.author_name}>
        <input
          className={INPUT}
          list="article-team-names"
          value={value.author_name}
          onChange={(e) => onChange({ author_name: e.target.value })}
        />
        <datalist id="article-team-names">
          {teamNames.map((name) => <option key={name} value={name} />)}
        </datalist>
      </Field>
      <Field
        label="Adresse"
        hint={`/travels/inspirasjon/${value.slug}${isPublished ? ' · Avpubliser for å endre adressen' : ''}`}
        error={errors.slug}
      >
        <input
          className={`${INPUT} read-only:bg-(--color-ice-light) read-only:text-(--color-muted) read-only:cursor-not-allowed`}
          value={value.slug}
          readOnly={isPublished}
          onChange={(e) => { onSlugEdited(); onChange({ slug: e.target.value }) }}
        />
      </Field>
      <Field label="Kategori" error={errors.category}>
        <select className={INPUT} value={value.category} onChange={(e) => onChange({ category: e.target.value })}>
          {ARTICLE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </Field>
      <Field label="Ingress" hint={`${value.excerpt.length}/300 — vises på kortet og i søk`} error={errors.excerpt}>
        <textarea className={INPUT} rows={3} value={value.excerpt} onChange={(e) => onChange({ excerpt: e.target.value })} />
      </Field>
      <Field label="Forsidebilde" error={errors.cover_image}>
        <ImageUpload articleId={articleId} value={value.cover_image} onChange={(url) => onChange({ cover_image: url })} onError={onError} />
      </Field>
      {value.cover_image && (
        <Field label="Bildebeskrivelse (alt-tekst)" error={errors.cover_image_alt}>
          <input className={INPUT} value={value.cover_image_alt} onChange={(e) => onChange({ cover_image_alt: e.target.value })} />
        </Field>
      )}
      <Field
        label="Beskrivelse for Google"
        hint={`${value.meta_description.length} tegn — anbefalt under ${META_RECOMMENDED}. Tom = ingressen brukes.`}
        error={errors.meta_description}
      >
        <textarea className={INPUT} rows={2} value={value.meta_description} onChange={(e) => onChange({ meta_description: e.target.value })} />
      </Field>
      <Field label="Publiseringsdato" hint="Tom = settes automatisk ved publisering" error={errors.published_at}>
        <input type="date" className={INPUT} value={value.published_date} onChange={(e) => onChange({ published_date: e.target.value })} />
      </Field>
    </div>
  )
}
