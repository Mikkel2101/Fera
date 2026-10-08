import type { ArticleDoc, DocMark, DocNode } from './types'

const ALLOWED_NODES = new Set([
  'paragraph', 'heading', 'text', 'bulletList', 'orderedList',
  'listItem', 'blockquote', 'image', 'hardBreak',
])
const ALLOWED_MARKS = new Set(['bold', 'italic', 'link'])
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])
const INTERNAL_PATH_PATTERN = /^\/(?![\/\\])[^\s\\]*$/
const WORDS_PER_MINUTE = 200

export function isSafeHref(href: unknown): href is string {
  if (typeof href !== 'string') return false
  const value = href.trim()
  if (value.startsWith('/')) return INTERNAL_PATH_PATTERN.test(value)
  try {
    return SAFE_PROTOCOLS.has(new URL(value).protocol)
  } catch {
    return false
  }
}

export function storagePublicPrefix(): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/`
}

export function isAllowedImageSrc(src: unknown, prefix = storagePublicPrefix()): src is string {
  return typeof src === 'string' && prefix.startsWith('https://') && src.startsWith(prefix)
}

function sanitizeMarks(marks: unknown): DocMark[] | undefined {
  if (!Array.isArray(marks)) return undefined
  const kept = marks.flatMap((mark): DocMark[] => {
    if (!mark || typeof mark !== 'object' || !ALLOWED_MARKS.has(mark.type)) return []
    if (mark.type !== 'link') return [{ type: mark.type }]
    const href = mark.attrs?.href
    return isSafeHref(href) ? [{ type: 'link', attrs: { href: href.trim() } }] : []
  })
  return kept.length > 0 ? kept : undefined
}

function sanitizeChildren(children: unknown, imagePrefix: string): DocNode[] {
  if (!Array.isArray(children)) return []
  return children
    .map((child) => sanitizeNode(child, imagePrefix))
    .filter((child): child is DocNode => child !== null)
}

function sanitizeNode(node: unknown, imagePrefix: string): DocNode | null {
  if (!node || typeof node !== 'object') return null
  const { type, attrs, content, text, marks } = node as DocNode
  if (typeof type !== 'string' || !ALLOWED_NODES.has(type)) return null

  switch (type) {
    case 'text': {
      if (typeof text !== 'string' || text === '') return null
      const cleanMarks = sanitizeMarks(marks)
      return cleanMarks ? { type, text, marks: cleanMarks } : { type, text }
    }
    case 'image': {
      const src = attrs?.src
      if (!isAllowedImageSrc(src, imagePrefix)) return null
      const alt = typeof attrs?.alt === 'string' ? attrs.alt : ''
      return { type, attrs: { src, alt } }
    }
    case 'heading':
      return { type, attrs: { level: attrs?.level === 3 ? 3 : 2 }, content: sanitizeChildren(content, imagePrefix) }
    case 'hardBreak':
      return { type }
    default:
      return { type, content: sanitizeChildren(content, imagePrefix) }
  }
}

export function sanitizeDoc(input: unknown, imagePrefix = storagePublicPrefix()): ArticleDoc {
  if (!input || typeof input !== 'object' || (input as DocNode).type !== 'doc') {
    return { type: 'doc', content: [] }
  }
  return { type: 'doc', content: sanitizeChildren((input as DocNode).content, imagePrefix) }
}

function nodeText(node: DocNode): string {
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map(nodeText).join(' ')
}

export function readingTimeMinutes(doc: ArticleDoc): number {
  const words = doc.content.map(nodeText).join(' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
