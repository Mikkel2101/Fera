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
    <div className="max-w-lg mx-auto py-16 text-center px-4">
      <div className="text-6xl font-bold text-[--color-success] mb-6">✓</div>
      <h1 className="font-display text-3xl font-semibold text-[--color-text] mb-4">
        Booking mottatt!
      </h1>

      {booking && (
        <div className="bg-[--color-sand] rounded-xl p-5 text-left space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-[--color-subtle]">Navn</span>
            <span className="text-[--color-text] font-medium">
              {booking.first_name} {booking.last_name}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[--color-subtle]">E-post</span>
            <span className="text-[--color-text]">{booking.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[--color-subtle]">Depositum</span>
            <span className="text-[--color-success] font-medium">Betalt</span>
          </div>
        </div>
      )}

      <p className="text-[--color-muted] mb-8">
        Sjekk e-posten din for bekreftelse.
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href="/travels"
          className="bg-[--color-cta] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Se alle turer
        </Link>
        <Link
          href="/travels"
          className="text-[--color-subtle] hover:text-[--color-text] text-sm transition-colors"
        >
          Tilbake til alle turer
        </Link>
      </div>
    </div>
  )
}
