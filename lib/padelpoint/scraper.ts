import * as cheerio from 'cheerio'
import type { PadelpointAdapter, PadelpointProduct } from './types'
import { TIENDA_BASE } from './types'

// Kategori-URLer på tiendapadelpoint.com (OpenCart med SEO-URLer)
const CATEGORY_URLS: { path: string; category: PadelpointProduct['category'] }[] = [
  { path: '/palas-de-padel',      category: 'racket' },
  { path: '/zapatillas-de-padel', category: 'shoes' },
  { path: '/bolsas-padel',        category: 'bag' },
  { path: '/pelotas-padel',       category: 'balls' },
  { path: '/ropa-padel',          category: 'clothing' },
  { path: '/accesorios-padel',    category: 'accessories' },
]

// Kjente merkevare-navn for å utlede brand fra produktnavn
const KNOWN_BRANDS = [
  'Bullpadel','Head','Nox','Siux','Star Vie','Wilson','Adidas','Babolat',
  'Joma','Vibora','Drop Shot','Black Crown','Prince','Puma','Munich',
  'Softee','Tecnifibre','Vairo','Alacran','Royal Padel','Dunlop','Cartri',
  'Enebe','Star-Vie','StarVie','Starvie',
]

// Maks sider per kategori per synk.
// Default 5 — med listing-only er 5 sider × 2 kategorier < 10 sekunder.
const MAX_PAGES = parseInt(process.env.PADELPOINT_MAX_PAGES ?? '5', 10)

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; FeraPadelBot/1.0; +https://ferapadel.com)',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'es-ES,es;q=0.9',
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

function extractBrand(productName: string): string {
  for (const brand of KNOWN_BRANDS) {
    if (productName.toLowerCase().includes(brand.toLowerCase())) return brand
  }
  // Fallback: første ord etter "Pala(s)/Zapatilla(s)/Bolsa(s)/..." er ofte merket
  const withoutType = productName.replace(/^(palas?|zapatillas?|bolsas?|pelotas?|ropa|accesorios?)\s+/i, '')
  return withoutType.split(' ')[0] ?? 'Unknown'
}

// Henter alle produkter fra én listingside uten å besøke enkeltprodukt-sider
async function scrapeListingPage(
  categoryPath: string,
  category: PadelpointProduct['category'],
  page: number,
): Promise<{ products: PadelpointProduct[]; hasNextPage: boolean }> {
  const url = `${TIENDA_BASE}${categoryPath}${page > 1 ? `?page=${page}` : ''}`
  const html = await fetchHtml(url)
  if (!html) return { products: [], hasNextPage: false }

  const $ = cheerio.load(html)
  const products: PadelpointProduct[] = []

  // Finn produktlenker som vises 2+ ganger (bilde + navn = samme URL i hvert produktkort)
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

  const productUrls = [...linkCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([u]) => u)

  for (const productUrl of productUrls) {
    // Bildelenken → navn (alt-tekst) + bilde-URL
    const imageAnchor = $(`a[href="${productUrl}"]`)
      .filter((_, el) => $(el).find('img').length > 0)
      .first()

    const img = imageAnchor.find('img').first()
    const name = img.attr('alt')?.trim() ?? ''
    if (!name) continue

    const rawSrc = img.attr('src') ?? img.attr('data-src') ?? ''
    const imageSrc = rawSrc && !rawSrc.includes('50x50') && !rawSrc.includes('160x160')
      ? toAbsolute(rawSrc)
      : ''

    // Tekstlenken → bekreft navn
    const nameAnchor = $(`a[href="${productUrl}"]`)
      .filter((_, el) => $(el).find('img').length === 0)
      .first()
    const confirmedName = nameAnchor.text().trim() || name

    // Pris: finn første €-beløp etter bildeankeret i DOM
    // Vi søker i foreldrenes tekst-innhold og finner tall med €
    let price_eur = 0
    const parentText = imageAnchor.parent().parent().text()
    const priceMatches = parentText.match(/(\d+[.,]\d{2})€/g)
    if (priceMatches) {
      // Ta den laveste prisen (= gjeldende pris ved rabatt, ellers fullpris)
      const prices = priceMatches.map(p => parsePrice(p)).filter(p => p > 0)
      if (prices.length > 0) price_eur = Math.min(...prices)
    }

    if (!price_eur) continue

    // Lagerstatus: sjekk tekst nær produktkortet
    const cardText = imageAnchor.parent().parent().text()
    const stock_status: PadelpointProduct['stock_status'] =
      cardText.includes('PROXIMAMENTE') || cardText.includes('PRÓXIMAMENTE') ? 'out_of_stock'
      : cardText.includes('últimas') || cardText.includes('Últimas') ? 'low_stock'
      : 'in_stock'

    products.push({
      padelpoint_url: productUrl,
      name: confirmedName,
      brand: extractBrand(confirmedName),
      category,
      price_eur,
      stock_status,
      image_urls: imageSrc ? [imageSrc] : [],
    })
  }

  const hasNextPage = $(`a[href*="page=${page + 1}"]`).length > 0

  return { products, hasNextPage }
}

export const tiendaPadelpointAdapter: PadelpointAdapter = {
  async fetchProducts(): Promise<PadelpointProduct[]> {
    const products: PadelpointProduct[] = []

    for (const { path, category } of CATEGORY_URLS) {
      for (let page = 1; page <= MAX_PAGES; page++) {
        const { products: pageProducts, hasNextPage } = await scrapeListingPage(path, category, page)
        products.push(...pageProducts)
        if (!hasNextPage) break
      }
    }

    return products
  },
}
