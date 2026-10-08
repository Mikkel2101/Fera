import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BookingActions from '@/components/admin/BookingActions'
import { BOOKING_STATUSES, bookingStatusColor, isBookingStatus } from '@/lib/booking/status'

const ROOM_LABELS: Record<string, string> = { Dobbel: 'Dobbel', Single: 'Enkel' }

type AdminBooking = {
  id:              string
  first_name:      string
  last_name:       string
  email:           string
  phone:           string | null
  padel_level:     string | null
  room_type:       string | null
  roommate_name:   string | null
  selected_extras: string[]
  status:          string
  created_at:      string
  trips:           { name: string } | null
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ trip_id?: string; status?: string }>
}) {
  const { trip_id, status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('bookings')
    .select('id, first_name, last_name, email, phone, padel_level, room_type, roommate_name, selected_extras, status, created_at, trips(name)')
    .order('created_at', { ascending: false })
  if (trip_id) query = query.eq('trip_id', trip_id)
  if (isBookingStatus(status)) query = query.eq('status', status)

  const [{ data }, { data: trips }] = await Promise.all([
    query,
    supabase.from('trips').select('id, name').order('start_date'),
  ])
  const bookings = data as unknown as AdminBooking[] | null

  const exportParams = new URLSearchParams()
  if (trip_id) exportParams.set('trip_id', trip_id)
  if (isBookingStatus(status)) exportParams.set('status', status)

  const selectClass = 'border border-(--color-border) rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-(--color-cta)'

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-display font-semibold text-(--color-text)">Reservasjoner</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <form method="GET" className="flex flex-wrap gap-2 items-center">
            <select name="trip_id" defaultValue={trip_id ?? ''} className={selectClass} aria-label="Tur">
              <option value="">Alle turer</option>
              {trips?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select name="status" defaultValue={status ?? ''} className={selectClass} aria-label="Status">
              <option value="">Alle statuser</option>
              {BOOKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="submit" className="text-sm bg-(--color-sand) border border-(--color-border) rounded-lg px-3 py-1.5 hover:border-(--color-cta) transition-colors">
              Filtrer
            </button>
          </form>
          <Link
            href={`/admin/bookings/export?${exportParams}`}
            prefetch={false}
            className="text-sm bg-(--color-cta) text-white rounded-lg px-3 py-1.5 hover:bg-(--color-dark-mid) transition-colors"
          >
            Last ned CSV
          </Link>
        </div>
      </div>

      {!bookings?.length ? (
        <p className="text-(--color-muted) text-sm">Ingen reservasjoner funnet.</p>
      ) : (
        <div className="bg-(--color-surface) border border-(--color-border) rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border) bg-(--color-sand)">
                {['Kunde', 'Tur', 'Rom', 'Tilvalg', 'Status', 'Dato', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-medium text-(--color-muted) whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-b border-(--color-border) last:border-0 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-(--color-text)">{b.first_name} {b.last_name}</p>
                    <p className="text-xs text-(--color-muted)">{b.email}</p>
                    {b.phone && <p className="text-xs text-(--color-muted)">{b.phone}</p>}
                    {b.padel_level && <p className="text-xs text-(--color-muted)">Nivå: {b.padel_level}</p>}
                  </td>
                  <td className="px-4 py-3 text-(--color-muted)">{b.trips?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-(--color-muted)">
                    {b.room_type ? ROOM_LABELS[b.room_type] ?? b.room_type : '—'}
                    {b.roommate_name && <p className="text-xs">med {b.roommate_name}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-(--color-muted)">
                    {b.selected_extras.length ? b.selected_extras.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${bookingStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-(--color-muted) whitespace-nowrap">
                    {new Date(b.created_at).toLocaleDateString('nb-NO')}
                  </td>
                  <td className="px-4 py-3">
                    <BookingActions bookingId={b.id} status={b.status} name={`${b.first_name} ${b.last_name}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
