import { describe, it, expect } from 'vitest'

type BrandResult =
  | { type: 'rewrite'; brand: string }
  | { type: 'redirect'; url: string }
  | { type: 'passthrough' }

const BRAND_MAP: Record<string, string> = {
  'feratravels.no': 'travels',
  'feratravels.com': 'travels',
  'ferashop.no': 'shop',
}

const REDIRECT_MAP: Record<string, string> = {
  'padeltur.no': 'https://feratravels.no',
  'padelreise.no': 'https://feratravels.no',
}

function resolveHostname(hostname: string, defaultBrand = 'travels'): BrandResult {
  const cleanHost = hostname.split(':')[0]

  if (REDIRECT_MAP[cleanHost]) {
    return { type: 'redirect', url: REDIRECT_MAP[cleanHost] }
  }
  if (cleanHost.startsWith('admin.')) {
    return { type: 'rewrite', brand: 'admin' }
  }
  if (BRAND_MAP[cleanHost]) {
    return { type: 'rewrite', brand: BRAND_MAP[cleanHost] }
  }
  return { type: 'rewrite', brand: defaultBrand }
}

describe('resolveHostname', () => {
  it('ruter feratravels.no til travels', () => {
    expect(resolveHostname('feratravels.no')).toEqual({ type: 'rewrite', brand: 'travels' })
  })

  it('ruter feratravels.com til travels', () => {
    expect(resolveHostname('feratravels.com')).toEqual({ type: 'rewrite', brand: 'travels' })
  })

  it('ruter ferashop.no til shop', () => {
    expect(resolveHostname('ferashop.no')).toEqual({ type: 'rewrite', brand: 'shop' })
  })

  it('redirecter padeltur.no til feratravels.no', () => {
    expect(resolveHostname('padeltur.no')).toEqual({
      type: 'redirect',
      url: 'https://feratravels.no',
    })
  })

  it('redirecter padelreise.no til feratravels.no', () => {
    expect(resolveHostname('padelreise.no')).toEqual({
      type: 'redirect',
      url: 'https://feratravels.no',
    })
  })

  it('ruter admin.feratravels.no til admin', () => {
    expect(resolveHostname('admin.feratravels.no')).toEqual({ type: 'rewrite', brand: 'admin' })
  })

  it('ruter localhost:3000 til default brand', () => {
    expect(resolveHostname('localhost:3000')).toEqual({ type: 'rewrite', brand: 'travels' })
  })

  it('respekterer custom defaultBrand', () => {
    expect(resolveHostname('localhost:3000', 'shop')).toEqual({ type: 'rewrite', brand: 'shop' })
  })
})
