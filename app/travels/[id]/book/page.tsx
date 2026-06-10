import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BookingShell from '@/components/booking/BookingShell'

type Extra = { name: string; price_eur: number }

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: trip } = await supabase
    .from('trips')
    .select('id, name, deposit_eur, price_double_eur, price_single_eur, extras, status')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!trip) notFound()
  if (trip.status === 'Fullbooket') redirect(`/travels/${id}`)

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
          <BookingShell
            trip={{
              id:               trip.id,
              title:            trip.name,
              extras:           (trip.extras ?? []) as Extra[],
              deposit_eur:      trip.deposit_eur,
              price_double_eur: trip.price_double_eur,
              price_single_eur: trip.price_single_eur ?? trip.price_double_eur,
            }}
          />
        </div>

        {/* Trust note */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-(--color-muted)">
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5L6 1Z"/>
            </svg>
            Trygg betaling via Stripe
          </span>
          <span>·</span>
          <span>Depositum {trip.deposit_eur} EUR</span>
          <span>·</span>
          <span>Ingen skjulte kostnader</span>
        </div>
      </div>
    </div>
  )
}
