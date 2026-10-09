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
