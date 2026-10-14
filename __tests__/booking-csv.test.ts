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
  padel_level:       'middels_pluss',
  preferred_side:    'venstre',
  room_type:         'Dobbel',
  room_preference:   'match',
  roommate_name:     null,
  room_share_gender: 'kvinne',
  room_status:       'Reiser alene – mangler romkamerat',
  selected_extras:   ['Golfrunde', 'Spa'],
  trip_goal:         'sosialt',
  special_requests:  null,
  allergies_preferences: null,
  price_total_eur:   1520,
}

describe('bookingsToCsv', () => {
  it('starter med BOM og overskriftsrad med semikolon (Excel nb-NO)', () => {
    const csv = bookingsToCsv([])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv.slice(1).split('\r\n')[0]).toBe(
      'Reservert dato;Status;Tur;Fornavn;Etternavn;E-post;Telefon;Padelnivå;Banehalvdel;Romtype;Romønske;Reisepartner;Kjønn (romdeling);Romstatus;Tillegg;Mål for turen;Ønsker;Allergier og preferanser;Totalpris (EUR)',
    )
  })

  it('skriver én linje per booking med tomme felt for null', () => {
    const line = bookingsToCsv([row]).split('\r\n')[1]
    expect(line).toBe(
      '2026-10-03;Reservert;Costa Blanca Camp – Påske 2027;Kari;Nordmann;kari@example.com;+47 400 00 000;Middels +;Venstre;Dobbel;Jeg reiser alene og vil dele rom med en annen deltaker av samme kjønn;;Kvinne;Reiser alene – mangler romkamerat;Golfrunde, Spa;Det sosiale;;;1520,00',
    )
  })

  it('viser gamle bookinger uten nye felt med tomme celler', () => {
    const legacy = { ...row, padel_level: 'intermediate', preferred_side: null, room_preference: null, room_share_gender: null, trip_goal: null, price_total_eur: null }
    const line = bookingsToCsv([legacy]).split('\r\n')[1]
    expect(line).toContain(';intermediate;;Dobbel;;;;')
  })

  it('skriver totalpris med desimalkomma for norsk Excel', () => {
    const line = bookingsToCsv([{ ...row, price_total_eur: 1234.5 }]).split('\r\n')[1]
    expect(line.endsWith(';1234,50')).toBe(true)
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
