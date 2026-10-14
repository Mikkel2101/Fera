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

function nightCount(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="2.5" width="14" height="12" rx="2"/>
    <path d="M1 6.5h14M5 1v3M11 1v3"/>
  </svg>
)
const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="5" r="2.5"/>
    <path d="M1 13.5c0-2.761 2.239-5 5-5"/>
    <circle cx="12" cy="6" r="2"/>
    <path d="M9.5 13.5c0-2 1.5-3.5 3-3.5"/>
  </svg>
)
const IconHotel = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 14.5V2.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12"/>
    <path d="M10 7.5h3a1 1 0 0 1 1 1v6"/>
    <path d="M2 14.5h12"/>
    <path d="M4.5 4.5h1.5M4.5 7.5h1.5M4.5 10.5h1.5"/>
  </svg>
)
const IconPlane = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z"/>
    <circle cx="8" cy="6" r="1.5"/>
  </svg>
)

export default function TripBookingCard({ trip }: { trip: TripRow }) {
  const isBookable = trip.status !== 'Fullbooket' && trip.status !== 'Avlyst' && trip.status !== 'Gjennomført' && trip.status !== 'Utkast'
  const nights = nightCount(trip.start_date, trip.end_date)
  const singleSupplement =
    trip.price_single_eur != null ? trip.price_single_eur - trip.price_double_eur : null

  return (
    <div className="bg-white border border-(--color-border) rounded-2xl p-6 shadow-sm">
      <p className="text-(--color-muted) text-sm font-medium mb-1">Fra</p>
      <p className="flex items-baseline gap-1.5 mb-5">
        <span className="text-(--color-text) text-4xl font-bold">
          {trip.price_double_eur.toLocaleString('nb-NO')} €
        </span>
        <span className="text-(--color-muted) text-sm">/ deltaker</span>
      </p>

      <div className="space-y-3 text-sm text-(--color-subtle) border-t border-(--color-border) pt-5 mb-5">
        <span className="flex items-center gap-2">
          <IconCalendar />
          {formatDate(trip.start_date)} – {formatDate(trip.end_date)} ({nights} netter)
        </span>
        <span className="flex items-center gap-2">
          <IconPlane />
          Alicante (ALC)
        </span>
        <span className="flex items-center gap-2">
          <IconMapPin />
          Costa Blanca
        </span>
        {trip.hotel && (
          <span className="flex items-center gap-2">
            <IconHotel />
            {trip.hotel}
          </span>
        )}
        <span className="flex items-center gap-2">
          <IconUsers />
          {singleSupplement != null
            ? `Dobbeltrom (+${singleSupplement.toLocaleString('nb-NO')}€ enkeltrom)`
            : 'Dobbeltrom'}
        </span>
      </div>

      {isBookable ? (
        <Link
          href={`/travels/${trip.id}/book`}
          className="block text-center bg-(--color-cta) text-white px-6 py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Reserver plass
        </Link>
      ) : (
        <p className="text-center text-(--color-muted) text-sm bg-(--color-sand-light) rounded-full px-6 py-3.5">
          {trip.status === 'Fullbooket' ? 'Utsolgt' : 'Ikke tilgjengelig'}
        </p>
      )}
    </div>
  )
}
