const TIME_ZONE = 'Europe/Oslo'

const DISPLAY_DATE = new Intl.DateTimeFormat('nb-NO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: TIME_ZONE,
})

const INPUT_DATE = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIME_ZONE,
})

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function formatArticleDate(iso: string | null): string {
  return iso ? DISPLAY_DATE.format(new Date(iso)) : ''
}

// Samme kalenderdato som formatArticleDate viser, i formatet <input type="date"> bruker.
export function toDateInput(iso: string | null): string {
  if (!iso) return ''
  const parts = Object.fromEntries(
    INPUT_DATE.formatToParts(new Date(iso)).map((part) => [part.type, part.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day}`
}

// Middag UTC gir samme kalenderdato i Norge og Spania uansett sommertid.
export function fromDateInput(value: string): string | null {
  return DATE_INPUT_PATTERN.test(value) ? `${value}T12:00:00.000Z` : null
}

// Datofeltet har bare dag-oppløsning: er dagen uendret, beholdes det opprinnelige tidspunktet.
export function keepPublishedTime(next: string | null, previous: string | null): string | null {
  if (next && previous && toDateInput(next) === toDateInput(previous)) return previous
  return next
}
