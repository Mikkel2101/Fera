'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (user.app_metadata?.role !== 'admin') throw new Error('Forbidden')
}

const bookingIdSchema = z.string().uuid()

function revalidateBookingViews() {
  revalidatePath('/admin/bookings')
  revalidatePath('/admin/trips')
  revalidatePath('/travels', 'layout')
}

// Reservert → Bekreftet. Kansellerte bookinger kan ikke bekreftes, siden
// plassen allerede er frigjort og kan være tatt av noen andre.
export async function confirmBooking(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = bookingIdSchema.parse(formData.get('booking_id'))

  const { error } = await createServiceClient()
    .from('bookings')
    .update({ status: 'Bekreftet' })
    .eq('id', id)
    .eq('status', 'Reservert')

  if (error) {
    console.error('confirmBooking failed:', error)
    throw new Error('Kunne ikke bekrefte bookingen')
  }
  revalidateBookingViews()
}

// Kansellerer og frigjør plassen på turen (cancel_booking i migrasjon 021).
export async function cancelBooking(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = bookingIdSchema.parse(formData.get('booking_id'))

  const { error } = await createServiceClient().rpc('cancel_booking', { p_booking_id: id })

  if (error) {
    console.error('cancelBooking failed:', error)
    throw new Error('Kunne ikke kansellere bookingen')
  }
  revalidateBookingViews()
}
