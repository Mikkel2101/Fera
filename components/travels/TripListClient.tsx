'use client'

import { useState, useCallback } from 'react'
import TripFilters from './TripFilters'
import TripCard from './TripCard'
import type { Database } from '@/lib/supabase/types'

type Trip = Database['public']['Tables']['trips']['Row']

export default function TripListClient({ initialTrips }: { initialTrips: Trip[] }) {
  const [filtered, setFiltered] = useState<Trip[]>(initialTrips)

  const handleFilter = useCallback((result: Trip[]) => {
    setFiltered(result)
  }, [])

  return (
    <section className="bg-white min-h-screen">
      <TripFilters trips={initialTrips} onFilter={handleFilter} />

      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <p className="text-(--color-muted) text-center py-16 text-lg">
            Ingen turer matcher filtrene dine
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
