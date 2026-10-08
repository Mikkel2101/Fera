// Rutingregler for proxy.ts som er rene funksjoner, så de kan testes.

export type ShopGateResult = { type: 'redirect'; to: string } | { type: 'not_found' } | null

// Mens shop er skjult: forsiden sendes til reiser, shop-sider til ventelista
// for FERA-kolleksjonen, og shop-API-et svarer 404. /no-prefikset (norsk
// kanonisk rot) håndteres likt.
export function shopGate(pathname: string, shopEnabled: boolean): ShopGateResult {
  if (shopEnabled) return null

  const path = pathname === '/no' || pathname === '/no/'
    ? '/'
    : pathname.startsWith('/no/') ? pathname.slice(3) : pathname

  if (path.startsWith('/api/shop')) return { type: 'not_found' }
  if (path === '/') return { type: 'redirect', to: '/travels' }
  if (path === '/shop' || path.startsWith('/shop/')) {
    return { type: 'redirect', to: '/kolleksjon' }
  }
  return null
}

// Sider som ligger direkte under app/ og ikke skal omskrives til /travels/*
// av brand-fallbacken nederst i proxy.ts.
const ROOT_APP_PATHS = ['/account', '/logg-inn', '/personvern', '/vilkar', '/coming-soon', '/kolleksjon']

export function isRootAppPath(pathname: string): boolean {
  return ROOT_APP_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))
}
