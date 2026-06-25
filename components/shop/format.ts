export function formatPriceEur(price: number): string {
  return `€ ${price.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatPriceNok(nok: number): string {
  return `${nok.toLocaleString('nb-NO')} kr`
}
