// Romvalg og romstatus. Kunden velger aktivt mellom enkeltrom, å dele med
// en bestemt reisepartner eller å bli paret med en annen deltaker.
// Partnere kobles på navn mot de andre påmeldingene på samme tur.

export const ROOM_PREFERENCES = [
  { value: 'single',  label: 'Jeg ønsker enkeltrom' },
  { value: 'partner', label: 'Jeg deler dobbeltrom med en bestemt reisepartner' },
  { value: 'match',   label: 'Jeg reiser alene og vil dele rom med en annen deltaker av samme kjønn' },
] as const

export const ROOM_SHARE_GENDERS = [
  { value: 'kvinne', label: 'Kvinne' },
  { value: 'mann',   label: 'Mann' },
] as const

export type RoomPreference  = (typeof ROOM_PREFERENCES)[number]['value']
export type RoomShareGender = (typeof ROOM_SHARE_GENDERS)[number]['value']
export type RoomType        = 'Dobbel' | 'Single'

export const ROOM_PREFERENCE_VALUES   = ROOM_PREFERENCES.map(r => r.value) as [RoomPreference, ...RoomPreference[]]
export const ROOM_SHARE_GENDER_VALUES = ROOM_SHARE_GENDERS.map(g => g.value) as [RoomShareGender, ...RoomShareGender[]]

export function roomTypeFor(preference: RoomPreference): RoomType {
  return preference === 'single' ? 'Single' : 'Dobbel'
}

export function roomPreferenceLabel(value: string | null): string {
  return ROOM_PREFERENCES.find(r => r.value === value)?.label ?? ''
}

export type RoomStatusKey = 'single' | 'partners_matched' | 'partner_missing' | 'needs_roommate' | 'unknown'

const ROOM_STATUS_LABELS: Record<RoomStatusKey, string> = {
  single:           'Enkeltrom',
  partners_matched: 'Begge er påmeldt og kan plasseres sammen',
  partner_missing:  'Reisepartner er ikke påmeldt ennå',
  needs_roommate:   'Reiser alene – mangler romkamerat',
  unknown:          'Romønske må avklares',
}

export type RoomStatusBooking = {
  id:              string
  first_name:      string
  last_name:       string
  status:          string
  room_preference: string | null
  roommate_name:   string | null
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('nb-NO')
}

type PartnerMatch = 'matched' | 'missing' | 'mismatch'

// Begge må ha valgt å dele og oppgitt hverandre. Finnes personen på turen
// uten å ha oppgitt kunden, må romønsket avklares manuelt.
function findPartner(booking: RoomStatusBooking, tripBookings: RoomStatusBooking[]): PartnerMatch {
  if (!booking.roommate_name) return 'missing'
  const wanted   = normalizeName(booking.roommate_name)
  const ownName  = normalizeName(`${booking.first_name} ${booking.last_name}`)
  const partners = tripBookings.filter(other =>
    other.id !== booking.id &&
    other.status !== 'Kansellert' &&
    normalizeName(`${other.first_name} ${other.last_name}`) === wanted,
  )
  if (partners.length === 0) return 'missing'
  const isReciprocal = partners.some(other =>
    other.room_preference === 'partner' && normalizeName(other.roommate_name ?? '') === ownName,
  )
  return isReciprocal ? 'matched' : 'mismatch'
}

const PARTNER_STATUS: Record<PartnerMatch, RoomStatusKey> = {
  matched:  'partners_matched',
  missing:  'partner_missing',
  mismatch: 'unknown',
}

function statusKey(booking: RoomStatusBooking, tripBookings: RoomStatusBooking[]): RoomStatusKey {
  switch (booking.room_preference) {
    case 'single':  return 'single'
    case 'match':   return 'needs_roommate'
    case 'partner': return PARTNER_STATUS[findPartner(booking, tripBookings)]
    default:        return 'unknown'
  }
}

export type RoomStatus = { key: RoomStatusKey; label: string }

export function roomStatus(booking: RoomStatusBooking, tripBookings: RoomStatusBooking[]): RoomStatus {
  const key = statusKey(booking, tripBookings)
  return { key, label: ROOM_STATUS_LABELS[key] }
}

// Romstatus for mange bookinger på en gang, nøklet på booking-id.
// Partnere kobles bare innenfor samme tur.
export function roomStatusesByTrip(
  bookings: Array<RoomStatusBooking & { trip_id: string }>,
): Map<string, RoomStatus> {
  const byTrip = new Map<string, RoomStatusBooking[]>()
  for (const b of bookings) byTrip.set(b.trip_id, [...(byTrip.get(b.trip_id) ?? []), b])
  return new Map(bookings.map(b => [b.id, roomStatus(b, byTrip.get(b.trip_id) ?? [])]))
}
