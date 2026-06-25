const FALLBACK_RATE = 11.80

export async function fetchEurNokRate(): Promise<number> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=NOK', {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return FALLBACK_RATE
    const data = await res.json() as { rates: { NOK: number } }
    return data.rates.NOK
  } catch {
    return FALLBACK_RATE
  }
}

export function eurToNok(eur: number, rate: number): number {
  return Math.round((eur * rate * 1.03) / 10) * 10
}

export function formatNok(nok: number): string {
  return `${nok.toLocaleString('nb-NO')} kr`
}
