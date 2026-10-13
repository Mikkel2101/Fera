// Prisoppsummering per person: grunnpris i delt dobbeltrom, enkeltromstillegg,
// tillegg, totalpris, depositum og restbeløp. Brukes både i skjemaet og på
// serveren, så kunden og admin ser samme tall.

import type { BookedExtra } from './extras'
import type { RoomType } from './rooms'

type PricedTrip = {
  price_double_eur: number
  price_single_eur: number
  deposit_eur:      number
}

export type PriceBreakdown = {
  base:              number
  single_supplement: number
  extras_total:      number
  total:             number
  deposit:           number
  rest:              number
}

// Priser kan ha øre/cent (step 0.01 i turskjemaet) — unngå flyttallsstøy
function toCents(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function calculatePrice(
  trip: PricedTrip,
  roomType: RoomType,
  extras: BookedExtra[],
): PriceBreakdown {
  const base              = trip.price_double_eur
  const single_supplement = roomType === 'Single' ? toCents(Math.max(trip.price_single_eur - base, 0)) : 0
  const extras_total      = toCents(extras.reduce((sum, e) => sum + e.unit_price_eur * e.quantity, 0))
  const total             = toCents(base + single_supplement + extras_total)

  return {
    base,
    single_supplement,
    extras_total,
    total,
    deposit: trip.deposit_eur,
    rest:    toCents(Math.max(total - trip.deposit_eur, 0)),
  }
}
