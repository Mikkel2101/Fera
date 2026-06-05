import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TripForm from '@/components/admin/TripForm'

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single()

  if (!trip) notFound()

  return <TripForm trip={trip} />
}
