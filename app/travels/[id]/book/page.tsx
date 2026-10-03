import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BookingShell from '@/components/booking/BookingShell'

type Extra = { name: string; price_eur: number }

const RESERVABLE_STATUSES = ['Åpen', 'Få plasser']

function buildPrefill(fullName: string | null, email: string, phone: string | null) {
  const [firstName = '', ...rest] = (fullName ?? '').trim().split(/\s+/)
  return {
    first_name: firstName,
    last_name:  rest.join(' '),
    email,
    phone:      phone ?? '',
  }
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/logg-inn?next=${encodeURIComponent(`/travels/${id}/book`)}`)

  const { data: trip } = await supabase
    .from('trips')
    .select('id, name, deposit_eur, price_double_eur, price_single_eur, extras, status')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!trip) notFound()
  if (!RESERVABLE_STATUSES.includes(trip.status)) redirect(`/travels/${id}`)

  const [{ data: existing }, { data: profile }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id')
      .eq('trip_id', id)
      .eq('user_id', user.id)
      .neq('status', 'Kansellert')
      .maybeSingle(),
    supabase
      .from('users')
      .select('full_name, phone')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  const prefill = buildPrefill(
    profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? null,
    user.email ?? '',
    profile?.phone ?? null,
  )

  return (
    <div className="min-h-[80vh] bg-(--color-bg)">
      {/* Breadcrumb header */}
      <div className="border-b border-(--color-border) bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-xs text-(--color-muted)">
            <Link href="/travels" className="hover:text-(--color-text) transition-colors">Reiser</Link>
            <span>/</span>
            <Link href={`/travels/${id}`} className="hover:text-(--color-text) transition-colors line-clamp-1">{trip.name}</Link>
            <span>/</span>
            <span className="text-(--color-text)">Booking</span>
          </nav>
        </div>
      </div>

      {/* Booking container */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white border border-(--color-border) rounded-2xl p-6 sm:p-10">
          {existing ? (
            <div className="text-center py-6">
              <h1 className="font-display text-2xl font-semibold text-(--color-text) mb-3">
                Du har allerede en plass på denne turen
              </h1>
              <p className="text-sm text-(--color-muted) mb-6">
                Reservasjonen din ligger under «Mine reiser». Ta kontakt hvis du vil endre den.
              </p>
              <Link
                href="/account/trips"
                className="inline-block bg-(--color-cta) text-white font-semibold text-sm rounded-full px-6 py-3 hover:bg-(--color-dark-mid) transition-colors"
              >
                Gå til Mine reiser
              </Link>
            </div>
          ) : (
          <BookingShell
            prefill={prefill}
            trip={{
              id:               trip.id,
              title:            trip.name,
              extras:           (trip.extras ?? []) as Extra[],
              deposit_eur:      trip.deposit_eur,
              price_double_eur: trip.price_double_eur,
              price_single_eur: trip.price_single_eur ?? trip.price_double_eur,
            }}
          />
          )}
        </div>

        {/* Trust note */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-6 text-xs text-(--color-muted)">
          <span>Uforpliktende reservasjon</span>
          <span>·</span>
          <span>Ingen betaling nå</span>
          <span>·</span>
          <span>Vi tar kontakt før noe blir bindende</span>
        </div>
      </div>
    </div>
  )
}
