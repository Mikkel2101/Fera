import { describe, it, expect } from 'vitest'
import { stripExternalImages, removedImagesMessage } from '@/lib/articles/paste'

const PREFIX = 'https://test.supabase.co/storage/v1/object/public/'
const OWN = `${PREFIX}articles/a/b.webp`

describe('stripExternalImages', () => {
  it('lar HTML uten bilder være urørt', () => {
    const html = '<p>Hei <strong>der</strong></p>'
    expect(stripExternalImages(html, PREFIX)).toEqual({ html, removed: 0 })
  })

  it('beholder bilder fra egen Storage', () => {
    const html = `<p>Tekst</p><img src="${OWN}" alt="x">`
    expect(stripExternalImages(html, PREFIX)).toEqual({ html, removed: 0 })
  })

  it('fjerner bilder fra andre nettsider og teller dem', () => {
    const html = `<p>Tekst</p><img src="https://evil.com/a.jpg"><img src="${OWN}"><img src="data:image/png;base64,AAA">`
    const result = stripExternalImages(html, PREFIX)
    expect(result.removed).toBe(2)
    expect(result.html).toContain('<p>Tekst</p>')
    expect(result.html).toContain(OWN)
    expect(result.html).not.toContain('evil.com')
    expect(result.html).not.toContain('data:image')
  })

  it('fjerner bilder uten src', () => {
    expect(stripExternalImages('<img alt="tom">', PREFIX).removed).toBe(1)
  })
})

describe('removedImagesMessage', () => {
  it('bruker entall for ett bilde', () => {
    expect(removedImagesMessage(1)).toBe(
      '1 bilde fra en annen nettside ble ikke tatt med — last det opp med Bilde-knappen.',
    )
  })
  it('bruker flertall for flere bilder', () => {
    expect(removedImagesMessage(3)).toBe(
      '3 bilder fra andre nettsider ble ikke tatt med — last dem opp med Bilde-knappen.',
    )
  })
})
