import { describe, it, expect } from 'vitest'
import { normalizePhone } from '@/lib/booking/phone'
import { courtSideLabel, padelLevelLabel, tripGoalLabel } from '@/lib/booking/levels'
import { roomTypeFor, roomStatus, roomStatusesByTrip, type RoomStatusBooking } from '@/lib/booking/rooms'
import { parseTripExtras, resolveExtras } from '@/lib/booking/extras'
import { calculatePrice } from '@/lib/booking/pricing'
import { step1Schema, step2Schema } from '@/lib/booking/schema'

describe('normalizePhone', () => {
  it('legger til +47 på norske 8-sifrede nummer', () => {
    expect(normalizePhone('912 34 567')).toBe('+4791234567')
  })

  it('beholder landskode og fjerner mellomrom og bindestrek', () => {
    expect(normalizePhone('+46 70-123 45 67')).toBe('+46701234567')
  })

  it('gjør 00-prefiks om til +', () => {
    expect(normalizePhone('0047 912 34 567')).toBe('+4791234567')
  })

  it('avviser nummer uten landskode som ikke er norske', () => {
    expect(normalizePhone('0701234567')).toBeNull()
  })

  it('avviser for korte nummer og bokstaver', () => {
    expect(normalizePhone('+47 123')).toBeNull()
    expect(normalizePhone('ring meg')).toBeNull()
    expect(normalizePhone('')).toBeNull()
  })
})

describe('nivå- og målnavn', () => {
  it('gir klartekst for kjente verdier', () => {
    expect(padelLevelLabel('middels_pluss')).toBe('Middels +')
    expect(tripGoalLabel('jevne_kamper')).toBe('Jevne kamper')
    expect(courtSideLabel('venstre')).toBe('Venstre')
    expect(courtSideLabel('begge')).toBe('Begge går fint')
  })

  it('viser ukjente verdier uendret og null som tom', () => {
    expect(padelLevelLabel('intermediate')).toBe('intermediate')
    expect(padelLevelLabel(null)).toBe('')
  })
})

describe('roomTypeFor', () => {
  it('gir Single for enkeltrom og Dobbel ellers', () => {
    expect(roomTypeFor('single')).toBe('Single')
    expect(roomTypeFor('partner')).toBe('Dobbel')
    expect(roomTypeFor('match')).toBe('Dobbel')
  })
})

describe('roomStatus', () => {
  const kari: RoomStatusBooking = {
    id: '1', first_name: 'Kari', last_name: 'Nordmann', status: 'Reservert',
    room_preference: 'partner', roommate_name: 'Ola Nordmann',
  }
  const ola: RoomStatusBooking = {
    id: '2', first_name: 'Ola', last_name: 'Nordmann', status: 'Reservert',
    room_preference: 'partner', roommate_name: 'Kari Nordmann',
  }

  it('sier at partneren ikke er påmeldt når navnet ikke finnes på turen', () => {
    expect(roomStatus(kari, [kari]).key).toBe('partner_missing')
  })

  it('kobler partnere med samme navn uavhengig av store bokstaver og mellomrom', () => {
    const olaLower = { ...ola, first_name: ' ola ', last_name: 'NORDMANN' }
    expect(roomStatus(kari, [kari, olaLower]).key).toBe('partners_matched')
  })

  it('krever at partneren også har oppgitt kunden som reisepartner', () => {
    const olaSingle = { ...ola, room_preference: 'single', roommate_name: null }
    expect(roomStatus(kari, [kari, olaSingle]).key).toBe('unknown')
    const olaOther = { ...ola, roommate_name: 'Per Hansen' }
    expect(roomStatus(kari, [kari, olaOther]).key).toBe('unknown')
  })

  it('teller ikke kansellerte bookinger som påmeldt partner', () => {
    expect(roomStatus(kari, [kari, { ...ola, status: 'Kansellert' }]).key).toBe('partner_missing')
  })

  it('markerer de som vil pares som manglende romkamerat', () => {
    const solo = { ...kari, room_preference: 'match', roommate_name: null }
    expect(roomStatus(solo, [solo]).key).toBe('needs_roommate')
  })

  it('markerer enkeltrom', () => {
    const single = { ...kari, room_preference: 'single', roommate_name: null }
    expect(roomStatus(single, [single]).key).toBe('single')
  })

  it('faller tilbake til ukjent for gamle bookinger uten romvalg', () => {
    const legacy = { ...kari, room_preference: null }
    expect(roomStatus(legacy, [legacy]).key).toBe('unknown')
  })
})

