// Primær scraping-target: engelsk storefront, samme backend som tiendapadelpoint.com
export const RACKETSTORE_BASE = 'https://www.racketstore.com'

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
