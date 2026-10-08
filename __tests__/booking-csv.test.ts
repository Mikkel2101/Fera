import { describe, it, expect } from 'vitest'
import { bookingsToCsv, type BookingCsvRow } from '@/lib/booking/csv'

const row: BookingCsvRow = {
  created_at:      '2026-10-03T14:05:00Z',
  status:          'Reservert',
  trip_name:       'Costa Blanca Camp – Påske 2027',
  first_name:      'Kari',
  last_name:       'Nordmann',
  email:           'kari@example.com',
  phone:           '+47 400 00 000',
  padel_level:     'intermediate',
  room_type:       'Dobbel',
  roommate_name:   null,
  selected_extras: ['Golfrunde', 'Spa'],
}

describe('bookingsToCsv', () => {
  it('starter med BOM og overskriftsrad med semikolon (Excel nb-NO)', () => {
    const csv = bookingsToCsv([])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv.slice(1).split('\r\n')[0]).toBe(
      'Reservert dato;Status;Tur;Fornavn;Etternavn;E-post;Telefon;Padelnivå;Romtype;Deler rom med;Tilvalg',
    )
  })

  it('skriver én linje per booking med tomme felt for null', () => {
    const line = bookingsToCsv([row]).split('\r\n')[1]
    expect(line).toBe(
      '2026-10-03;Reservert;Costa Blanca Camp – Påske 2027;Kari;Nordmann;kari@example.com;+47 400 00 000;intermediate;Dobbel;;Golfrunde, Spa',
    )
  })

  it('siterer felt med semikolon, anførselstegn eller linjeskift', () => {
    const line = bookingsToCsv([{ ...row, last_name: 'Nord;mann "Jr"' }]).split('\r\n')[1]
    expect(line).toContain(';"Nord;mann ""Jr""";')
  })

  it('nøytraliserer formelinjeksjon i Excel', () => {
    const line = bookingsToCsv([{ ...row, first_name: '=HYPERLINK("x")' }]).split('\r\n')[1]
    expect(line).toContain(`;"'=HYPERLINK(""x"")";`)
  })
})
