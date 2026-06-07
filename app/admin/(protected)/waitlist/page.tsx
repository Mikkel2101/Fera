import { createClient } from '@/lib/supabase/server'

export default async function AdminWaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ trip_id?: string }>
}) {
  const { trip_id } = await searchParams
  const supabase = await createClient()

  const [{ data: entries }, { data: trips }] = await Promise.all([
    supabase
      .from('waitlist')
      .select('id, email, joined_at, trip_id, trips(name)')
      .order('joined_at', { ascending: false })
      .then(res => trip_id
        ? { ...res, data: res.data?.filter(w => w.trip_id === trip_id) ?? null }
        : res
      ),
    supabase.from('trips').select('id, name').order('start_date'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold text-(--color-text)">Venteliste</h1>
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

      {!entries?.length ? (
        <p className="text-(--color-muted) text-sm">Ingen på venteliste.</p>
      ) : (
        <div className="bg-(--color-surface) border border-(--color-border) rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border) bg-(--color-sand)">
                {['E-post', 'Tur', 'Lagt til'].map(h => (
                  <th key={h} className="text-left px-5 py-2 text-xs font-medium text-(--color-muted)">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(w => {
                const trip = (w.trips as unknown) as { name: string } | null
                return (
                  <tr key={w.id} className="border-b border-(--color-border) last:border-0 hover:bg-(--color-sand) transition-colors">
                    <td className="px-5 py-3 text-(--color-text)">{w.email}</td>
                    <td className="px-5 py-3 text-(--color-muted)">{trip?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-xs text-(--color-muted)">
                      {new Date(w.joined_at).toLocaleDateString('nb-NO')}
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
