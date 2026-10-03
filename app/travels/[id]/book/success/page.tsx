import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ROOM_LABELS: Record<string, string> = {
  Dobbel: 'Dobbeltrom',
  Single: 'Enkeltrom',
}

type BookingWithTrip = {
  first_name:      string
  last_name:       string
  email:           string
  room_type:       string | null
  selected_extras: string[]
  trips:           { name: string; start_date: string; end_date: string } | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function BookSuccessPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>
  searchParams: Promise<{ booking?: string }>
}) {
  const { id }      = await params
  const { booking: bookingId } = await searchParams

  if (!bookingId) redirect(`/travels/${id}`)

  // RLS: kunden leser kun egne bookinger (user_id = auth.uid())
  const supabase = await createClient()
  const { data } = await supabase
    .from('bookings')
    .select('first_name, last_name, email, room_type, selected_extras, trips(name, start_date, end_date)')
    .eq('id', bookingId)
    .eq('trip_id', id)
    .maybeSingle()

  if (!data) redirect('/account/trips')
  const booking = data as unknown as BookingWithTrip

  const rows: Array<[string, string]> = [
    ['Navn', `${booking.first_name} ${booking.last_name}`],
    ['E-post', booking.email],
  ]
  if (booking.trips) {
    rows.push(['Tur', booking.trips.name])
    rows.push(['Datoer', `${formatDate(booking.trips.start_date)} – ${formatDate(booking.trips.end_date)}`])
  }
  if (booking.room_type) rows.push(['Romtype', ROOM_LABELS[booking.room_type] ?? booking.room_type])
  if (booking.selected_extras.length > 0) rows.push(['Tilvalg', booking.selected_extras.join(', ')])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-(--color-success)/10 border-2 border-(--color-success) flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-(--color-success)" aria-hidden="true">
              <path d="M6 18l8 8 16-16"/>
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-(--color-text) mb-3">
            Plassen er reservert!
          </h1>
          <p className="text-(--color-muted) text-base leading-relaxed">
            Takk, {booking.first_name}! Vi har sendt en bekreftelse til {booking.email}.
          </p>
        </div>

        <div className="bg-(--color-ice-light) border border-(--color-border) rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-(--color-text) text-sm uppercase tracking-wider mb-4">Din reservasjon</h2>
          <dl className="space-y-3">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 text-sm">
                <dt className="text-(--color-muted)">{label}</dt>
                <dd className="text-(--color-text) font-medium text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-(--color-sand) border border-(--color-border) rounded-xl p-5 mb-8">
          <p className="font-medium text-(--color-text) mb-2 text-sm">Hva skjer nå?</p>
          <ul className="space-y-1.5 text-(--color-muted) text-sm">
            <li>• Plassen din er holdt av — reservasjonen er uforpliktende</li>
            <li>• Vi tar kontakt med betalingsinformasjon før påmeldingen blir bindende</li>
            <li>• Du finner reservasjonen under «Mine reiser» på kontoen din</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/trips"
            className="flex-1 bg-(--color-cta) text-white px-6 py-3.5 rounded-full font-semibold hover:bg-(--color-dark-mid) transition-colors text-center text-sm"
          >
            Se Mine reiser
          </Link>
          <Link
            href="/travels"
            className="flex-1 border border-(--color-border) text-(--color-text) px-6 py-3.5 rounded-full font-medium hover:bg-(--color-ice-light) transition-colors text-center text-sm"
          >
            Se flere turer
          </Link>
        </div>
      </div>
    </div>
  )
}
