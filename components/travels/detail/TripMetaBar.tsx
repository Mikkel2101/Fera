import Link from 'next/link'
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
const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="5" r="2.5"/>
    <path d="M1 13.5c0-2.761 2.239-5 5-5"/>
    <circle cx="12" cy="6" r="2"/>
    <path d="M9.5 13.5c0-2 1.5-3.5 3-3.5"/>
  </svg>
)

export default function TripMetaBar({ trip }: { trip: TripRow }) {
  const spotsLeft =
    trip.max_participants != null
      ? trip.max_participants - trip.registered_count
      : null
  const isFull = trip.status === 'Fullbooket'

  return (
    <div className="bg-white border-b border-(--color-border) py-4 px-4 sm:px-6 lg:px-8 sticky top-14 z-40">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-4 text-sm text-(--color-subtle)">
          <span className="flex items-center gap-1.5">
            <IconCalendar />
            {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
          </span>
          <span className="flex items-center gap-1.5">
            <IconPin />
            {trip.destination}
          </span>
          <span className="flex items-center gap-1.5">
            <IconEuro />
            Fra {trip.price_double_eur.toLocaleString('nb-NO')} EUR
          </span>
          {spotsLeft != null && (
            <span className="flex items-center gap-1.5">
              <IconUsers />
              {spotsLeft} plasser igjen
            </span>
          )}
        </div>

        {!isFull && (
          <Link
            href={`/travels/${trip.id}/book`}
            className="shrink-0 bg-(--color-cta) text-white px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Book din plass
          </Link>
        )}
      </div>
    </div>
  )
}
