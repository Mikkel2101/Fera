import Link from 'next/link'
import Image from 'next/image'
import type { Database } from '@/lib/supabase/types'

type Trip = Database['public']['Tables']['trips']['Row']

// DB status values: 'Utkast' | 'Åpen' | 'Få plasser' | 'Fullbooket' | 'Avlyst' | 'Gjennomført'
function getStatusBadge(trip: Trip) {
  if (trip.status === 'Fullbooket') {
    return { label: 'Utsolgt', className: 'bg-white/20 text-white' }
  }
  if (trip.status === 'Avlyst' || trip.status === 'Gjennomført' || trip.status === 'Utkast') {
    return null
  }

  const available = trip.max_participants
    ? trip.max_participants - trip.registered_count
    : null

  if (trip.status === 'Få plasser' || (available !== null && trip.max_participants! > 0 && available / trip.max_participants! < 0.2)) {
    return {
      label: available != null ? `${available} plasser igjen` : 'Få plasser',
      className: 'bg-(--color-cta) text-white',
    }
  }

  return { label: 'Åpen', className: 'bg-(--color-success) text-white' }
}

function hasEarlyBird(trip: Trip): boolean {
  if (!trip.early_bird_price_double || !trip.early_bird_deadline) return false
  return new Date(trip.early_bird_deadline) >= new Date()
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function TripCard({ trip }: { trip: Trip }) {
  if (trip.status === 'Utkast') return null

  const badge = getStatusBadge(trip)
  const earlyBird = hasEarlyBird(trip)
  const spotsLeft =
    trip.max_participants != null
      ? trip.max_participants - trip.registered_count
      : null
  const isFull = trip.status === 'Fullbooket'

  return (
    <div className="bg-(--color-dark-card) rounded-[14px] overflow-hidden flex flex-col">
      {/* Bildedel */}
      <div className="relative aspect-video">
        {trip.main_image ? (
          <>
            <Image
              src={trip.main_image}
              alt={trip.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-(--color-dark) to-(--color-dark-mid)" />
        )}

        {/* FERA watermark */}
        <span className="absolute bottom-3 left-4 font-display text-(--color-gold)/20 text-4xl font-bold select-none pointer-events-none">
          FERA
        </span>

        {/* Status badge */}
        {badge && (
          <span
            className={`absolute top-3 right-3 ${badge.className} text-xs font-medium px-2.5 py-1 rounded-full`}
          >
            {badge.label}
          </span>
        )}

        {/* Early bird badge */}
        {earlyBird && (
          <span className="absolute bottom-3 right-3 bg-(--color-gold) text-white text-xs font-medium px-2.5 py-1 rounded-full">
            Early bird
          </span>
        )}
      </div>

      {/* Kortinnhold */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {trip.trip_type && (
          <p className="text-(--color-muted) text-xs uppercase tracking-wider font-sans">
            {trip.trip_type}
          </p>
        )}

        <h3 className="font-display text-white text-xl font-semibold leading-tight">
          {trip.name}
        </h3>

        <p className="text-(--color-muted) text-sm">
          {formatDate(trip.start_date)} · {trip.destination}
          {spotsLeft != null && ` · ${spotsLeft} plasser igjen`}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4">
          <span className="text-(--color-gold) text-2xl font-bold">
            €{trip.price_double_eur.toLocaleString('nb-NO')}
          </span>
          <Link
            href={`/travels/${trip.id}`}
            className="bg-(--color-cta) text-white text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
          >
            {isFull ? 'Venteliste →' : 'Se detaljer →'}
          </Link>
        </div>
      </div>
    </div>
  )
}
