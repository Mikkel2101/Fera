// CSV-eksport av bookinger for admin. Semikolon + BOM så filen åpnes
// riktig i Excel med norsk oppsett (æøå og komma som desimaltegn).

import { padelLevelLabel, tripGoalLabel } from './levels'
import { ROOM_SHARE_GENDERS, roomPreferenceLabel } from './rooms'

export type BookingCsvRow = {
  created_at:        string
  status:            string
  trip_name:         string
  first_name:        string
  last_name:         string
  email:             string
  phone:             string | null
  padel_level:       string | null
  room_type:         string | null
  room_preference:   string | null
  roommate_name:     string | null
  room_share_gender: string | null
  room_status:       string
  selected_extras:   string[]
  trip_goal:         string | null
  special_requests:  string | null
  price_total_eur:   number | null
}

const HEADERS = [
  'Reservert dato', 'Status', 'Tur', 'Fornavn', 'Etternavn', 'E-post',
  'Telefon', 'Padelnivå', 'Romtype', 'Romønske', 'Reisepartner', 'Kjønn (romdeling)',
  'Romstatus', 'Tillegg', 'Mål for turen', 'Ønsker', 'Totalpris (EUR)',
]

// Celler som starter med = + - @ tolkes som formler i Excel. Telefonnumre
// som «+47 400 00 000» er trygge og beholdes uendret.
function neutralizeFormula(value: string): string {
  const isFormulaStart = /^[=@\t\r]/.test(value) || (/^[+-]/.test(value) && !/^[+-][\d\s]+$/.test(value))
  return isFormulaStart ? `'${value}` : value
}

function cell(value: string | null): string {
  if (value === null || value === '') return ''
  const safe = neutralizeFormula(value)
  return /[;"\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

function genderLabel(value: string | null): string {
  return ROOM_SHARE_GENDERS.find(g => g.value === value)?.label ?? ''
}

export function bookingsToCsv(rows: BookingCsvRow[]): string {
  const lines = rows.map(r => [
    r.created_at.slice(0, 10),
    r.status,
    r.trip_name,
    r.first_name,
    r.last_name,
    r.email,
    r.phone,
    padelLevelLabel(r.padel_level),
    r.room_type,
    roomPreferenceLabel(r.room_preference),
    r.roommate_name,
    genderLabel(r.room_share_gender),
    r.room_status,
    r.selected_extras.join(', '),
    tripGoalLabel(r.trip_goal),
    r.special_requests,
    r.price_total_eur === null ? null : r.price_total_eur.toFixed(2).replace('.', ','),
  ].map(cell).join(';'))

  return '﻿' + [HEADERS.join(';'), ...lines].join('\r\n')
}
