import { describe, it, expect } from 'vitest'
import { reservationErrorResponse, filterValidExtras } from '@/lib/booking/reservation'

describe('reservationErrorResponse', () => {
  it('gir 409 med venteliste-hint når turen er full', () => {
    expect(reservationErrorResponse('TRIP_FULL')).toEqual({
      status: 409,
      code:   'TRIP_FULL',
      error:  'Turen er dessverre fullbooket. Meld deg på ventelisten, så gir vi beskjed hvis det blir ledig plass.',
    })
  })

  it('gir 409 når kunden allerede har reservert turen', () => {
    const res = reservationErrorResponse('ALREADY_RESERVED')
    expect(res.status).toBe(409)
    expect(res.code).toBe('ALREADY_RESERVED')
  })

  it('gir 422 når turen ikke er åpen for reservasjon', () => {
    const res = reservationErrorResponse('TRIP_UNAVAILABLE')
    expect(res.status).toBe(422)
    expect(res.code).toBe('TRIP_UNAVAILABLE')
  })

  it('finner feilkoden inne i en lengre Postgres-melding', () => {
    expect(reservationErrorResponse('ERROR: TRIP_FULL (P0001)').code).toBe('TRIP_FULL')
  })

  it('gir 500 for ukjente feil', () => {
    const res = reservationErrorResponse('connection reset')
    expect(res.status).toBe(500)
    expect(res.code).toBe('UNKNOWN')
  })
})

describe('filterValidExtras', () => {
  const tripExtras = [
    { name: 'Golfrunde', price_eur: 80 },
    { name: 'Spa',       price_eur: 50 },
  ]

  it('beholder bare tilvalg som finnes på turen', () => {
    expect(filterValidExtras(['Golfrunde', 'Gratis champagne'], tripExtras)).toEqual(['Golfrunde'])
  })

  it('fjerner duplikater', () => {
    expect(filterValidExtras(['Spa', 'Spa'], tripExtras)).toEqual(['Spa'])
  })

  it('håndterer tur uten tilvalg', () => {
    expect(filterValidExtras(['Spa'], [])).toEqual([])
  })
})
