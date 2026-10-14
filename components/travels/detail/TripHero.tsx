import Image from 'next/image'
import Link from 'next/link'
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
const IconPin = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z"/>
    <circle cx="8" cy="6" r="1.5"/>
  </svg>
)
const IconEuro = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 4.5A4.5 4.5 0 0 0 4 8a4.5 4.5 0 0 0 7.5 3.5"/>
    <path d="M2.5 7h6M2.5 9h6"/>
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

export default function TripHero({ trip }: { trip: TripRow }) {
  const badgeColor = statusColor[trip.status] ?? 'bg-(--color-success)'
  const spotsLeft =
    trip.max_participants != null
      ? trip.max_participants - trip.registered_count
      : null
  const isBookable = trip.status !== 'Fullbooket' && trip.status !== 'Avlyst' && trip.status !== 'Gjennomført' && trip.status !== 'Utkast'
  const nights = nightCount(trip.start_date, trip.end_date)

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
              <span className="bg-white/10 text-white/80 text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/20">
                {trip.trip_type}
              </span>
            )}
          </div>

          <h1 className="font-sans text-white text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] mb-7">
            {trip.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-white text-sm sm:text-base">
            <span className="flex items-center gap-2">
              <IconCalendar />
              {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
            </span>
            <span className="flex items-center gap-2">
              <IconPin />
              {trip.destination}
            </span>
            <span className="flex items-center gap-2">
              <IconEuro />
              Fra {trip.price_double_eur.toLocaleString('nb-NO')} EUR
            </span>
            <span className="flex items-center gap-2">
              {nights} netter
            </span>
            {spotsLeft != null && (
              <span className="flex items-center gap-2">
                <IconUsers />
                {spotsLeft} plasser igjen
              </span>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-white/25 flex items-center">
            {isBookable && (
              <Link
                href={`/travels/${trip.id}/book`}
                className="shrink-0 bg-white text-(--color-dark) px-6 py-3 rounded-full font-semibold text-sm hover:bg-(--color-sand) transition-colors"
              >
                Reserver plass
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
