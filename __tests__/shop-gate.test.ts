import { describe, it, expect } from 'vitest'
import { shopGate, isRootAppPath } from '@/lib/routing/shop-gate'

describe('shopGate (shop skjult)', () => {
  it('sender forsiden til /travels', () => {
    expect(shopGate('/', false)).toEqual({ type: 'redirect', to: '/travels' })
  })

  it('sender /no og /no/ til /travels', () => {
    expect(shopGate('/no', false)).toEqual({ type: 'redirect', to: '/travels' })
    expect(shopGate('/no/', false)).toEqual({ type: 'redirect', to: '/travels' })
  })

  it('sender shop-sider til /travels', () => {
    expect(shopGate('/shop', false)).toEqual({ type: 'redirect', to: '/travels' })
    expect(shopGate('/shop/abc-123', false)).toEqual({ type: 'redirect', to: '/travels' })
    expect(shopGate('/no/shop/abc', false)).toEqual({ type: 'redirect', to: '/travels' })
  })

  it('gir 404 for shop-API-et', () => {
    expect(shopGate('/api/shop/checkout', false)).toEqual({ type: 'not_found' })
  })

  it('slipper gjennom reiser og andre sider', () => {
    expect(shopGate('/travels', false)).toBeNull()
    expect(shopGate('/travels/abc/book', false)).toBeNull()
    expect(shopGate('/account', false)).toBeNull()
    expect(shopGate('/shopping-guide', false)).toBeNull()
  })
})

describe('shopGate (shop på)', () => {
  it('lar alt passere', () => {
    expect(shopGate('/', true)).toBeNull()
    expect(shopGate('/shop', true)).toBeNull()
    expect(shopGate('/api/shop/checkout', true)).toBeNull()
  })
})

describe('isRootAppPath', () => {
  it('kjenner igjen sider som ligger på rotnivå i app/', () => {
    expect(isRootAppPath('/account')).toBe(true)
    expect(isRootAppPath('/account/trips')).toBe(true)
    expect(isRootAppPath('/logg-inn')).toBe(true)
    expect(isRootAppPath('/personvern')).toBe(true)
    expect(isRootAppPath('/vilkar')).toBe(true)
  })

  it('matcher ikke stier som bare starter likt', () => {
    expect(isRootAppPath('/accounting')).toBe(false)
    expect(isRootAppPath('/om-oss')).toBe(false)
  })
})
