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

// "64,95 €" / "64.95€" / content="64.95" → 64.95
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
    const pageLinks: string[] = []

    // OpenCart: produkt-lenker ligger i .product-thumb og .product-layout
    // Hvert produkt har to lenker (bilde + tittel) som peker til samme URL → Set deduplicerer
    $('.product-thumb a, .product-layout a').each((_, el) => {
      const href = $(el).attr('href') ?? ''
      if (!href || href.startsWith('javascript') || href === '#') return

      const abs = toAbsolute(href)

      // Utelat underkategori-sider (inneholder kategori-stien som prefix)
      if (abs.includes(`${categoryPath}/`)) return
      // Utelat index.php-ruter (filter/sortering)
      if (abs.includes('index.php')) return
      // Utelat kjente ikke-produkt-ruter
      if (abs.endsWith(categoryPath) || abs === TIENDA_BASE + '/') return

      pageLinks.push(abs)
    })

    if (pageLinks.length === 0) break
    urls.push(...pageLinks)

    // OpenCart paginering: ?page=2
    const hasNext = $(`a[href*="${categoryPath}?page=${page + 1}"], a[href*="page=${page + 1}"]`).length > 0
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

  // Navn
  const name = $('h1').first().text().trim()
  if (!name) return null

  // Pris — OpenCart: .price-new (rabattert) > .price-normal (fullpris)
  // Fallback: første €-beløp på siden
  let price_eur = 0
  const priceNew = $('.price-new, .special-price').first().text().trim()
  const priceNormal = $('.price-normal, .regular-price').first().text().trim()
  if (priceNew) price_eur = parsePrice(priceNew)
  else if (priceNormal) price_eur = parsePrice(priceNormal)

  // Fallback: finn første €-tall i .price-blokken, men ikke "SIN IVA"-prisen
  if (!price_eur) {
    const priceBlock = $('.price').first().text()
    const matches = priceBlock.match(/(\d+[.,]\d{2})€/g)
    if (matches && matches.length > 0) {
      price_eur = parsePrice(matches[0])
    }
  }

  if (!price_eur) return null

  // Brand — OpenCart: "Marca:" label i produkt-attributter
  let brand = 'Unknown'
  $('li, tr').each((_, el) => {
    const text = $(el).text()
    if (text.includes('Marca:')) {
      const brandLink = $(el).find('a').first().text().trim()
      if (brandLink) brand = brandLink
    }
  })

  // Lagerstatus — "EN STOCK" = in_stock, "PROXIMAMENTE" = out_of_stock
  const pageText = $('body').text()
  const stock_status: PadelpointProduct['stock_status'] =
    pageText.includes('PROXIMAMENTE') ? 'out_of_stock'
    : pageText.includes('últimas unidades') || pageText.includes('Últimas Unidades') ? 'low_stock'
    : 'in_stock'

  // Bilder — OpenCart: /image/cache/catalog/ mønster
  const image_urls: string[] = []
  $('img[src*="/image/cache/catalog/"]').each((_, el) => {
    const src = $(el).attr('src') ?? ''
    if (src && !src.includes('placeholder') && !src.includes('50x50') && !src.includes('160x160')) {
      image_urls.push(src.startsWith('http') ? src : `${TIENDA_BASE}${src}`)
    }
  })

  const description = $('.product-description, #tab-description').first().text().trim() || undefined

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
