export function formatPriceEur(price: number): string {
  return `€ ${price.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}
