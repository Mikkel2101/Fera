'use client'

import { useRef } from 'react'
import TripCard from '@/components/travels/TripCard'
import type { Database } from '@/lib/supabase/types'

type Trip = Database['public']['Tables']['trips']['Row']

export default function TripsCarousel({ trips }: { trips: Trip[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <div>
      {trips.length > 1 && (
        <div className="flex justify-end gap-2 mb-5">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Forrige reiser"
            className="w-10 h-10 rounded-full border border-(--color-border) flex items-center justify-center text-(--color-dark) hover:bg-(--color-sand-light) transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Neste reiser"
            className="w-10 h-10 rounded-full border border-(--color-border) flex items-center justify-center text-(--color-dark) hover:bg-(--color-sand-light) transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ marginRight: 'calc(-50vw + 50%)' }}
      >
        {trips.map((trip) => (
          <div key={trip.id} className="w-[85vw] shrink-0 snap-start sm:w-[380px] lg:w-[420px]">
            <TripCard trip={trip} />
          </div>
        ))}
        <div className="w-4 shrink-0 sm:w-6 lg:w-8" />
      </div>
    </div>
  )
}
