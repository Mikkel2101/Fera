// Tillegg på en tur (trips.extras) og kundens valg av dem. Prisen hentes
// alltid fra turen på serveren — kunden sender bare navn, størrelse og antall.

export type TripExtra = {
  name:         string
  price_eur:    number
  description:  string | null
  sizes:        string[]
  max_quantity: number
}

export type ExtraSelection = {
  name:     string
  size?:    string
  quantity: number
}

export type BookedExtra = {
  name:           string
  size:           string | null
  quantity:       number
  unit_price_eur: number
}

type ResolveResult = { ok: true; items: BookedExtra[] } | { ok: false; error: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseSizes(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((s): s is string => typeof s === 'string' && s.trim() !== '').map(s => s.trim())
}

function parseMaxQuantity(value: unknown): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 ? value : 1
}

// Eldre turer har tillegg med pris som tekst («€70/time»). De kan ikke
// legges i en pris og vises derfor ikke som valgbare tillegg.
export function parseTripExtras(raw: unknown): TripExtra[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item): TripExtra[] => {
    if (!isRecord(item)) return []
    const { name, price_eur, description } = item
    if (typeof name !== 'string' || name.trim() === '') return []
    if (typeof price_eur !== 'number' || !Number.isFinite(price_eur) || price_eur < 0) return []
    return [{
      name,
      price_eur,
      description:  typeof description === 'string' && description !== '' ? description : null,
      sizes:        parseSizes(item.sizes),
      max_quantity: parseMaxQuantity(item.max_quantity),
    }]
  })
}

function resolveOne(selection: ExtraSelection, extra: TripExtra | undefined): BookedExtra | string {
  if (!extra) return `Ukjent tillegg: ${selection.name}`
  if (selection.quantity < 1 || selection.quantity > extra.max_quantity) {
    return `Ugyldig antall for ${extra.name}`
  }
  if (extra.sizes.length === 0) {
    return { name: extra.name, size: null, quantity: selection.quantity, unit_price_eur: extra.price_eur }
  }
  if (!selection.size) return `Velg størrelse for ${extra.name}`
  if (!extra.sizes.includes(selection.size)) return `Ugyldig størrelse for ${extra.name}`
  return { name: extra.name, size: selection.size, quantity: selection.quantity, unit_price_eur: extra.price_eur }
}

export function resolveExtras(selections: ExtraSelection[], tripExtras: TripExtra[]): ResolveResult {
  const items: BookedExtra[] = []
  const seen = new Set<string>()

  for (const selection of selections) {
    const resolved = resolveOne(selection, tripExtras.find(e => e.name === selection.name))
    if (typeof resolved === 'string') return { ok: false, error: resolved }

    const key = `${resolved.name}|${resolved.size ?? ''}`
    if (seen.has(key)) return { ok: false, error: `${resolved.name} er valgt to ganger` }
    seen.add(key)
    items.push(resolved)
  }
  return { ok: true, items }
}

// For prisvisning mens kunden fortsatt velger (f.eks. før størrelse er valgt)
export function previewExtras(selections: ExtraSelection[], tripExtras: TripExtra[]): BookedExtra[] {
  return selections.flatMap(selection => {
    const extra = tripExtras.find(e => e.name === selection.name)
    if (!extra) return []
    return [{ name: extra.name, size: selection.size ?? null, quantity: selection.quantity, unit_price_eur: extra.price_eur }]
  })
}

export function formatBookedExtra(extra: Pick<BookedExtra, 'name' | 'size' | 'quantity'>): string {
  const size     = extra.size ? ` (${extra.size})` : ''
  const quantity = extra.quantity > 1 ? ` × ${extra.quantity}` : ''
  return `${extra.name}${size}${quantity}`
}
