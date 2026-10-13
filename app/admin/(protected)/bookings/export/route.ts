import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { bookingsToCsv, type BookingCsvRow } from '@/lib/booking/csv'
import { isBookingStatus } from '@/lib/booking/status'
import { fetchRoomStatuses } from '@/lib/booking/room-status-query'

type ExportBooking = Omit<BookingCsvRow, 'trip_name' | 'room_status' | 'preferred_side'> & {
  id:      string
  trip_id: string
  trips:   { name: string } | null
  users:   { preferred_side: string | null } | null
}

// Route handlers arver ikke admin-layoutens tilgangssjekk — sjekk her.
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const tripId = request.nextUrl.searchParams.get('trip_id')
  const status = request.nextUrl.searchParams.get('status')

  let query = supabase
    .from('bookings')
    .select('id, trip_id, created_at, status, first_name, last_name, email, phone, padel_level, room_type, room_preference, roommate_name, room_share_gender, selected_extras, trip_goal, special_requests, price_total_eur, trips(name), users(preferred_side)')
    .order('created_at', { ascending: true })
  if (tripId) query = query.eq('trip_id', tripId)
  if (isBookingStatus(status)) query = query.eq('status', status)

  const { data, error } = await query
  if (error) {
    console.error('booking export failed:', error)
    return NextResponse.json({ error: 'Eksport feilet' }, { status: 500 })
  }

  const bookings     = data as unknown as ExportBooking[]
  const roomStatuses = await fetchRoomStatuses(supabase, bookings.map(b => b.trip_id))
  const rows: BookingCsvRow[] = bookings.map(({ id, trips, users, ...b }) => ({
    ...b,
    preferred_side: users?.preferred_side ?? null,
    trip_name:   trips?.name ?? '',
    room_status: roomStatuses.get(id)?.label ?? '',
  }))

  const date = new Date().toISOString().slice(0, 10)
  return new NextResponse(bookingsToCsv(rows), {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="fera-reservasjoner-${date}.csv"`,
      'Cache-Control':       'no-store',
    },
  })
}
