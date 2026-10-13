import Image from 'next/image'
import type { Database } from '@/lib/supabase/types'

type TripRow = Database['public']['Tables']['trips']['Row']

const statusColor: Record<string, string> = {
  'Åpen': 'bg-(--color-success)',
  'Få plasser': 'bg-amber-500',
  'Fullbooket': 'bg-(--color-muted)',
  'Avlyst': 'bg-red-600',
  'Gjennomført': 'bg-(--color-muted)',
  'Utkast': 'bg-(--color-muted)',
}

export default function TripHero({ trip }: { trip: TripRow }) {
  const badgeColor = statusColor[trip.status] ?? 'bg-(--color-success)'

  return (
    <section className="relative min-h-[58vh] flex items-end overflow-hidden bg-(--color-dark)">
      {trip.main_image ? (
        <>
          <Image
            src={trip.main_image}
            alt={trip.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-(--color-dark) via-(--color-dark) to-(--color-dark-mid)" />
      )}

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-16">
        <div className="max-w-3xl">
          {/* Status badge */}
          <div className="flex items-center gap-3 mb-5">
            <span className={`inline-flex items-center gap-1.5 ${badgeColor} text-white text-xs font-semibold px-3 py-1.5 rounded-full`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              {trip.status}
            </span>
            {trip.trip_type && (
              <span className="bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                {trip.trip_type}
              </span>
            )}
          </div>

          <h1 className="font-sans text-white text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05]">
            {trip.name}
          </h1>
        </div>
      </div>
    </section>
  )
}
