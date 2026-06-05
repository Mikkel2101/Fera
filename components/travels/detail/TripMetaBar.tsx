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

export default function TripMetaBar({ trip }: { trip: TripRow }) {
  const spotsLeft =
    trip.max_participants != null
      ? trip.max_participants - trip.registered_count
      : null
  const isFull = trip.status === 'Fullbooket'

  return (
    <div className="bg-white border-b border-[--color-border] py-4 px-4 sm:px-6 lg:px-8 sticky top-14 z-40">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-4 text-sm text-[--color-subtle]">
          <span>📅 {formatDate(trip.start_date)} – {formatDate(trip.end_date)}</span>
          <span>📍 {trip.destination}</span>
          <span>💶 Fra {trip.price_double_eur.toLocaleString('nb-NO')} EUR</span>
          {spotsLeft != null && (
            <span>👥 {spotsLeft} plasser igjen</span>
          )}
        </div>

        {!isFull && (
          <Link
            href={`/travels/${trip.id}/book`}
            className="shrink-0 bg-[--color-cta] text-white px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Book din plass
          </Link>
        )}
      </div>
    </div>
  )
}
