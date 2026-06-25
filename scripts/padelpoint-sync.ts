/**
 * Lokalt sync-script — kjør fra prosjektrot:
 *   npm run sync:padelpoint
 *
 * Laster .env.local automatisk. Sett PADELPOINT_MAX_PAGES for å styre
 * antall sider per kategori (default 3 = ~72 produkter per kjøring).
 *   PADELPOINT_MAX_PAGES=10 npm run sync:padelpoint
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/supabase/types'

// Last .env.local FØR vi kaller scraper (MAX_PAGES leses ved kall-tid nå)
function loadEnvLocal() {
  try {
    const content = readFileSync('.env.local', 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const raw = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      if (key && !process.env[key]) process.env[key] = raw
    }
  } catch {
    // .env.local ikke funnet — bruker eksisterende env
  }
}

async function main() {
  loadEnvLocal()

  // Lokalt kjøring bruker flere sider enn Vercel-default på 1
  if (!process.env.PADELPOINT_MAX_PAGES) process.env.PADELPOINT_MAX_PAGES = '3'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Mangler NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY i .env.local')
    console.error('   Kjør: npx vercel env pull .env.local --environment production')
    process.exit(1)
  }

  // Importer etter at env er satt (MAX_PAGES leses ved fetchProducts()-kall)
  const { tiendaPadelpointAdapter } = await import('../lib/padelpoint/scraper')
  const { syncProducts }            = await import('../lib/padelpoint/sync')

  const supabase = createClient<Database>(supabaseUrl, serviceKey)

  console.log(`🏓 Padelpoint-sync starter (${process.env.PADELPOINT_MAX_PAGES} sider per kategori)...`)

  const result = await syncProducts(tiendaPadelpointAdapter, supabase)

  console.log('✅ Ferdig!')
  console.log(`   Upserted : ${result.upserted}`)
  console.log(`   Skipped  : ${result.skipped}`)
  console.log(`   Flagged  : ${result.flagged}`)
  if (result.errors.length > 0) {
    console.log(`   Errors (${result.errors.length}):`)
    result.errors.slice(0, 5).forEach(e => console.log(`     - ${e}`))
  }
}

main().catch(err => {
  console.error('❌ Feil:', err)
  process.exit(1)
})
