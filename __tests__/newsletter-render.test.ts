import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { renderNewsletter, type NewsletterArticle } from '@/lib/newsletter/render'
import { newsletterComposer } from '@/lib/newsletter/compose'
import { EMAIL_COLORS } from '@/lib/newsletter/theme'
import { verifyUnsubscribe } from '@/lib/newsletter/token'
import type { NewsletterConfig } from '@/lib/newsletter/config'

const PREFIX = 'https://test.supabase.co/storage/v1/object/public/'
const SITE = 'https://ferapadel.com'
const UNSUB = `${SITE}/nyhetsbrev/avmeld?e=abc&t=def`

const article: NewsletterArticle = {
  slug: 'min-tur',
  title: 'Sol & <padel> i Spania',
  excerpt: 'Ingress med "sitat"',
  category: 'Reiserapport',
  cover_image: `${PREFIX}articles/1/cover.webp`,
  cover_image_alt: 'Bane i sol',
  author_name: 'Petter',
  published_at: '2026-05-20T12:00:00.000Z',
  content: {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Dag 1' }] },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Se ' },
          { type: 'text', text: 'turene', marks: [{ type: 'link', attrs: { href: '/travels' } }] },
          { type: 'text', text: ' og ' },
          { type: 'text', text: 'denne', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] },
          { type: 'text', text: ' fet', marks: [{ type: 'bold' }] },
        ],
      },
      { type: 'image', attrs: { src: 'https://evil.com/x.jpg', alt: 'ekstern' } },
      { type: 'image', attrs: { src: `${PREFIX}articles/1/a.webp`, alt: 'egen' } },
      {
        type: 'bulletList',
        content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Racket' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sko' }] }] },
        ],
      },
      { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Beste uka' }] }] },
    ],
  },
}

const options = { siteUrl: SITE, unsubscribeUrl: UNSUB, senderInfo: 'Fera Padel · ferapadel.com', imagePrefix: PREFIX }

describe('renderNewsletter', () => {
  const email = renderNewsletter(article, options)

  it('bruker tittelen som emne', () => {
    expect(email.subject).toBe('Sol & <padel> i Spania')
  })

  it('escaper tittel og ingress i HTML', () => {
    expect(email.html).toContain('Sol &amp; &lt;padel&gt; i Spania')
    expect(email.html).not.toContain('<padel>')
    expect(email.html).toContain('Ingress med &quot;sitat&quot;')
  })

  it('gjør interne lenker absolutte og fjerner usikre', () => {
    expect(email.html).toContain(`href="${SITE}/travels"`)
    expect(email.html).not.toContain('javascript:')
    expect(email.html).toContain('denne')
    expect(email.html).toContain('<strong> fet</strong>')
  })

  it('tar bare med bilder fra egen Storage', () => {
    expect(email.html).not.toContain('evil.com')
    expect(email.html).toContain(`${PREFIX}articles/1/a.webp`)
    expect(email.html).toContain(`src="${PREFIX}articles/1/cover.webp"`)
    expect(email.html).toContain('alt="Bane i sol"')
  })

  it('har knapp til artikkelen, avmelding og avsenderinfo', () => {
    expect(email.html).toContain(`href="${SITE}/travels/inspirasjon/min-tur"`)
    expect(email.html).toContain('Les på nettsiden')
    expect(email.html).toContain(`href="${UNSUB.replace(/&/g, '&amp;')}"`)
    expect(email.html).toContain('Meld deg av')
    expect(email.html).toContain('Fera Padel · ferapadel.com')
    expect(email.html).toContain('20. mai 2026')
  })

  it('lager ren tekst med lister, lenker og avmelding', () => {
    expect(email.text).toContain('Sol & <padel> i Spania')
    expect(email.text).toContain(`turene (${SITE}/travels)`)
    expect(email.text).toContain('- Racket')
    expect(email.text).toContain('> Beste uka')
    expect(email.text).toContain(`Les på nettsiden: ${SITE}/travels/inspirasjon/min-tur`)
    expect(email.text).toContain(`Meld deg av: ${UNSUB}`)
    expect(email.text).not.toContain('javascript:')
  })

  it('utelater forsidebilde som ikke er fra egen Storage', () => {
    const html = renderNewsletter({ ...article, cover_image: 'https://evil.com/c.jpg' }, options).html
    expect(html).not.toContain('evil.com')
  })
})

describe('EMAIL_COLORS', () => {
  it('speiler fargetokens i globals.css', () => {
    const css = readFileSync(path.resolve(__dirname, '../app/globals.css'), 'utf8').toUpperCase()
    for (const value of Object.values(EMAIL_COLORS)) {
      expect(css).toContain(value.toUpperCase())
    }
  })
})

describe('newsletterComposer', () => {
  const config: NewsletterConfig = {
    from: 'Fera Padel <nyhetsbrev@ferabrand.com>',
    replyTo: 'post@ferabrand.com',
    senderInfo: 'Fera Padel',
    siteUrl: SITE,
    secret: 's'.repeat(40),
  }

  it('lager personlig e-post med one-click-avmelding i headerne', () => {
    const message = newsletterComposer(article, config)('Ola@Example.no')
    expect(message.to).toBe('Ola@Example.no')
    expect(message.subject).toBe(article.title)
    expect(message.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
    const oneClick = message.headers['List-Unsubscribe'].slice(1, -1)
    expect(oneClick.startsWith(`${SITE}/api/nyhetsbrev/avmeld?`)).toBe(true)
    const params = new URL(oneClick).searchParams
    expect(verifyUnsubscribe(params.get('e'), params.get('t'), config.secret)).toBe('ola@example.no')
    expect(message.html).toContain(`${SITE}/nyhetsbrev/avmeld?`)
  })

  it('legger testprefiks på emnet', () => {
    expect(newsletterComposer(article, config, '[Test] ')('a@b.no').subject).toBe(`[Test] ${article.title}`)
  })
})
