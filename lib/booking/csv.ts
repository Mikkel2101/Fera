// CSV-eksport av bookinger for admin. Semikolon + BOM så filen åpnes
// riktig i Excel med norsk oppsett (æøå og komma som desimaltegn).

export type BookingCsvRow = {
  created_at:      string
  status:          string
  trip_name:       string
  first_name:      string
  last_name:       string
  email:           string
  phone:           string | null
  padel_level:     string | null
  room_type:       string | null
  roommate_name:   string | null
  selected_extras: string[]
}

const HEADERS = [
  'Reservert dato', 'Status', 'Tur', 'Fornavn', 'Etternavn', 'E-post',
  'Telefon', 'Padelnivå', 'Romtype', 'Deler rom med', 'Tilvalg',
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

export function bookingsToCsv(rows: BookingCsvRow[]): string {
  const lines = rows.map(r => [
    r.created_at.slice(0, 10),
    r.status,
    r.trip_name,
    r.first_name,
    r.last_name,
    r.email,
    r.phone,
    r.padel_level,
    r.room_type,
    r.roommate_name,
    r.selected_extras.join(', '),
  ].map(cell).join(';'))

  return '﻿' + [HEADERS.join(';'), ...lines].join('\r\n')
}
