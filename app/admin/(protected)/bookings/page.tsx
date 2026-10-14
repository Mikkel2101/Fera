import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BookingActions from '@/components/admin/BookingActions'
import { BOOKING_STATUSES, bookingStatusColor, isBookingStatus } from '@/lib/booking/status'
import { courtSideLabel, padelLevelLabel, tripGoalLabel } from '@/lib/booking/levels'
import { ROOM_SHARE_GENDERS, type RoomStatus } from '@/lib/booking/rooms'
import { fetchRoomStatuses } from '@/lib/booking/room-status-query'

const ROOM_LABELS: Record<string, string> = { Dobbel: 'Dobbel', Single: 'Enkel' }

const ROOM_STATUS_COLORS: Record<string, string> = {
  partners_matched: 'text-(--color-success)',
  partner_missing:  'text-(--color-dark-mid)',
  needs_roommate:   'text-(--color-dark-mid)',
  unknown:          'text-(--color-dark-mid)',
}

function RoomStatusLine({ status }: { status: RoomStatus | undefined }) {
  if (!status) return null
  return <p className={`text-xs font-medium mt-1 ${ROOM_STATUS_COLORS[status.key] ?? ''}`}>{status.label}</p>
}

type AdminBooking = {
  id:              string
  first_name:      string
  last_name:       string
  email:           string
  phone:           string | null
  padel_level:       string | null
  room_type:         string | null
  roommate_name:     string | null
  room_share_gender: string | null
  selected_extras:   string[]
  trip_goal:         string | null
  special_requests:  string | null
  allergies_preferences: string | null
  price_total_eur:   number | null
  status:            string
  created_at:        string
  trip_id:           string
  trips:             { name: string } | null
  users:             { preferred_side: string | null } | null
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
    .select('id, trip_id, first_name, last_name, email, phone, padel_level, room_type, roommate_name, room_share_gender, selected_extras, trip_goal, special_requests, allergies_preferences, price_total_eur, status, created_at, trips(name), users(preferred_side)')
    .order('created_at', { ascending: false })
  if (trip_id) query = query.eq('trip_id', trip_id)
  if (isBookingStatus(status)) query = query.eq('status', status)

  const [{ data }, { data: trips }] = await Promise.all([
    query,
    supabase.from('trips').select('id, name').order('start_date'),
  ])
  const bookings = data as unknown as AdminBooking[] | null
  const roomStatuses = await fetchRoomStatuses(supabase, bookings?.map(b => b.trip_id) ?? [])

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
                {['Kunde', 'Tur', 'Rom', 'Tillegg og pris', 'Status', 'Dato', ''].map(h => (
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
                    {b.padel_level && <p className="text-xs text-(--color-muted)">Nivå: {padelLevelLabel(b.padel_level)}</p>}
                    {b.users?.preferred_side && (
                      <p className="text-xs text-(--color-muted)">Banehalvdel: {courtSideLabel(b.users.preferred_side)}</p>
                    )}
                    {b.trip_goal && <p className="text-xs text-(--color-muted)">Mål: {tripGoalLabel(b.trip_goal)}</p>}
                    {b.allergies_preferences && (
                      <p className="text-xs font-medium text-(--color-dark-mid) mt-1 max-w-xs whitespace-pre-line">
                        Allergier/preferanser: «{b.allergies_preferences}»
                      </p>
                    )}
                    {b.special_requests && (
                      <p className="text-xs text-(--color-text) mt-1 max-w-xs whitespace-pre-line">«{b.special_requests}»</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-(--color-muted)">{b.trips?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-(--color-muted)">
                    {b.room_type ? ROOM_LABELS[b.room_type] ?? b.room_type : '—'}
                    {b.roommate_name && <p className="text-xs">med {b.roommate_name}</p>}
                    {b.room_share_gender && (
                      <p className="text-xs">{ROOM_SHARE_GENDERS.find(g => g.value === b.room_share_gender)?.label}</p>
                    )}
                    <RoomStatusLine status={roomStatuses.get(b.id)} />
                  </td>
                  <td className="px-4 py-3 text-xs text-(--color-muted)">
                    {b.selected_extras.length ? b.selected_extras.join(', ') : '—'}
                    {b.price_total_eur !== null && (
                      <p className="text-(--color-text) mt-1 whitespace-nowrap">Total: {b.price_total_eur} EUR</p>
                    )}
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
