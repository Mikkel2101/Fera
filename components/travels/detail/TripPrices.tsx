import type { Database } from '@/lib/supabase/types'

type TripRow = Database['public']['Tables']['trips']['Row']

export default function TripPrices({ trip }: { trip: TripRow }) {
  return (
    <section className="bg-(--color-surface) px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-(--color-text) mb-8">Priser</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-(--color-muted) text-sm">Dobbeltrom</p>
            <p className="text-(--color-gold) text-2xl font-bold">
              {trip.price_double_eur.toLocaleString('nb-NO')} EUR
            </p>
          </div>
          {trip.price_single_eur != null && (
            <div className="flex flex-col gap-1">
              <p className="text-(--color-muted) text-sm">Enkeltrom</p>
              <p className="text-(--color-gold) text-2xl font-bold">
                {trip.price_single_eur.toLocaleString('nb-NO')} EUR
              </p>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <p className="text-(--color-muted) text-sm">Depositum</p>
            <p className="text-(--color-gold) text-2xl font-bold">
              {trip.deposit_eur.toLocaleString('nb-NO')} EUR
            </p>
            <p className="text-(--color-muted) text-xs">Betales nå — resten faktureres</p>
          </div>
        </div>

        {trip.early_bird_price_double && trip.early_bird_deadline && (
          <div className="mt-6 p-4 bg-(--color-sand) rounded-xl border border-(--color-border)">
            <p className="text-(--color-gold) font-semibold text-sm mb-1">Early bird-pris</p>
            <p className="text-(--color-text)">
              Dobbeltrom:{' '}
              <span className="text-(--color-gold) font-bold">
                {trip.early_bird_price_double.toLocaleString('nb-NO')} EUR
              </span>{' '}
              — gjelder til{' '}
              {new Date(trip.early_bird_deadline).toLocaleDateString('nb-NO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
