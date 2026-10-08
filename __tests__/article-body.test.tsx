import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import ArticleBody from '@/components/articles/ArticleBody'
import type { ArticleDoc } from '@/lib/articles/types'

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}))
vi.mock('next/link', () => ({
  default: (props: { href: string; children: React.ReactNode }) => <a href={props.href}>{props.children}</a>,
}))

const PREFIX = 'https://test.supabase.co/storage/v1/object/public/'

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co'))
afterEach(() => vi.unstubAllEnvs())

const doc = (content: ArticleDoc['content']): ArticleDoc => ({ type: 'doc', content })

describe('ArticleBody', () => {
  it('rendrer kjente noder og marks', () => {
    const { container } = render(<ArticleBody doc={doc([
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Overskrift' }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Under' }] },
      { type: 'paragraph', content: [
        { type: 'text', text: 'fet', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'kursiv', marks: [{ type: 'italic' }] },
      ] },
      { type: 'orderedList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'en' }] }] }] },
      { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'sitat' }] }] },
    ])} />)

    expect(container.querySelector('.prose-fera h2')?.textContent).toBe('Overskrift')
    expect(container.querySelector('h3')?.textContent).toBe('Under')
    expect(container.querySelector('strong')?.textContent).toBe('fet')
    expect(container.querySelector('em')?.textContent).toBe('kursiv')
    expect(container.querySelector('ol li')?.textContent).toBe('en')
    expect(container.querySelector('blockquote')?.textContent).toBe('sitat')
  })

  it('åpner eksterne lenker i ny fane og holder interne lenker interne', () => {
    const { container } = render(<ArticleBody doc={doc([{ type: 'paragraph', content: [
      { type: 'text', text: 'ekstern', marks: [{ type: 'link', attrs: { href: 'https://example.com' } }] },
      { type: 'text', text: 'intern', marks: [{ type: 'link', attrs: { href: '/travels' } }] },
    ] }])} />)

    const [external, internal] = Array.from(container.querySelectorAll('a'))
    expect(external.getAttribute('href')).toBe('https://example.com')
    expect(external.getAttribute('target')).toBe('_blank')
    expect(external.getAttribute('rel')).toBe('noopener noreferrer')
    expect(internal.getAttribute('href')).toBe('/travels')
    expect(internal.getAttribute('target')).toBeNull()
  })

  it('dropper javascript:-lenker men beholder teksten', () => {
    const { container } = render(<ArticleBody doc={doc([{ type: 'paragraph', content: [
      { type: 'text', text: 'klikk', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] },
    ] }])} />)

    expect(container.querySelector('a')).toBeNull()
    expect(container.textContent).toBe('klikk')
  })

  it('ignorerer ukjente noder og bilder fra fremmede domener', () => {
    const { container } = render(<ArticleBody doc={doc([
      { type: 'iframe', attrs: { src: 'https://evil.com' } },
      { type: 'image', attrs: { src: 'https://evil.com/x.jpg', alt: 'x' } },
      { type: 'image', attrs: { src: `${PREFIX}articles/a.webp`, alt: 'Bane' } },
    ])} />)

    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(1)
    expect(images[0].getAttribute('alt')).toBe('Bane')
    expect(container.querySelector('iframe')).toBeNull()
  })
})