describe('roomStatusesByTrip', () => {
  it('kobler partnere bare innenfor samme tur', () => {
    const base = { status: 'Reservert', room_preference: 'partner' }
    const all = [
      { ...base, id: '1', trip_id: 'a', first_name: 'Kari', last_name: 'Nordmann', roommate_name: 'Ola Nordmann' },
      { ...base, id: '2', trip_id: 'b', first_name: 'Ola',  last_name: 'Nordmann', roommate_name: 'Kari Nordmann' },
      { ...base, id: '3', trip_id: 'b', first_name: 'Kari', last_name: 'Nordmann', roommate_name: 'Ola Nordmann' },
    ]
    const statuses = roomStatusesByTrip(all)
    expect(statuses.get('1')?.key).toBe('partner_missing')
    expect(statuses.get('2')?.key).toBe('partners_matched')
    expect(statuses.get('3')?.key).toBe('partners_matched')
  })
})

describe('parseTripExtras', () => {
  it('beholder gyldige tillegg med størrelser og maks antall', () => {
    expect(parseTripExtras([
      { name: 'T-skjorte', price_eur: 10, sizes: ['S', 'M', ''], max_quantity: 3 },
    ])).toEqual([
      { name: 'T-skjorte', price_eur: 10, description: null, sizes: ['S', 'M'], max_quantity: 3 },
    ])
  })

  it('dropper gamle tillegg uten tallpris og ugyldig data', () => {
    expect(parseTripExtras([
      { name: 'Privat coaching', price: '€70/time' },
      { name: '', price_eur: 10 },
      null,
    ])).toEqual([])
    expect(parseTripExtras('tull')).toEqual([])
  })

  it('setter maks antall til 1 når det mangler eller er ugyldig', () => {
    expect(parseTripExtras([{ name: 'Spa', price_eur: 89, max_quantity: 0 }])[0].max_quantity).toBe(1)
  })
})

describe('resolveExtras', () => {
  const extras = parseTripExtras([
    { name: 'T-skjorte', price_eur: 10, sizes: ['S', 'M', 'L'], max_quantity: 3 },
    { name: 'Spa', price_eur: 89 },
  ])

  it('henter pris fra turen, ikke fra kunden', () => {
    const res = resolveExtras([{ name: 'T-skjorte', size: 'M', quantity: 2 }], extras)
    expect(res).toEqual({ ok: true, items: [{ name: 'T-skjorte', size: 'M', quantity: 2, unit_price_eur: 10 }] })
  })

  it('krever størrelse når tillegget har størrelser', () => {
    const res = resolveExtras([{ name: 'T-skjorte', quantity: 1 }], extras)
    expect(res).toEqual({ ok: false, error: 'Velg størrelse for T-skjorte' })
  })

  it('avviser ukjent størrelse, ukjent tillegg og for høyt antall', () => {
    expect(resolveExtras([{ name: 'T-skjorte', size: 'XXL', quantity: 1 }], extras).ok).toBe(false)
    expect(resolveExtras([{ name: 'Golf', quantity: 1 }], extras).ok).toBe(false)
    expect(resolveExtras([{ name: 'Spa', quantity: 2 }], extras).ok).toBe(false)
  })

  it('ignorerer størrelse på tillegg uten størrelser', () => {
    const res = resolveExtras([{ name: 'Spa', size: 'M', quantity: 1 }], extras)
    expect(res).toEqual({ ok: true, items: [{ name: 'Spa', size: null, quantity: 1, unit_price_eur: 89 }] })
  })

  it('avviser samme tillegg og størrelse to ganger', () => {
    const res = resolveExtras([
      { name: 'Spa', quantity: 1 },
      { name: 'Spa', quantity: 1 },
    ], extras)
    expect(res.ok).toBe(false)
  })
})

