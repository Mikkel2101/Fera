// Hjelpere for reservasjons-API-et. Feilkodene kastes av
// reserve_trip_spot() i migrasjon 021.

export type ReservationErrorCode = 'TRIP_FULL' | 'ALREADY_RESERVED' | 'TRIP_UNAVAILABLE' | 'UNKNOWN'

type ReservationError = { status: number; code: ReservationErrorCode; error: string }

const KNOWN_ERRORS: Record<Exclude<ReservationErrorCode, 'UNKNOWN'>, Omit<ReservationError, 'code'>> = {
  TRIP_FULL: {
    status: 409,
    error:  'Turen er dessverre fullbooket. Meld deg på ventelisten, så gir vi beskjed hvis det blir ledig plass.',
  },
  ALREADY_RESERVED: {
    status: 409,
    error:  'Du har allerede reservert plass på denne turen. Se «Mine reiser» på kontoen din.',
  },
  TRIP_UNAVAILABLE: {
    status: 422,
    error:  'Turen er ikke åpen for reservasjon.',
  },
}

export function reservationErrorResponse(message: string): ReservationError {
  const code = (Object.keys(KNOWN_ERRORS) as Array<keyof typeof KNOWN_ERRORS>)
    .find(key => message.includes(key))

  if (!code) {
    return { status: 500, code: 'UNKNOWN', error: 'Kunne ikke reservere plass. Prøv igjen.' }
  }
  return { code, ...KNOWN_ERRORS[code] }
}

export function filterValidExtras(
  selected: string[],
  tripExtras: Array<{ name: string }>,
): string[] {
  const valid = new Set(tripExtras.map(e => e.name))
  return [...new Set(selected)].filter(name => valid.has(name))
}
