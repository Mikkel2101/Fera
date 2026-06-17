import * as cheerio from 'cheerio'
import type { PadelpointAdapter, PadelpointProduct } from './types'
import { TIENDA_BASE } from './types'

// Kategori-URLer på tiendapadelpoint.com (OpenCart med SEO-URLer)
// Sjekk mot live site hvis en kategori returnerer 0 produkter — sluggen kan ha endret seg
const CATEGORY_URLS: { path: string; category: PadelpointProduct['category'] }[] = [
  { path: '/palas-de-padel',      category: 'racket' },
  { path: '/zapatillas-de-padel', category: 'shoes' },
  { path: '/bolsas-padel',        category: 'bag' },
  { path: '/pelotas-padel',       category: 'balls' },
  { path: '/ropa-padel',          category: 'clothing' },
  { path: '/accesorios-padel',    category: 'accessories' },
]

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; FeraPadelBot/1.0; +https://ferapadel.com)',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'es-ES,es;q=0.9',
}

const DELAY_MS = 700

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

function parsePrice(raw: string): number {
  const n = parseFloat(raw.replace(/[^\d,.]/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function toAbsolute(href: string): string {
  if (href.startsWith('http')) return href
  if (href.startsWith('/')) return `${TIENDA_BASE}${href}`
  return `${TIENDA_BASE}/${href}`
}

async function scrapeProductUrls(categoryPath: string): Promise<string[]> {
  const urls: string[] = []
  let page = 1

  while (true) {
    const url = `${TIENDA_BASE}${categoryPath}${page > 1 ? `?page=${page}` : ''}`
    const html = await fetchHtml(url)
    if (!html) break

    const $ = cheerio.load(html)

    // Produktkort i OpenCart har alltid bildelenke + tittellekne → samme URL vises 2x
    // Navigasjons- og brand-filterlenker vises kun 1x
    // Strategi: tell forekomster av alle lenker — produkt-URL har count >= 2
    const linkCounts = new Map<string, number>()

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') ?? ''
      if (!href || href.startsWith('javascript:') || href.startsWith('#')) return

      const abs = toAbsolute(href)
      if (!abs.startsWith(TIENDA_BASE + '/')) return
      if (abs.includes('?') || abs.includes('index.php')) return
      if (abs === TIENDA_BASE || abs === TIENDA_BASE + '/') return

      linkCounts.set(abs, (linkCounts.get(abs) ?? 0) + 1)
    })

    const pageLinks: string[] = []
    for (const [u, count] of linkCounts) {
      if (count >= 2) pageLinks.push(u)
    }

    if (pageLinks.length === 0) break
    urls.push(...pageLinks)

    const hasNext = $(`a[href*="page=${page + 1}"]`).length > 0
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

  const name = $('h1').first().text().trim()
  if (!name) return null

  // OpenCart: .price-new = rabattert, .price-normal = fullpris
  let price_eur = 0
  const priceNew = $('.price-new, .special-price').first().text().trim()
  const priceNormal = $('.price-normal, .regular-price').first().text().trim()

  if (priceNew) price_eur = parsePrice(priceNew)
  else if (priceNormal) price_eur = parsePrice(priceNormal)

  // Fallback: finn første €-beløp i sidetekst, hopp over SIN IVA-linjen
  if (!price_eur) {
    const priceBlock = $('.price, #price-display, #product-price').first().text()
    const match = priceBlock.replace(/SIN IVA.*/gi, '').match(/[\d.,]+€/)
    if (match) price_eur = parsePrice(match[0])
  }

  if (!price_eur) return null

  // Brand — finn "Marca:"-labelen og hent lenketeksten
  let brand = 'Unknown'
  $('li, tr, p').each((_, el) => {
    if (brand !== 'Unknown') return
    const text = $(el).text()
    if (text.includes('Marca:')) {
      const a = $(el).find('a').first().text().trim()
      if (a) brand = a
    }
  })

  // Lagerstatus
  const pageText = $('body').text()
  const stock_status: PadelpointProduct['stock_status'] =
    pageText.includes('PROXIMAMENTE') || pageText.includes('PRÓXIMAMENTE') ? 'out_of_stock'
    : pageText.includes('últimas unidades') || pageText.includes('Últimas Unidades') ? 'low_stock'
    : 'in_stock'

  // Bilder: /image/cache/catalog/ men ikke thumbnails (50x50, 160x160)
  const image_urls: string[] = []
  $('img[src*="/image/cache/catalog/"]').each((_, el) => {
    const src = $(el).attr('src') ?? ''
    if (!src) return
    if (src.includes('50x50') || src.includes('160x160') || src.includes('placeholder')) return
    image_urls.push(src.startsWith('http') ? src : `${TIENDA_BASE}${src}`)
  })

  const description = $('#tab-description, .product-description').first().text().trim() || undefined

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
