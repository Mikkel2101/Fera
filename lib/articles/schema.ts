import { z } from 'zod'
import { ARTICLE_CATEGORIES, type ArticleDoc, type DocNode } from './types'
import { isAllowedImageSrc } from './content'

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const MAX_SLUG_LENGTH = 80
const NORWEGIAN_LETTERS: Record<string, string> = { æ: 'ae', ø: 'o', å: 'a' }

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[æøå]/g, (letter) => NORWEGIAN_LETTERS[letter])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, '')
}

const emptyToNull = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? null : value

const optionalText = (max: number, message: string) =>
  z.preprocess(emptyToNull, z.string().trim().max(max, message).nullable())

export const articleMetaSchema = z
  .object({
    title: z.string().trim()
      .min(3, 'Tittelen må ha minst 3 tegn')
      .max(150, 'Tittelen kan ha maks 150 tegn'),
    slug: z.string().trim()
      .max(120, 'Adressen er for lang')
      .regex(SLUG_PATTERN, 'Bruk kun små bokstaver, tall og bindestrek'),
    excerpt: z.string().trim().max(300, 'Ingressen kan ha maks 300 tegn'),
    category: z.enum(ARTICLE_CATEGORIES, { error: 'Velg en kategori' }),
    cover_image: optionalText(2000, 'Ugyldig bildeadresse'),
    cover_image_alt: optionalText(200, 'Bildebeskrivelsen kan ha maks 200 tegn'),
    meta_description: optionalText(200, 'Meta-beskrivelsen kan ha maks 200 tegn'),
    published_at: z.preprocess(emptyToNull, z.iso.datetime({ offset: true }).nullable()),
  })
  .superRefine((value, ctx) => {
    if (value.cover_image && !isAllowedImageSrc(value.cover_image)) {
      ctx.addIssue({ code: 'custom', path: ['cover_image'], message: 'Last opp bildet her i admin' })
    }
    if (value.cover_image && !value.cover_image_alt) {
      ctx.addIssue({ code: 'custom', path: ['cover_image_alt'], message: 'Skriv en kort bildebeskrivelse (alt-tekst)' })
    }
  })

export type ArticleMetaInput = z.input<typeof articleMetaSchema>
export type ArticleMeta = z.output<typeof articleMetaSchema>
export type FieldErrors = Partial<Record<keyof ArticleMeta, string>>

export function fieldErrors(error: z.ZodError): FieldErrors {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !(key in result)) result[key] = issue.message
  }
  return result as FieldErrors
}

function hasMeaningfulContent(nodes: DocNode[]): boolean {
  for (const node of nodes) {
    if (node.type === 'text' && typeof node.text === 'string' && node.text.trim() !== '') {
      return true
    }
    if (node.type === 'image') {
      return true
    }
    if (node.content && hasMeaningfulContent(node.content)) {
      return true
    }
  }
  return false
}

export function missingForPublish(article: {
  excerpt: string
  cover_image: string | null
  content: ArticleDoc
}): string[] {
  return [
    article.excerpt.trim() === '' ? 'ingress' : null,
    article.cover_image ? null : 'forsidebilde',
    !hasMeaningfulContent(article.content.content) ? 'innhold' : null,
  ].filter((item): item is string => item !== null)
}

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: FieldErrors }

const UNIQUE_VIOLATION = '23505'
const CHECK_VIOLATION = '23514'

export function mapDbError(error: { code?: string; message: string }): {
  error: string
  fieldErrors?: FieldErrors
} {
  if (error.code === UNIQUE_VIOLATION && error.message.includes('slug')) {
    const message = 'Denne adressen er allerede i bruk'
    return { error: message, fieldErrors: { slug: message } }
  }
  if (error.code === CHECK_VIOLATION && error.message.includes('published_has_date')) {
    const message = 'Publiserte artikler må ha en dato'
    return { error: message, fieldErrors: { published_at: message } }
  }
  return { error: 'Noe gikk galt. Prøv igjen.' }
}
