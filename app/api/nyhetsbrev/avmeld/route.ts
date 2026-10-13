import { NextRequest, NextResponse } from 'next/server'
import { unsubscribe } from '@/lib/newsletter/unsubscribe'

// One-click-avmelding (RFC 8058): Gmail/Yahoo POSTer hit når mottakeren trykker
// «Avslutt abonnement» i e-postklienten. Lenken er signert, så ingen innlogging.
export async function POST(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const outcome = await unsubscribe(params.get('e'), params.get('t'))
  const status = outcome === 'ok' ? 200 : outcome === 'invalid' ? 400 : 500
  return new NextResponse(null, { status })
}

// E-postklienter uten RFC 8058 åpner List-Unsubscribe-lenken i nettleseren (GET).
// Send dem til bekreftelsessiden; GET skal aldri melde av (lenkeskannere).
export function GET(request: NextRequest) {
  const page = new URL('/nyhetsbrev/avmeld', request.nextUrl)
  page.search = request.nextUrl.search
  return NextResponse.redirect(page, 303)
}
