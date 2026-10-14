'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Database } from '@/lib/supabase/types'

type TripRow = Database['public']['Tables']['trips']['Row']

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="2.5" width="14" height="12" rx="2"/>
    <path d="M1 6.5h14M5 1v3M11 1v3"/>
  </svg>
)
const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z"/>
    <circle cx="8" cy="6" r="1.5"/>
  </svg>
)
const IconEuro = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 4.5A4.5 4.5 0 0 0 4 8a4.5 4.5 0 0 0 7.5 3.5"/>
    <path d="M2.5 7h6M2.5 9h6"/>
  </svg>
)
const IconPlane = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z"/>
  </svg>
)

function nightCount(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export default function TripMetaBar({ trip }: { trip: TripRow }) {
  const isBookable = trip.status !== 'Fullbooket' && trip.status !== 'Avlyst' && trip.status !== 'Gjennomført' && trip.status !== 'Utkast'
  const nights = nightCount(trip.start_date, trip.end_date)

  // Skjuler den sticky baren når turens egen "Reserver plass"-knapp lenger ned er synlig, slik at vi ikke viser to like knapper samtidig.
  const [ctaVisible, setCtaVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById('trip-booking-cta')
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => setCtaVisible(entry.isIntersecting),
      { rootMargin: '-96px 0px 0px 0px' }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      aria-hidden={ctaVisible}
      className={`bg-white border-b border-(--color-border) py-5 sticky top-14 z-40 lg:hidden transition-all duration-300 ${
        ctaVisible ? 'pointer-events-none -translate-y-2 opacity-0' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3 text-xs text-(--color-subtle) sm:text-sm">
            <span className="flex items-center gap-1.5">
              <IconCalendar />
              {formatDate(trip.start_date)} – {formatDate(trip.end_date)} ({nights}&nbsp;netter)
            </span>
            <span className="flex items-center gap-1.5">
              <IconPlane />
              Alicante (ALC)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-(--color-subtle) sm:text-sm">
            <span className="flex items-center gap-1.5">
              <IconPin />
              {trip.destination}
            </span>
            <span className="flex items-center gap-1.5">
              <IconEuro />
              Fra {trip.price_double_eur.toLocaleString('nb-NO')} EUR
            </span>
          </div>
        </div>

        {isBookable && (
          <Link
            href={`/travels/${trip.id}/book`}
            className="shrink-0 bg-(--color-cta) text-white px-4 py-2.5 rounded-full font-semibold text-xs sm:px-6 sm:py-3 sm:text-sm hover:opacity-90 transition-opacity"
          >
            Reserver plass
          </Link>
        )}
      </div>
    </div>
  )
}
