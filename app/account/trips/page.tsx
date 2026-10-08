import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { bookingStatusColor, bookingStatusLabel } from '@/lib/booking/status'

export const metadata: Metadata = { title: 'Reiser' }

type TripSummary = {
  id: string
  name: string
  destination: string
  start_date: string
  end_date: string
  main_image: string | null
}

type BookingWithTrip = {
  id: string
  created_at: string
  status: string
  room_type: string | null
  trips: TripSummary | null
}

export default async function TripsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: rawBookings } = await supabase
    .from('bookings')
    .select('id, created_at, status, room_type, trips(id, name, destination, start_date, end_date, main_image)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const bookings = rawBookings as unknown as BookingWithTrip[] | null

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold text-(--color-text)">Mine reiser</h1>

      {!bookings?.length ? (
        <div className="rounded-2xl border border-(--color-border) p-12 text-center">
          <p className="text-(--color-muted) mb-4">
            Du har ingen reservasjoner ennå.
          </p>
          <Link
            href="/travels"
            className="inline-block bg-(--color-cta) text-white font-semibold text-sm rounded-full px-6 py-3 hover:bg-(--color-dark-mid) transition-colors"
          >
            Se kommende turer
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const trip = booking.trips
            if (!trip) return null

            const startDate = trip.start_date
              ? new Date(trip.start_date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—'
            const endDate = trip.end_date
              ? new Date(trip.end_date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—'
            const bookedDate = new Date(booking.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })

            return (
              <div key={booking.id} className="rounded-2xl border border-(--color-border) bg-white overflow-hidden">
                <div className="flex">
                  {/* Bilde */}
                  {trip.main_image && (
                    <div className="relative w-40 shrink-0 hidden sm:block">
                      <Image
                        src={trip.main_image}
                        alt={trip.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h2 className="font-display text-lg font-semibold text-(--color-text)">{trip.name}</h2>
                        <p className="text-sm text-(--color-muted)">{trip.destination}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${bookingStatusColor(booking.status)}`}>
                        {bookingStatusLabel(booking.status)}
                      </span>
                    </div>

                    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-(--color-muted) font-medium">Avreise</dt>
                        <dd className="text-(--color-text) font-medium">{startDate}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-(--color-muted) font-medium">Hjemkomst</dt>
                        <dd className="text-(--color-text) font-medium">{endDate}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-(--color-muted) font-medium">Romtype</dt>
                        <dd className="text-(--color-text) font-medium">{booking.room_type ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-(--color-muted) font-medium">Booket</dt>
                        <dd className="text-(--color-text)">{bookedDate}</dd>
                      </div>
                    </dl>

                    <div className="mt-4">
                      <Link
                        href={`/travels/${trip.id}`}
                        className="text-xs font-semibold text-(--color-dark) border border-(--color-dark) rounded-full px-4 py-1.5 hover:bg-(--color-dark) hover:text-white transition-colors"
                      >
                        Se tur
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
