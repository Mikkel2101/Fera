import Link from 'next/link'
import type { Database } from '@/lib/supabase/types'

type TripRow = Database['public']['Tables']['trips']['Row']

export default function TripBookingCTA({ trip }: { trip: TripRow }) {
  const isBookable = trip.status !== 'Fullbooket' && trip.status !== 'Avlyst' && trip.status !== 'Gjennomført'

  return (
    <section className="py-10">
      <div className="bg-(--color-dark) rounded-2xl p-8 sm:p-10 text-white">
        <p className="text-white/50 text-xs uppercase tracking-widest font-medium mb-3">Booking</p>
        <h2 className="font-sans font-bold text-4xl mb-4">Sikre plassen din</h2>
        <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
          Fra {trip.price_double_eur.toLocaleString('nb-NO')} EUR per person i delt dobbeltrom. Reserver uten å betale nå — vi tar kontakt med mer informasjon før du bekrefter en bindende bestilling.
        </p>
        {isBookable ? (
          <Link
            href={`/travels/${trip.id}/book`}
            className="inline-block bg-white text-(--color-dark) font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-(--color-sand) transition-colors"
          >
            Reserver plass
          </Link>
        ) : (
          <p className="text-white/50 text-sm font-medium">
            {trip.status === 'Fullbooket' ? 'Utsolgt' : 'Ikke tilgjengelig'}
          </p>
        )}
      </div>
    </section>
  )
}
