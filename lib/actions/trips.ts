'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type TripFormData = {
  name:                    string
  destination:             string
  hotel:                   string
  start_date:              string
  end_date:                string
  trip_type:               string
  status:                  string
  published:               boolean
  max_participants:        number | null
  price_double_eur:        number
  price_single_eur:        number | null
  deposit_eur:             number
  early_bird_price_double: number | null
  early_bird_price_single: number | null
  early_bird_deadline:     string | null
  description:             string
  program:                 string
  main_image:              string
  gallery_images:          string[]
  included:                string[]
  not_included:            string[]
  extras:                  Array<{ name: string; price_eur: number }>
  coaches:                 Array<{ name: string; title: string; bio: string; image: string }>
  faq:                     Array<{ question: string; answer: string }>
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (user.app_metadata?.role !== 'admin') throw new Error('Forbidden')
  return supabase
}

export async function createTrip(data: TripFormData): Promise<{ id: string }> {
  const supabase = await requireAdmin()
  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      ...data,
      extras:  data.extras  as unknown as import('@/lib/supabase/types').Json,
      coaches: data.coaches as unknown as import('@/lib/supabase/types').Json,
      faq:     data.faq     as unknown as import('@/lib/supabase/types').Json,
    })
    .select('id')
    .single()
  if (error || !trip) throw new Error(error?.message ?? 'Kunne ikke opprette tur')
  revalidatePath('/admin/trips')
  revalidatePath('/travels')
  return { id: trip.id }
}

export async function updateTrip(id: string, data: TripFormData): Promise<void> {
  const supabase = await requireAdmin()
  const { error } = await supabase
    .from('trips')
    .update({
      ...data,
      extras:  data.extras  as unknown as import('@/lib/supabase/types').Json,
      coaches: data.coaches as unknown as import('@/lib/supabase/types').Json,
      faq:     data.faq     as unknown as import('@/lib/supabase/types').Json,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/trips')
  revalidatePath(`/admin/trips/${id}/edit`)
  revalidatePath('/travels')
  revalidatePath(`/travels/${id}`)
}

export async function deleteTrip(id: string): Promise<void> {
  const supabase = await requireAdmin()
  const { error } = await supabase.from('trips').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/trips')
  revalidatePath('/travels')
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  const supabase = await requireAdmin()
  const { error } = await supabase
    .from('trips')
    .update({ published })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/trips')
  revalidatePath('/travels')
}
