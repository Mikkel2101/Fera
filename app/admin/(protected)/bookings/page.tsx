import { createClient } from '@/lib/supabase/server'

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ trip_id?: string }>
}) {
  const { trip_id } = await searchParams
  const supabase = await createClient()

  const [{ data: bookings }, { data: trips }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, first_name, last_name, email, room_type, deposit_status, created_at, trip_id, trips(name)')
      .order('created_at', { ascending: false })
      .then(res => trip_id
        ? { ...res, data: res.data?.filter(b => b.trip_id === trip_id) ?? null }
        : res
      ),
    supabase.from('trips').select('id, name').order('start_date'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold text-(--color-text)">Bookinger</h1>
        <form method="GET" className="flex gap-2 items-center">
          <select
            name="trip_id"
            defaultValue={trip_id ?? ''}
            className="border border-(--color-border) rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-(--color-cta)"
          >
            <option value="">Alle turer</option>
            {trips?.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button type="submit" className="text-sm bg-(--color-sand) border border-(--color-border) rounded-lg px-3 py-1.5 hover:border-(--color-cta) transition-colors">
            Filtrer
          </button>
        </form>
      </div>

      {!bookings?.length ? (
        <p className="text-(--color-muted) text-sm">Ingen bookinger funnet.</p>
      ) : (
        <div className="bg-(--color-surface) border border-(--color-border) rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border) bg-(--color-sand)">
                {['Navn', 'E-post', 'Tur', 'Rom', 'Status', 'Dato'].map(h => (
                  <th key={h} className="text-left px-5 py-2 text-xs font-medium text-(--color-muted)">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const trip = (b.trips as unknown) as { name: string } | null
                return (
                  <tr key={b.id} className="border-b border-(--color-border) last:border-0 hover:bg-(--color-sand) transition-colors">
                    <td className="px-5 py-3 font-medium text-(--color-text)">{b.first_name} {b.last_name}</td>
                    <td className="px-5 py-3 text-(--color-muted)">{b.email}</td>
                    <td className="px-5 py-3 text-(--color-muted)">{trip?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-(--color-muted)">{b.room_type ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        b.deposit_status === 'Betalt'
                          ? 'bg-green-100 text-(--color-success)'
                          : 'bg-yellow-100 text-(--color-gold)'
                      }`}>
                        {b.deposit_status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-(--color-muted)">
                      {new Date(b.created_at).toLocaleDateString('nb-NO')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
