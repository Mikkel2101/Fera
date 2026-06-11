import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

const BRAND_MAP: Record<string, string> = {}

const REDIRECT_MAP: Record<string, string> = {
  'padeltur.no': 'https://ferabrand.com',
  'padelreise.no': 'https://ferabrand.com',
  'ferashop.no': 'https://ferabrand.com',
  'www.ferashop.no': 'https://ferabrand.com',
  'feratravels.no': 'https://ferabrand.com',
  'www.feratravels.no': 'https://ferabrand.com',
  'feratravels.com': 'https://ferabrand.com',
  'www.feratravels.com': 'https://ferabrand.com',
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const cleanHost = hostname.split(':')[0]
  const pathname = request.nextUrl.pathname

  const response = await updateSession(request)

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

  // Coming soon — send all public traffic to placeholder, keep admin intact
  if (process.env.COMING_SOON === 'true') {
    if (!pathname.startsWith('/admin') && !cleanHost.startsWith('admin.')) {
      const url = new URL('/coming-soon', request.url)
      return NextResponse.rewrite(url)
    }
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
