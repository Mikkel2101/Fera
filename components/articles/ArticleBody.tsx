import { Fragment, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ArticleDoc, DocMark, DocNode } from '@/lib/articles/types'
import { isAllowedImageSrc, isSafeHref } from '@/lib/articles/content'

function applyMark(child: ReactNode, mark: DocMark): ReactNode {
  switch (mark.type) {
    case 'bold':
      return <strong>{child}</strong>
    case 'italic':
      return <em>{child}</em>
    case 'link': {
      const href = mark.attrs?.href
      if (!isSafeHref(href)) return child
      if (href.startsWith('/')) return <Link href={href}>{child}</Link>
      return <a href={href} target="_blank" rel="noopener noreferrer">{child}</a>
    }
    default:
      return child
  }
}

function renderNode(node: DocNode, key: string): ReactNode {
  const children = () => (node.content ?? []).map((child, i) => renderNode(child, `${key}-${i}`))

  switch (node.type) {
    case 'text':
      return <Fragment key={key}>{(node.marks ?? []).reduce<ReactNode>(applyMark, node.text ?? '')}</Fragment>
    case 'paragraph':
      return <p key={key}>{children()}</p>
    case 'heading':
      return node.attrs?.level === 3 ? <h3 key={key}>{children()}</h3> : <h2 key={key}>{children()}</h2>
    case 'bulletList':
      return <ul key={key}>{children()}</ul>
    case 'orderedList':
      return <ol key={key}>{children()}</ol>
    case 'listItem':
      return <li key={key}>{children()}</li>
    case 'blockquote':
      return <blockquote key={key}>{children()}</blockquote>
    case 'hardBreak':
      return <br key={key} />
    case 'image': {
      const src = node.attrs?.src
      if (!isAllowedImageSrc(src)) return null
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : ''
      return (
        <Image
          key={key}
          src={src}
          alt={alt}
          width={1600}
          height={1000}
          sizes="(max-width: 768px) 100vw, 768px"
          className="w-full h-auto rounded-2xl my-8"
          unoptimized
        />
      )
    }
    default:
      return null
  }
}

export default function ArticleBody({ doc }: { doc: ArticleDoc }) {
  return <div className="prose-fera">{doc.content.map((node, i) => renderNode(node, String(i)))}</div>
}
