import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { bookingsToCsv, type BookingCsvRow } from '@/lib/booking/csv'
import { isBookingStatus } from '@/lib/booking/status'

type ExportBooking = Omit<BookingCsvRow, 'trip_name'> & { trips: { name: string } | null }

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
    .select('created_at, status, first_name, last_name, email, phone, padel_level, room_type, roommate_name, selected_extras, trips(name)')
    .order('created_at', { ascending: true })
  if (tripId) query = query.eq('trip_id', tripId)
  if (isBookingStatus(status)) query = query.eq('status', status)

  const { data, error } = await query
  if (error) {
    console.error('booking export failed:', error)
    return NextResponse.json({ error: 'Eksport feilet' }, { status: 500 })
  }

  const rows: BookingCsvRow[] = (data as unknown as ExportBooking[]).map(({ trips, ...b }) => ({
    ...b,
    trip_name: trips?.name ?? '',
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
