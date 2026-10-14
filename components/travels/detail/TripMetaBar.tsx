import Link from 'next/link'
import type { Database } from '@/lib/supabase/types'

type TripRow = Database['public']['Tables']['trips']['Row']

export default function TripMetaBar({ trip }: { trip: TripRow }) {
  const isBookable = trip.status !== 'Fullbooket' && trip.status !== 'Avlyst' && trip.status !== 'Gjennomført' && trip.status !== 'Utkast'

  if (!isBookable) return null

  return (
    <div className="bg-white border-b border-(--color-border) py-3 px-4 sm:px-6 lg:px-8 sticky top-14 z-40">
      <div className="max-w-5xl mx-auto flex justify-end">
        <Link
          href={`/travels/${trip.id}/book`}
          className="shrink-0 bg-(--color-cta) text-white px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Reserver plass
        </Link>
      </div>
    </div>
  )
}
