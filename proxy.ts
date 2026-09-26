import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

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
  if (process.env.COMING_SOON === 'true') {
    const isStaticAsset = pathname.startsWith('/_next') || pathname.includes('.')
    const isAdmin = pathname.startsWith('/admin') || cleanHost.startsWith('admin.')
    // Supabase-proxyen og auth-callbacken holder /admin i live. Stripe-webhooken
    // må kunne svare på ekte leveranser selv mens siden er skjult.
    const isAllowedApi =
      pathname.startsWith('/api/supabase') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/webhooks')

    if (!isStaticAsset && !isAdmin && !isAllowedApi) {
      // Rewrite til en HTML-placeholder gir mening for sider, ikke for API-er.
      if (pathname.startsWith('/api')) {
        return new NextResponse(null, { status: 404 })
      }
      return NextResponse.rewrite(new URL('/coming-soon', request.url))
    }
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
