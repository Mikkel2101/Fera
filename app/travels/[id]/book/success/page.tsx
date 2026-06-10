import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function BookSuccessPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>
  searchParams: Promise<{ session_id?: string }>
}) {
  const { id }         = await params
  const { session_id } = await searchParams

  if (!session_id) redirect(`/travels/${id}`)

  const supabase = await createClient()
  const { data: booking } = await supabase
    .from('bookings')
    .select('first_name, last_name, email, deposit_status, trip_id')
    .eq('stripe_session_id', session_id)
    .single()

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full">
        {/* Success icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-(--color-success)/10 border-2 border-(--color-success) flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-(--color-success)">
              <path d="M6 18l8 8 16-16"/>
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-(--color-text) mb-3">
            Booking bekreftet!
          </h1>
          <p className="text-(--color-muted) text-base leading-relaxed">
            {booking?.first_name
              ? `Takk, ${booking.first_name}! Sjekk e-posten din for bekreftelse.`
              : 'Vi har mottatt bookingen din. Sjekk e-posten din for bekreftelse.'}
          </p>
        </div>

        {booking && (
          <div className="bg-(--color-ice-light) border border-(--color-border) rounded-2xl p-6 mb-8">
            <h2 className="font-semibold text-(--color-text) text-sm uppercase tracking-wider mb-4">Oppsummering</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-(--color-muted)">Navn</span>
                <span className="text-(--color-text) font-medium">{booking.first_name} {booking.last_name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-(--color-muted)">E-post</span>
                <span className="text-(--color-text)">{booking.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-(--color-border) pt-3">
                <span className="text-(--color-muted)">Depositum</span>
                <span className="text-(--color-success) font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-(--color-success) inline-block" />
                  Betalt
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-(--color-sand) border border-(--color-border) rounded-xl p-5 mb-8">
          <p className="font-medium text-(--color-text) mb-2 text-sm">Hva skjer nå?</p>
          <ul className="space-y-1.5 text-(--color-muted) text-sm">
            <li>• Du mottar en bekreftelse på e-post innen noen minutter</li>
            <li>• Restbeløpet forfaller 60 dager før avreise</li>
            <li>• Vi sender reiseinformasjon og praktisk info ca. 30 dager før</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/travels"
            className="flex-1 bg-(--color-cta) text-white px-6 py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity text-center text-sm"
          >
            Se alle turer
          </Link>
          <Link
            href={`/travels/${id}`}
            className="flex-1 border border-(--color-border) text-(--color-text) px-6 py-3.5 rounded-full font-medium hover:bg-(--color-ice-light) transition-colors text-center text-sm"
          >
            Tilbake til turen
          </Link>
        </div>
      </div>
    </div>
  )
}
