'use client'

import { useState, useEffect } from 'react'
import type { Database } from '@/lib/supabase/types'

type Trip = Database['public']['Tables']['trips']['Row']

interface Props {
  trips: Trip[]
  onFilter: (filtered: Trip[]) => void
}

function unique(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort()
}

function monthLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nb-NO', {
    month: 'long',
    year: 'numeric',
  })
}

export default function TripFilters({ trips, onFilter }: Props) {
  const [tripType, setTripType] = useState('')
  const [month, setMonth] = useState('')

  const tripTypes = unique(trips.map((t) => t.trip_type))
  const months = Array.from(
    new Set(trips.map((t) => t.start_date.slice(0, 7)))
  ).sort()

  useEffect(() => {
    const filtered = trips.filter((t) => {
      if (tripType && t.trip_type !== tripType) return false
      if (month && !t.start_date.startsWith(month)) return false
      return true
    })
    onFilter(filtered)
  }, [tripType, month, trips, onFilter])

  const selectClass =
    'appearance-none border border-(--color-border) rounded-lg pl-3 pr-10 py-2 text-sm bg-white text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-gold)/40'
  const selectChevron = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239B7888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
  }

  return (
    <div className="bg-white border-b border-(--color-border) py-3">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 flex flex-wrap gap-3">
        <select
          value={tripType}
          onChange={(e) => setTripType(e.target.value)}
          className={selectClass}
          style={selectChevron}
        >
          <option value="">Alle typer</option>
          {tripTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className={selectClass}
          style={selectChevron}
        >
          <option value="">Alle måneder</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m + '-01')}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
