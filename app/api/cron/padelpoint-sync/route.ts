import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60
import { createServiceClient } from '@/lib/supabase/service'
import { syncProducts } from '@/lib/padelpoint/sync'
import { fixturesAdapter } from '@/lib/padelpoint/fixtures'
import { tiendaPadelpointAdapter } from '@/lib/padelpoint/scraper'

// NOTE: PADELPOINT_SYNC_ENABLED=true aktiverer sync mot fixtures (eller live scraper).
// Scraping-target: tiendapadelpoint.com (bekreftet av Willie Lizier 2026-06-15 som primær kilde).
// PADELPOINT_USE_FIXTURES=false bytter fra fixtures til live scraper.
// Endepunktet beskyttes av CRON_SECRET (Vercel Cron eller manuell kall via curl).
export async function POST(request: NextRequest) {
  if (process.env.PADELPOINT_SYNC_ENABLED !== 'true') {
    return NextResponse.json({ message: 'Sync er deaktivert (PADELPOINT_SYNC_ENABLED er ikke satt til true)' })
  }

  const cronSecret = request.headers.get('x-cron-secret')
  // Alltid sjekk — hvis CRON_SECRET ikke er satt er endepunktet åpent, noe vi aldri vil
  if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const useFixtures = process.env.PADELPOINT_USE_FIXTURES !== 'false'
  const adapter = useFixtures ? fixturesAdapter : tiendaPadelpointAdapter

  const supabase = createServiceClient()

  try {
    const result = await syncProducts(adapter, supabase)
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    console.error('padelpoint-sync feil:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// Støtt GET for Vercel Cron (cron-jobs sender GET)
export async function GET(request: NextRequest) {
  return POST(request)
}