describe('calculatePrice', () => {
  const trip = { price_double_eur: 1500, price_single_eur: 1800, deposit_eur: 500 }

  it('regner ut dobbeltrom med tillegg, depositum og rest', () => {
    const price = calculatePrice(trip, 'Dobbel', [{ name: 'T-skjorte', size: 'M', quantity: 2, unit_price_eur: 10 }])
    expect(price).toEqual({ base: 1500, single_supplement: 0, extras_total: 20, total: 1520, deposit: 500, rest: 1020 })
  })

  it('viser enkeltrom som grunnpris pluss tillegg', () => {
    const price = calculatePrice(trip, 'Single', [])
    expect(price.single_supplement).toBe(300)
    expect(price.total).toBe(1800)
  })

  it('runder av til hele cent', () => {
    const price = calculatePrice(trip, 'Dobbel', [{ name: 'Strikk', size: null, quantity: 3, unit_price_eur: 0.1 }])
    expect(price.extras_total).toBe(0.3)
    expect(price.total).toBe(1500.3)
  })

  it('lar aldri tillegg eller rest bli negative', () => {
    const price = calculatePrice({ price_double_eur: 400, price_single_eur: 300, deposit_eur: 500 }, 'Single', [])
    expect(price.single_supplement).toBe(0)
    expect(price.rest).toBe(0)
  })
})

describe('step1Schema', () => {
  const valid = {
    first_name: 'Kari', last_name: 'Nordmann', email: 'kari@example.com',
    phone: '912 34 567', padel_level: 'middels_minus',
  }

  it('normaliserer telefonnummeret', () => {
    const parsed = step1Schema.parse(valid)
    expect(parsed.phone).toBe('+4791234567')
  })

  it('krever telefon og padelnivå', () => {
    const res = step1Schema.safeParse({ ...valid, phone: '', padel_level: undefined })
    expect(res.success).toBe(false)
    const fields = res.success ? {} : res.error.flatten().fieldErrors
    expect(fields).toHaveProperty('phone')
    expect(fields).toHaveProperty('padel_level')
  })

  it('godtar mål og ønsker som valgfrie felt', () => {
    expect(step1Schema.parse({ ...valid, trip_goal: 'sosialt', special_requests: 'Vil øve på bandeja' }).trip_goal).toBe('sosialt')
  })

  it('godtar foretrukket banehalvdel som valgfritt felt', () => {
    expect(step1Schema.parse({ ...valid, preferred_side: 'hoyre' }).preferred_side).toBe('hoyre')
    expect(step1Schema.parse(valid).preferred_side).toBeUndefined()
    expect(step1Schema.safeParse({ ...valid, preferred_side: 'midten' }).success).toBe(false)
  })

  it('avviser for lange ønsker', () => {
    expect(step1Schema.safeParse({ ...valid, special_requests: 'x'.repeat(1001) }).success).toBe(false)
  })
})

describe('step2Schema', () => {
  it('krever navn på reisepartner ved partnervalg', () => {
    const res = step2Schema.safeParse({ room_preference: 'partner', roommate_name: '  ', extras: [] })
    expect(res.success).toBe(false)
  })

  it('krever kjønn når kunden vil pares med en romkamerat', () => {
    expect(step2Schema.safeParse({ room_preference: 'match', extras: [] }).success).toBe(false)
    expect(step2Schema.safeParse({ room_preference: 'match', room_share_gender: 'kvinne', extras: [] }).success).toBe(true)
  })

  it('godtar enkeltrom uten flere opplysninger', () => {
    expect(step2Schema.parse({ room_preference: 'single' }).extras).toEqual([])
  })
})
