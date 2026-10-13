import { describe, it, expect } from 'vitest'
import {
  signEmail, encodeEmail, decodeEmail, verifyUnsubscribe, unsubscribeLinks,
} from '@/lib/newsletter/token'
import { newsletterConfig, readUnsubscribeSecret } from '@/lib/newsletter/config'

const SECRET = 'a'.repeat(40)
const SITE = 'https://ferapadel.com'

function paramsOf(url: string) {
  const params = new URL(url).searchParams
  return { e: params.get('e'), t: params.get('t') }
}

describe('avmeldingstoken', () => {
  it('lenken verifiseres tilbake til e-posten i små bokstaver', () => {
    const { page, oneClick } = unsubscribeLinks('Ola@Example.no', SECRET, SITE)
    expect(page.startsWith(`${SITE}/nyhetsbrev/avmeld?`)).toBe(true)
    expect(oneClick.startsWith(`${SITE}/api/nyhetsbrev/avmeld?`)).toBe(true)
    const { e, t } = paramsOf(page)
    expect(verifyUnsubscribe(e, t, SECRET)).toBe('ola@example.no')
  })

  it('gir samme token uansett store og små bokstaver', () => {
    expect(signEmail('OLA@example.no', SECRET)).toBe(signEmail(' ola@example.no ', SECRET))
  })

  it('avviser manipulert token', () => {
    const { e, t } = paramsOf(unsubscribeLinks('ola@example.no', SECRET, SITE).page)
    const tampered = `${t!.slice(0, -1)}${t!.endsWith('A') ? 'B' : 'A'}`
    expect(verifyUnsubscribe(e, tampered, SECRET)).toBeNull()
  })

  it('avviser token for en annen e-post', () => {
    const { t } = paramsOf(unsubscribeLinks('ola@example.no', SECRET, SITE).page)
    expect(verifyUnsubscribe(encodeEmail('kari@example.no'), t, SECRET)).toBeNull()
  })

  it('avviser token signert med en annen hemmelighet', () => {
    const { e, t } = paramsOf(unsubscribeLinks('ola@example.no', SECRET, SITE).page)
    expect(verifyUnsubscribe(e, t, 'b'.repeat(40))).toBeNull()
  })

  it.each([
    [null, 'x'], ['x', null], [undefined, undefined], ['', ''],
  ])('avviser manglende felter (%s, %s)', (e, t) => {
    expect(verifyUnsubscribe(e, t, SECRET)).toBeNull()
  })

  it('avviser når hemmeligheten mangler', () => {
    const { e, t } = paramsOf(unsubscribeLinks('ola@example.no', SECRET, SITE).page)
    expect(verifyUnsubscribe(e, t, '')).toBeNull()
  })

  it('decodeEmail avviser søppel', () => {
    expect(decodeEmail('!!!')).toBeNull()
    expect(decodeEmail(Buffer.from('ikke-en-epost').toString('base64url'))).toBeNull()
    expect(decodeEmail(encodeEmail('Per@Example.no'))).toBe('per@example.no')
  })

  it('signEmail kaster uten hemmelighet', () => {
    expect(() => signEmail('ola@example.no', '')).toThrow()
  })
})

describe('newsletterConfig', () => {
  it('bruker standardverdier', () => {
    expect(newsletterConfig({ NEWSLETTER_UNSUBSCRIBE_SECRET: SECRET })).toEqual({
      from: 'Fera Padel <nyhetsbrev@ferabrand.com>',
      replyTo: 'post@ferabrand.com',
      senderInfo: 'Fera Padel · ferapadel.com · post@ferabrand.com',
      siteUrl: 'https://ferapadel.com',
      secret: SECRET,
    })
  })

  it('kan overstyres fra env og fjerner avsluttende skråstrek', () => {
    const config = newsletterConfig({
      NEWSLETTER_UNSUBSCRIBE_SECRET: SECRET,
      NEWSLETTER_FROM: 'Fera <hei@ferabrand.com>',
      NEWSLETTER_SITE_URL: 'http://localhost:3000/',
      NEWSLETTER_SENDER_INFO: '  ',
    })
    expect(config.from).toBe('Fera <hei@ferabrand.com>')
    expect(config.siteUrl).toBe('http://localhost:3000')
    expect(config.senderInfo).toBe('Fera Padel · ferapadel.com · post@ferabrand.com')
  })

  it('kaster når hemmeligheten mangler eller er for kort', () => {
    expect(() => newsletterConfig({})).toThrow(/NEWSLETTER_UNSUBSCRIBE_SECRET/)
    expect(() => newsletterConfig({ NEWSLETTER_UNSUBSCRIBE_SECRET: 'kort' })).toThrow()
  })

  it('readUnsubscribeSecret gir null når den mangler', () => {
    expect(readUnsubscribeSecret({})).toBeNull()
    expect(readUnsubscribeSecret({ NEWSLETTER_UNSUBSCRIBE_SECRET: SECRET })).toBe(SECRET)
  })
})
