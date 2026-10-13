import type { ArticleDoc, DocMark, DocNode } from '@/lib/articles/types'
import { isAllowedImageSrc, isSafeHref, storagePublicPrefix } from '@/lib/articles/content'
import { formatArticleDate } from '@/lib/articles/format'
import { EMAIL_COLORS as C, EMAIL_FONTS as F } from './theme'

export type NewsletterArticle = {
  slug: string
  title: string
  excerpt: string
  category: string
  cover_image: string | null
  cover_image_alt: string | null
  author_name: string | null
  published_at: string | null
  content: ArticleDoc
}

export type RenderOptions = {
  siteUrl: string
  unsubscribeUrl: string
  senderInfo: string
  imagePrefix?: string
}

export type RenderedEmail = { subject: string; html: string; text: string }

type Ctx = { siteUrl: string; imagePrefix: string }

const BODY_WIDTH = 536
const FOOTER_REASON = 'Du får denne e-posten fordi du har meldt deg på nyhetsbrevet fra Fera Padel.'
const TEXT = `font-family:${F.sans};font-size:16px;line-height:1.6;color:${C.text}`

// Inline-stiler: mange e-postklienter (Gmail, Outlook) ignorerer <style>-blokker.
const STYLE = {
  p: `margin:0 0 16px;${TEXT}`,
  pTight: `margin:0;${TEXT}`,
  h2: `margin:32px 0 12px;font-family:${F.serif};font-size:24px;line-height:1.3;color:${C.text}`,
  h3: `margin:24px 0 8px;font-family:${F.serif};font-size:19px;line-height:1.3;color:${C.text}`,
  list: 'margin:0 0 16px;padding-left:24px',
  li: `margin:0 0 6px;${TEXT}`,
  quote: `margin:0 0 16px;padding:4px 0 4px 16px;border-left:3px solid ${C.accent};font-style:italic`,
  link: `color:${C.accent};text-decoration:underline`,
  img: `display:block;width:100%;max-width:${BODY_WIDTH}px;height:auto;border:0;border-radius:12px;margin:8px 0 24px`,
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function articleUrl(siteUrl: string, slug: string): string {
  return `${siteUrl}/travels/inspirasjon/${encodeURIComponent(slug)}`
}

function absoluteHref(href: string, siteUrl: string): string {
  const trimmed = href.trim()
  return trimmed.startsWith('/') ? `${siteUrl}${trimmed}` : trimmed
}

function applyMark(html: string, mark: DocMark, ctx: Ctx): string {
  switch (mark.type) {
    case 'bold':
      return `<strong>${html}</strong>`
    case 'italic':
      return `<em>${html}</em>`
    case 'link': {
      const href = mark.attrs?.href
      if (!isSafeHref(href)) return html
      return `<a href="${escapeHtml(absoluteHref(href, ctx.siteUrl))}" style="${STYLE.link}">${html}</a>`
    }
    default:
      return html
  }
}

function renderChildren(node: DocNode, ctx: Ctx, isTight = false): string {
  return (node.content ?? []).map((child) => renderNode(child, ctx, isTight)).join('')
}

// Samme hviteliste som sanitizeDoc og ArticleBody: ukjente noder blir borte.
function renderNode(node: DocNode, ctx: Ctx, isTight: boolean): string {
  switch (node.type) {
    case 'text':
      return (node.marks ?? []).reduce((html, mark) => applyMark(html, mark, ctx), escapeHtml(node.text ?? ''))
    case 'paragraph': {
      const inner = renderChildren(node, ctx)
      return inner === '' ? '' : `<p style="${isTight ? STYLE.pTight : STYLE.p}">${inner}</p>`
    }
    case 'heading': {
      const tag = node.attrs?.level === 3 ? 'h3' : 'h2'
      return `<${tag} style="${STYLE[tag]}">${renderChildren(node, ctx)}</${tag}>`
    }
    case 'bulletList':
      return `<ul style="${STYLE.list}">${renderChildren(node, ctx)}</ul>`
    case 'orderedList':
      return `<ol style="${STYLE.list}">${renderChildren(node, ctx)}</ol>`
    case 'listItem':
      return `<li style="${STYLE.li}">${renderChildren(node, ctx, true)}</li>`
    case 'blockquote':
      return `<blockquote style="${STYLE.quote}">${renderChildren(node, ctx, true)}</blockquote>`
    case 'hardBreak':
      return '<br>'
    case 'image': {
      const src = node.attrs?.src
      if (!isAllowedImageSrc(src, ctx.imagePrefix)) return ''
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : ''
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" width="${BODY_WIDTH}" style="${STYLE.img}">`
    }
    default:
      return ''
  }
}

function inlineText(node: DocNode, ctx: Ctx): string {
  switch (node.type) {
    case 'text': {
      const text = node.text ?? ''
      const href = node.marks?.find((mark) => mark.type === 'link')?.attrs?.href
      return isSafeHref(href) ? `${text} (${absoluteHref(href, ctx.siteUrl)})` : text
    }
    case 'hardBreak':
      return '\n'
    case 'image':
      return ''
    default:
      return (node.content ?? []).map((child) => inlineText(child, ctx)).join('')
  }
}

function blockText(node: DocNode, ctx: Ctx): string {
  const children = node.content ?? []
  switch (node.type) {
    case 'bulletList':
    case 'orderedList':
      return children
        .map((item, i) => {
          const bullet = node.type === 'orderedList' ? `${i + 1}.` : '-'
          return `${bullet} ${(item.content ?? []).map((c) => blockText(c, ctx)).join('\n').trim()}`
        })
        .join('\n')
    case 'blockquote':
      return children.map((child) => `> ${blockText(child, ctx)}`).join('\n')
    case 'heading':
      return inlineText(node, ctx).toUpperCase()
    default:
      return inlineText(node, ctx)
  }
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>`
    + `<td style="border-radius:999px;background:${C.dark}">`
    + `<a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:${F.sans};font-size:15px;font-weight:bold;color:${C.white};text-decoration:none;border-radius:999px">${escapeHtml(label)}</a>`
    + `</td></tr></table>`
}

type LayoutParts = { article: NewsletterArticle; ctx: Ctx; url: string; byline: string; body: string; options: RenderOptions }

function layout({ article, ctx, url, byline, body, options }: LayoutParts): string {
  const cover = isAllowedImageSrc(article.cover_image, ctx.imagePrefix)
    ? `<tr><td><img src="${escapeHtml(article.cover_image)}" alt="${escapeHtml(article.cover_image_alt ?? '')}" width="600" style="display:block;width:100%;height:auto;border:0"></td></tr>`
    : ''
  const small = `font-family:${F.sans};font-size:12px;line-height:1.6;color:${C.muted}`

  return `<!doctype html>
<html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(article.title)}</title></head>
<body style="margin:0;padding:0;background:${C.page}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(article.excerpt)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${C.white};border:1px solid ${C.border};border-radius:16px;overflow:hidden">
<tr><td style="background:${C.dark};padding:20px 32px;font-family:${F.serif};font-size:20px;font-weight:bold;letter-spacing:4px;color:${C.white}">FERA PADEL</td></tr>
${cover}
<tr><td style="padding:32px 32px 8px">
<p style="margin:0 0 12px;font-family:${F.sans};font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${C.accent}">${escapeHtml(article.category)}</p>
<h1 style="margin:0 0 12px;font-family:${F.serif};font-size:30px;line-height:1.2;color:${C.text}">${escapeHtml(article.title)}</h1>
${byline ? `<p style="margin:0 0 28px;font-family:${F.sans};font-size:14px;color:${C.muted}">${escapeHtml(byline)}</p>` : ''}
${body}
</td></tr>
<tr><td style="padding:8px 32px 40px">${button(url, 'Les på nettsiden')}</td></tr>
</table>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px"><tr><td align="center" style="padding:24px 32px;${small}">
${FOOTER_REASON}<br>
<a href="${escapeHtml(options.unsubscribeUrl)}" style="color:${C.muted};text-decoration:underline">Meld deg av</a><br>
${escapeHtml(options.senderInfo)}
</td></tr></table>
</td></tr></table>
</body></html>`
}

export function renderNewsletter(article: NewsletterArticle, options: RenderOptions): RenderedEmail {
  const ctx: Ctx = { siteUrl: options.siteUrl, imagePrefix: options.imagePrefix ?? storagePublicPrefix() }
  const url = articleUrl(options.siteUrl, article.slug)
  const byline = [article.author_name, formatArticleDate(article.published_at)].filter(Boolean).join(' · ')
  const body = article.content.content.map((node) => renderNode(node, ctx, false)).join('')
  const bodyText = article.content.content
    .map((node) => blockText(node, ctx))
    .filter((block) => block.trim() !== '')
    .join('\n\n')

  const text = [
    article.title,
    byline,
    '',
    article.excerpt,
    '',
    bodyText,
    '',
    `Les på nettsiden: ${url}`,
    '',
    '—',
    FOOTER_REASON,
    `Meld deg av: ${options.unsubscribeUrl}`,
    options.senderInfo,
  ].join('\n')

  return { subject: article.title, html: layout({ article, ctx, url, byline, body, options }), text }
}
