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
  const [destination, setDestination] = useState('')
  const [tripType, setTripType] = useState('')
  const [month, setMonth] = useState('')

  const destinations = unique(trips.map((t) => t.destination))
  const tripTypes = unique(trips.map((t) => t.trip_type))
  const months = Array.from(
    new Set(trips.map((t) => t.start_date.slice(0, 7)))
  ).sort()

  useEffect(() => {
    const filtered = trips.filter((t) => {
      if (destination && t.destination !== destination) return false
      if (tripType && t.trip_type !== tripType) return false
      if (month && !t.start_date.startsWith(month)) return false
      return true
    })
    onFilter(filtered)
  }, [destination, tripType, month, trips, onFilter])

  const selectClass =
    'border border-(--color-border) rounded-lg px-3 py-2 text-sm bg-white text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-gold)/40'

  return (
    <div className="bg-white border-b border-(--color-border) py-3">
      <div className="max-w-[1600px] mx-auto px-4 flex flex-wrap gap-3">
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className={selectClass}
        >
          <option value="">Alle destinasjoner</option>
          {destinations.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={tripType}
          onChange={(e) => setTripType(e.target.value)}
          className={selectClass}
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
