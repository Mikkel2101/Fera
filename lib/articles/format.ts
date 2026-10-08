const DISPLAY_DATE = new Intl.DateTimeFormat('nb-NO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Oslo',
})

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function formatArticleDate(iso: string | null): string {
  return iso ? DISPLAY_DATE.format(new Date(iso)) : ''
}

export function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : ''
}

// Middag UTC gir samme kalenderdato i Norge og Spania uansett sommertid.
export function fromDateInput(value: string): string | null {
  return DATE_INPUT_PATTERN.test(value) ? `${value}T12:00:00.000Z` : null
}
