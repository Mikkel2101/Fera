import Image from 'next/image'
import type { Database } from '@/lib/supabase/types'

type TripRow = Database['public']['Tables']['trips']['Row']

export default function TripHero({ trip }: { trip: TripRow }) {
  const isAvailable = trip.status !== 'Fullbooket' && trip.status !== 'Avlyst' && trip.status !== 'Gjennomført'

  return (
    <section className="relative min-h-[50vh] flex items-end overflow-hidden bg-gradient-to-b from-[--color-dark] to-[--color-dark-mid]">
      {trip.main_image && (
        <>
          <Image
            src={trip.main_image}
            alt={trip.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-24">
        {isAvailable && (
          <span className="inline-block bg-[--color-success] text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
            {trip.status}
          </span>
        )}
        <h1 className="font-display text-white text-5xl lg:text-7xl font-bold leading-tight max-w-3xl">
          {trip.name}
        </h1>
      </div>
    </section>
  )
}
