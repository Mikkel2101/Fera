import * as cheerio from 'cheerio'
import type { PadelpointAdapter, PadelpointProduct } from './types'
import { TIENDA_BASE } from './types'

// Kategori-URLer på tiendapadelpoint.com (PrestaShop SSR)
// Sjekk mot live site hvis en kategori returnerer 0 produkter — sluggen kan ha endret seg
const CATEGORY_URLS: { path: string; category: PadelpointProduct['category'] }[] = [
  { path: '/palas-padel',               category: 'racket' },
  { path: '/zapatillas-padel',          category: 'shoes' },
  { path: '/bolsos-padel',              category: 'bag' },
  { path: '/pelotas-padel',             category: 'balls' },
  { path: '/ropa-padel',                category: 'clothing' },
  { path: '/accesorios-padel',          category: 'accessories' },
]

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; FeraPadelBot/1.0; +https://ferapadel.com)',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'es-ES,es;q=0.9',
}

const DELAY_MS = 600

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS })
    if (!res.ok) return null
    return res.text()
  } catch {
    return null
  }
}

// "219,99 €" eller content="219.99" → 219.99
function parsePrice(raw: string): number {
  const n = parseFloat(raw.replace(/[^\d,.]/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

async function scrapeProductUrls(categoryPath: string): Promise<string[]> {
  const urls: string[] = []
  let page = 1

  while (true) {
    const url = `${TIENDA_BASE}${categoryPath}${page > 1 ? `?p=${page}` : ''}`
    const html = await fetchHtml(url)
    if (!html) break

    const $ = cheerio.load(html)
    const pageLinks: string[] = []

    // PrestaShop produkt-lenker i listingside
    $('article.product-miniature .product-title a, .products .product-miniature h2 a').each((_, el) => {
      const href = $(el).attr('href')
      if (href) {
        pageLinks.push(href.startsWith('http') ? href : `${TIENDA_BASE}${href}`)
      }
    })

    if (pageLinks.length === 0) break
    urls.push(...pageLinks)

    const hasNext = $('a[rel="next"], .pagination .next a').length > 0
    if (!hasNext) break

    page++
    await sleep(DELAY_MS)
  }

  return [...new Set(urls)]
}

async function scrapeProduct(
  url: string,
  category: PadelpointProduct['category'],
): Promise<PadelpointProduct | null> {
  const html = await fetchHtml(url)
  if (!html) return null

  const $ = cheerio.load(html)

  const name = $('h1.page-title, h1[itemprop="name"]').first().text().trim()
  if (!name) return null

  const brand = $(
    '.product-manufacturer a, [itemprop="brand"] [itemprop="name"], .brand-name a'
  ).first().text().trim() || 'Unknown'

  // Foretrekk content-attributt (eksakt tall) over tekst (kan ha valutasymbol)
  const priceEl = $('span[itemprop="price"], .current-price-value').first()
  const priceRaw = priceEl.attr('content') ?? priceEl.text().trim()
  const price_eur = parsePrice(priceRaw)
  if (!price_eur) return null

  const availText = $('.product-availability').text().toLowerCase()
  const stock_status: PadelpointProduct['stock_status'] =
    availText.includes('agotado') || availText.includes('out of stock') ? 'out_of_stock'
    : availText.includes('últimas') || availText.includes('last items') ? 'low_stock'
    : 'in_stock'

  const image_urls: string[] = []
  $('.product-cover img, .product-images-container img, .images-container img').each((_, el) => {
    const src = $(el).attr('data-src') ?? $(el).attr('src') ?? ''
    if (src.startsWith('http') && !src.includes('placeholder')) {
      image_urls.push(src)
    }
  })

  const description = $('.product-description, [itemprop="description"]').first().text().trim() || undefined

  return {
    padelpoint_url: url,
    name,
    brand,
    category,
    price_eur,
    stock_status,
    description,
    image_urls: [...new Set(image_urls)].slice(0, 5),
  }
}

export const tiendaPadelpointAdapter: PadelpointAdapter = {
  async fetchProducts(): Promise<PadelpointProduct[]> {
    const products: PadelpointProduct[] = []

    for (const { path, category } of CATEGORY_URLS) {
      const productUrls = await scrapeProductUrls(path)

      for (const productUrl of productUrls) {
        await sleep(DELAY_MS)
        const product = await scrapeProduct(productUrl, category)
        if (product) products.push(product)
      }
    }

    return products
  },
}
