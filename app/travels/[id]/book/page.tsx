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
  )
}
