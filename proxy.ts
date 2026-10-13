import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { SHOP_ENABLED } from '@/lib/flags'
import { isRootAppPath, shopGate } from '@/lib/routing/shop-gate'
import { isOpenDuringComingSoon } from '@/lib/routing/coming-soon'

const BRAND_MAP: Record<string, string> = {}

// Primærdomene er ferapadel.com — alt annet redirecter dit.
// Aktiver ved å legge domenene til i Vercel og peke DNS.
const PRIMARY = 'https://ferapadel.com'

const REDIRECT_MAP: Record<string, string> = {
  // Gamle ferabrand-domener → ferapadel.com
  'ferabrand.com':             PRIMARY,
  'www.ferabrand.com':         PRIMARY,
  // Norsk inngang → norsk kanonisk URL
  'ferapadel.no':              `${PRIMARY}/no`,
  'www.ferapadel.no':          `${PRIMARY}/no`,
  // Nisjedomener → riktig seksjon
  'ferashop.no':               `${PRIMARY}/shop`,
  'www.ferashop.no':           `${PRIMARY}/shop`,
  'feratravels.no':            `${PRIMARY}/travels`,
  'www.feratravels.no':        `${PRIMARY}/travels`,
  'feratravels.com':           `${PRIMARY}/travels`,
  'www.feratravels.com':       `${PRIMARY}/travels`,
  'padeltur.no':               `${PRIMARY}/travels`,
  'padelreise.no':             `${PRIMARY}/travels`,
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const cleanHost = hostname.split(':')[0]
  const pathname = request.nextUrl.pathname

  const response = await updateSession(request)

  // Coming soon må sjekkes FØR alt annet. Ligger den lenger ned slipper både
  // /api-bypassen under og /no-rewritene nedenfor trafikk rett forbi
  // placeholderen — ferapadel.no redirecter til /no, som rewriter til / .
  // Unntakene (admin, webhooks, avmelding fra nyhetsbrev …) ligger i isOpenDuringComingSoon.
  if (process.env.COMING_SOON === 'true' && !isOpenDuringComingSoon(pathname, cleanHost)) {
    // Rewrite til en HTML-placeholder gir mening for sider, ikke for API-er.
    if (pathname.startsWith('/api')) {
      return new NextResponse(null, { status: 404 })
    }
    return NextResponse.rewrite(new URL('/coming-soon', request.url))
  }

  // FeraShop er skjult til lansering — må ligge før /api-bypassen og
  // /no-rewritene under, ellers slipper /api/shop og /no/shop forbi.
  const gate = shopGate(pathname, SHOP_ENABLED)
  if (gate?.type === 'not_found') {
    return new NextResponse(null, { status: 404 })
  }
  if (gate?.type === 'redirect') {
    return NextResponse.redirect(new URL(gate.to, request.url), 307)
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return response
  }

  if (REDIRECT_MAP[cleanHost]) {
    return NextResponse.redirect(REDIRECT_MAP[cleanHost], 301)
  }

  // /no er norsk kanonisk rot — rewriter til / uten redirect (URL beholdes)
  if (pathname === '/no' || pathname === '/no/') {
    return NextResponse.rewrite(new URL('/', request.url))
  }
  // /no/shop, /no/travels etc. → strip /no-prefixet
  if (pathname.startsWith('/no/')) {
    return NextResponse.rewrite(new URL(pathname.replace('/no/', '/'), request.url))
  }

  if (
    cleanHost.startsWith('admin.') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/shop') ||
    pathname.startsWith('/travels') ||
    isRootAppPath(pathname) ||
    pathname === '/'
  ) {
    return response
  }

  const brand = BRAND_MAP[cleanHost] ?? process.env.NEXT_PUBLIC_DEFAULT_BRAND ?? 'travels'
  const url = new URL(`/${brand}${pathname === '/' ? '' : pathname}`, request.url)
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
