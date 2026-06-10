import Link from 'next/link'
import type { Database } from '@/lib/supabase/types'

type TripRow = Database['public']['Tables']['trips']['Row']

export default function TripPrices({ trip }: { trip: TripRow }) {
  const isBookable = trip.status !== 'Fullbooket' && trip.status !== 'Avlyst' && trip.status !== 'Gjennomført'
  const hasEarlyBird = Boolean(trip.early_bird_price_double && trip.early_bird_deadline)
  const earlyBirdDeadline = trip.early_bird_deadline
    ? new Date(trip.early_bird_deadline).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 bg-(--color-ice-light)">
      <div className="max-w-4xl mx-auto">
        <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-3">Priser</p>
        <h2 className="font-display italic font-bold text-(--color-text) text-3xl mb-10">Finn ditt alternativ</h2>

        {hasEarlyBird && (
          <div className="bg-(--color-sand) border border-(--color-border) rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-4 justify-between">
            <div>
              <p className="text-xs font-bold text-(--color-dark) uppercase tracking-wider mb-1">Early Bird — begrenset tilbud</p>
              <p className="text-(--color-text) text-sm">
                Dobbeltrom til{' '}
                <span className="font-bold text-(--color-dark) text-base">
                  {trip.early_bird_price_double!.toLocaleString('nb-NO')} EUR
                </span>
                {earlyBirdDeadline && (
                  <span className="text-(--color-muted)"> — gjelder til {earlyBirdDeadline}</span>
                )}
              </p>
            </div>
            {isBookable && (
              <Link
                href={`/travels/${trip.id}/book`}
                className="shrink-0 bg-(--color-cta) text-white text-xs font-bold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Spar nå →
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Dobbeltrom */}
          <div className="bg-white border-2 border-(--color-dark) rounded-2xl p-6 relative">
            <span className="absolute -top-3 left-5 bg-(--color-dark) text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Mest valgt</span>
            <p className="text-xs uppercase tracking-widest text-(--color-muted) font-medium mb-2 mt-2">Dobbeltrom</p>
            <p className="font-display font-bold text-(--color-dark) text-3xl mb-1">
              {trip.price_double_eur.toLocaleString('nb-NO')} EUR
            </p>
            <p className="text-(--color-muted) text-xs">Per person, delt rom</p>
            <div className="border-t border-(--color-border) my-4" />
            <ul className="space-y-1.5 text-sm text-(--color-muted)">
              <li className="flex items-center gap-2"><span className="text-(--color-success)">✓</span> Depositum kun {trip.deposit_eur.toLocaleString('nb-NO')} EUR nå</li>
              <li className="flex items-center gap-2"><span className="text-(--color-success)">✓</span> Frokost inkludert</li>
              <li className="flex items-center gap-2"><span className="text-(--color-success)">✓</span> Alt coaching og baneleie</li>
            </ul>
          </div>

          {/* Enkeltrom */}
          {trip.price_single_eur != null && (
            <div className="bg-white border border-(--color-border) rounded-2xl p-6">
              <p className="text-xs uppercase tracking-widest text-(--color-muted) font-medium mb-2">Enkeltrom</p>
              <p className="font-display font-bold text-(--color-dark) text-3xl mb-1">
                {trip.price_single_eur.toLocaleString('nb-NO')} EUR
              </p>
              <p className="text-(--color-muted) text-xs">Eget rom, enkeltpåslag</p>
              <div className="border-t border-(--color-border) my-4" />
              <ul className="space-y-1.5 text-sm text-(--color-muted)">
                <li className="flex items-center gap-2"><span className="text-(--color-success)">✓</span> Privat rom, full fleksibilitet</li>
                <li className="flex items-center gap-2"><span className="text-(--color-success)">✓</span> Frokost inkludert</li>
                <li className="flex items-center gap-2"><span className="text-(--color-success)">✓</span> Alt coaching og baneleie</li>
              </ul>
            </div>
          )}

          {/* Depositum */}
          <div className="bg-(--color-dark) rounded-2xl p-6 text-white">
            <p className="text-xs uppercase tracking-widest text-white/50 font-medium mb-2">Sett plassen nå</p>
            <p className="font-display font-bold text-white text-3xl mb-1">
              {trip.deposit_eur.toLocaleString('nb-NO')} EUR
            </p>
            <p className="text-white/50 text-xs">Depositum — betales i dag</p>
            <div className="border-t border-white/10 my-4" />
            <p className="text-white/70 text-xs leading-relaxed mb-5">
              Resten av beløpet faktureres senest 60 dager før avreise. Ingen skjulte kostnader.
            </p>
            {isBookable && (
              <Link
                href={`/travels/${trip.id}/book`}
                className="block text-center bg-white text-(--color-dark) font-bold text-xs px-4 py-3 rounded-full hover:bg-(--color-sand) transition-colors"
              >
                Book med depositum →
              </Link>
            )}
            {!isBookable && (
              <p className="text-center text-white/50 text-xs font-medium">Ikke tilgjengelig for booking</p>
            )}
          </div>
        </div>

        <p className="text-center text-(--color-muted) text-xs">
          Sikker betaling via Stripe — din kortinformasjon behandles aldri av Fera
        </p>
      </div>
    </section>
  )
}
