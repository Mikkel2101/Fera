import Link from 'next/link'
import Image from 'next/image'
import type { Database } from '@/lib/supabase/types'

type Trip = Database['public']['Tables']['trips']['Row']

function getStatusBadge(trip: Trip) {
  if (trip.status === 'Fullbooket') {
    return { label: 'Utsolgt', className: 'bg-(--color-border) text-(--color-muted)' }
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
      className: 'bg-(--color-sand) text-(--color-dark)',
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
    <Link href={`/travels/${trip.id}`} className="group bg-(--color-sand-light) rounded overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
      {/* Bildedel */}
      <div className="relative aspect-video overflow-hidden">
        {trip.main_image ? (
          <>
            <Image
              src={trip.main_image}
              alt={trip.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          </>
        ) : (
          <div className="absolute inset-0 bg-(--color-border)" />
        )}

        {/* Status badge */}
        {badge && (
          <span className={`absolute top-3 right-3 ${badge.className} text-xs font-semibold px-2.5 py-1 rounded-full`}>
            {badge.label}
          </span>
        )}

        {/* Early bird badge */}
        {earlyBird && (
          <span className="absolute bottom-3 right-3 bg-(--color-sand) text-(--color-dark) text-xs font-semibold px-2.5 py-1 rounded-full">
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

        <h3 className="font-display text-(--color-text) text-xl font-semibold leading-tight">
          {trip.name}
        </h3>

        <p className="text-(--color-muted) text-sm">
          {formatDate(trip.start_date)} · {trip.destination}
          {spotsLeft != null && ` · ${spotsLeft} plasser igjen`}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4">
          <span className="text-(--color-cta) text-2xl font-bold">
            €{trip.price_double_eur.toLocaleString('nb-NO')}
          </span>
          <span className="bg-(--color-cta) text-white text-sm font-semibold px-4 py-2 rounded-full group-hover:bg-(--color-dark-mid) transition-colors">
            {isFull ? 'Venteliste →' : 'Se detaljer →'}
          </span>
        </div>
      </div>
    </Link>
  )
}
