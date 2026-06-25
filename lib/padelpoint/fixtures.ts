import type { PadelpointAdapter, PadelpointProduct } from './types'
import { TIENDA_BASE as RACKETSTORE_BASE } from './types'

const FIXTURES: PadelpointProduct[] = [
  {
    padelpoint_url: `${RACKETSTORE_BASE}/padel-rackets/bullpadel-vertex-04-ctr`,
    name:           'Bullpadel Vertex 04 CTR 2024',
    brand:          'Bullpadel',
    category:       'racket',
    price_eur:      229.95,
    stock_status:   'in_stock',
    description:    'Professional control racket from Bullpadel. Diamond shape with CTR technology.',
    image_urls:     [
      `${RACKETSTORE_BASE}/img/p/bullpadel-vertex-04-ctr.jpg`,
    ],
  },
  {
    padelpoint_url: `${RACKETSTORE_BASE}/padel-rackets/bullpadel-hack-04-ltd`,
    name:           'Bullpadel Hack 04 LTD 2024',
    brand:          'Bullpadel',
    category:       'racket',
    price_eur:      269.95,
    stock_status:   'in_stock',
    description:    'Powerful attack racket for advanced players.',
    image_urls:     [
      `${RACKETSTORE_BASE}/img/p/bullpadel-hack-04-ltd.jpg`,
    ],
  },
  {
    padelpoint_url: `${RACKETSTORE_BASE}/padel-rackets/nox-ml10-pro-cup-3k`,
    name:           'NOX ML10 Pro Cup 3K',
    brand:          'NOX',
    category:       'racket',
    price_eur:      199.95,
    stock_status:   'in_stock',
    description:    'Pro Cup series from NOX with 3K carbon. All-round racket.',
    image_urls:     [
      `${RACKETSTORE_BASE}/img/p/nox-ml10-pro-cup-3k.jpg`,
    ],
  },
  {
    padelpoint_url: `${RACKETSTORE_BASE}/padel-rackets/wilson-defy-pro`,
    name:           'Wilson Defy Pro 2025',
    brand:          'Wilson',
    category:       'racket',
    price_eur:      189.95,
    stock_status:   'low_stock',
    description:    "Wilson's flagship racket for 2025. Round shape with excellent control.",
    image_urls:     [
      `${RACKETSTORE_BASE}/img/p/wilson-defy-pro.jpg`,
    ],
  },
  {
    padelpoint_url: `${RACKETSTORE_BASE}/accessories/head-delta-padel-balls`,
    name:           'Head Delta Pro Balls (3-pack)',
    brand:          'Head',
    category:       'balls',
    price_eur:       6.95,
    stock_status:   'in_stock',
    description:    'Tournament balls from Head. Approved by World Padel Tour.',
    image_urls:     [
      `${RACKETSTORE_BASE}/img/p/head-delta-balls.jpg`,
    ],
  },
  {
    padelpoint_url: `${RACKETSTORE_BASE}/bags/bullpadel-performance-bag`,
    name:           'Bullpadel Performance Bag 2024',
    brand:          'Bullpadel',
    category:       'bag',
    price_eur:      79.95,
    stock_status:   'in_stock',
    description:    'Spacious padel bag with insulated compartment for rackets.',
    image_urls:     [
      `${RACKETSTORE_BASE}/img/p/bullpadel-performance-bag.jpg`,
    ],
  },
  // Babolat-produkt: skal avvises av brand-guard
  {
    padelpoint_url: `${RACKETSTORE_BASE}/padel-rackets/babolat-air-viper`,
    name:           'Babolat Air Viper 2024',
    brand:          'Babolat',
    category:       'racket',
    price_eur:      189.95,
    stock_status:   'in_stock',
    description:    'Should never be imported — Babolat is a restricted brand.',
    image_urls:     [],
  },
]

export const fixturesAdapter: PadelpointAdapter = {
  async fetchProducts() {
    return FIXTURES
  },
}
