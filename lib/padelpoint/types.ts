// Primær scraping-target: tiendapadelpoint.com (bekreftet av Willie Lizier 2025-06-15)
// Øvrige storefronts (racketstore.com, internationalpadelshop.com) legges ned
export const TIENDA_BASE = 'https://www.tiendapadelpoint.com'

export type PadelpointProduct = {
  padelpoint_url:  string
  name:            string
  brand:           string
  category:        'racket' | 'shoes' | 'bag' | 'balls' | 'clothing' | 'accessories'
  price_eur:       number
  stock_status:    'in_stock' | 'low_stock' | 'out_of_stock'
  description?:    string
  image_urls:      string[]
}

export type PadelpointAdapter = {
  fetchProducts(): Promise<PadelpointProduct[]>
}

export type SyncResult = {
  upserted:  number
  skipped:   number
  flagged:   number
  errors:    string[]
}
