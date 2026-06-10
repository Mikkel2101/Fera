import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { PadelpointAdapter, SyncResult } from './types'

const PRICE_CHANGE_THRESHOLD = 0.40 // 40 %

type Supabase = SupabaseClient<Database>

export async function syncProducts(
  adapter:  PadelpointAdapter,
  supabase: Supabase,
): Promise<SyncResult> {
  const result: SyncResult = { upserted: 0, skipped: 0, flagged: 0, errors: [] }

  // Hent restricted brands og eksisterende produkter i én runde
  const [{ data: restrictedRows }, { data: existingProducts }] = await Promise.all([
    supabase.from('restricted_brands').select('brand'),
    supabase.from('products').select('padelpoint_url, price_eur, name'),
  ])

  const restrictedBrands = new Set(
    (restrictedRows ?? []).map(r => r.brand.toLowerCase()),
  )

  const existingByUrl = new Map(
    (existingProducts ?? []).map(p => [p.padelpoint_url, p]),
  )

  const products = await adapter.fetchProducts()

  for (const product of products) {
    try {
      // Brand guard
      if (restrictedBrands.has(product.brand.toLowerCase())) {
        result.skipped++
        continue
      }

      // Pris-sanity: avvis pris ≤ 0
      if (product.price_eur <= 0) {
        result.flagged++
        await supabase.from('price_review_queue').insert({
          padelpoint_url: product.padelpoint_url,
          product_name:   product.name,
          current_price:  existingByUrl.get(product.padelpoint_url)?.price_eur ?? null,
          proposed_price: product.price_eur,
          reason:         'Pris er 0 eller negativ — avvist automatisk',
        })
        continue
      }

      // Pris-sanity: avvis endringer > 40 % mot eksisterende pris
      const existing = existingByUrl.get(product.padelpoint_url)
      if (existing?.price_eur != null) {
        const change = Math.abs(product.price_eur - existing.price_eur) / existing.price_eur
        if (change > PRICE_CHANGE_THRESHOLD) {
          result.flagged++
          await supabase.from('price_review_queue').insert({
            padelpoint_url: product.padelpoint_url,
            product_name:   product.name,
            current_price:  existing.price_eur,
            proposed_price: product.price_eur,
            reason:         `Prisendring på ${(change * 100).toFixed(1)} % overstiger 40 %-grensen`,
          })
          continue
        }
      }

      // Last ned bilder til Supabase Storage
      const storedImages = await downloadImages(product.image_urls, product.padelpoint_url, supabase)

      // Slug fra URL
      const slug = product.padelpoint_url.split('/').pop() ?? product.name.toLowerCase().replace(/\s+/g, '-')

      // Upsert på padelpoint_url
      const { error } = await supabase.from('products').upsert(
        {
          slug,
          name:           product.name,
          brand:          product.brand,
          category:       product.category,
          description:    product.description ?? null,
          price_eur:      product.price_eur,
          stock_status:   product.stock_status,
          padelpoint_url: product.padelpoint_url,
          images:         storedImages.length > 0 ? storedImages : (existing ? undefined : []),
          published:      true,
        },
        { onConflict: 'padelpoint_url', ignoreDuplicates: false },
      )

      if (error) {
        result.errors.push(`${product.padelpoint_url}: ${error.message}`)
      } else {
        result.upserted++
      }
    } catch (err) {
      result.errors.push(`${product.padelpoint_url}: ${String(err)}`)
    }
  }

  return result
}

async function downloadImages(
  imageUrls: string[],
  padelpointUrl: string,
  supabase: Supabase,
): Promise<string[]> {
  const stored: string[] = []

  for (const url of imageUrls) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue

      const buffer = await res.arrayBuffer()
      const ext    = url.split('.').pop()?.split('?')[0] ?? 'jpg'
      const slug   = padelpointUrl.split('/').pop() ?? 'product'
      const path   = `padelpoint/${slug}-${stored.length}.${ext}`

      const { error } = await supabase.storage
        .from('products')
        .upload(path, buffer, { upsert: true, contentType: `image/${ext}` })

      if (error) continue

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(path)

      stored.push(publicUrl)
    } catch {
      // Hopp over bilder som ikke kan lastes ned
    }
  }

  return stored
}
