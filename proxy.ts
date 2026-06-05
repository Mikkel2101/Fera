import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

const BRAND_MAP: Record<string, string> = {
  'feratravels.no': 'travels',
  'feratravels.com': 'travels',
  'ferashop.no': 'shop',
}

const REDIRECT_MAP: Record<string, string> = {
  'padeltur.no': 'https://feratravels.no',
  'padelreise.no': 'https://feratravels.no',
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

  if (cleanHost.startsWith('admin.') || pathname.startsWith('/admin')) {
    return response
  }

  const brand = BRAND_MAP[cleanHost] ?? process.env.NEXT_PUBLIC_DEFAULT_BRAND ?? 'travels'
  const url = new URL(`/${brand}${pathname === '/' ? '' : pathname}`, request.url)
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
