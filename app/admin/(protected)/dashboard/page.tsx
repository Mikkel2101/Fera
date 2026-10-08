import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { bookingStatusColor } from '@/lib/booking/status'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: activeTrips   },
    { count: reserved      },
    { count: confirmed     },
    { data:  recentBookings },
    { data:  openTrips      },
  ] = await Promise.all([
    supabase.from('trips').select('*', { count: 'exact', head: true })
      .in('status', ['Åpen', 'Få plasser']).eq('published', true),
    supabase.from('bookings').select('*', { count: 'exact', head: true })
      .eq('status', 'Reservert'),
    supabase.from('bookings').select('*', { count: 'exact', head: true })
      .eq('status', 'Bekreftet'),
    supabase.from('bookings')
      .select('id, first_name, last_name, status, created_at, trips(name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('trips')
      .select('registered_count, max_participants')
      .eq('published', true)
      .in('status', ['Åpen', 'Få plasser']),
  ])

  const freeSpots = (openTrips ?? []).reduce(
    (sum, t) => sum + (t.max_participants != null ? Math.max(t.max_participants - t.registered_count, 0) : 0),
    0,
  )

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-(--color-text) mb-6">Dashboard</h1>

      {/* Statskort */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Aktive turer"     value={activeTrips  ?? 0} color="text-(--color-cta)" />
        <StatCard label="Nye reservasjoner" value={reserved  ?? 0} color="text-(--color-text)" />
        <StatCard label="Bekreftet"         value={confirmed ?? 0} color="text-(--color-success)" />
        <StatCard label="Ledige plasser"    value={freeSpots}      color="text-(--color-gold)" />
      </div>

      {/* Siste reservasjoner */}
      <div className="bg-(--color-surface) border border-(--color-border) rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-(--color-border) flex justify-between items-center">
          <h2 className="text-sm font-semibold text-(--color-text)">Siste reservasjoner</h2>
          <Link href="/admin/bookings" className="text-xs text-(--color-cta) hover:underline">Se alle</Link>
        </div>
        {!recentBookings?.length ? (
          <p className="text-(--color-muted) text-sm p-5">Ingen reservasjoner ennå.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border) bg-(--color-sand)">
                <th className="text-left px-5 py-2 text-xs font-medium text-(--color-muted)">Navn</th>
                <th className="text-left px-5 py-2 text-xs font-medium text-(--color-muted)">Tur</th>
                <th className="text-left px-5 py-2 text-xs font-medium text-(--color-muted)">Status</th>
                <th className="text-left px-5 py-2 text-xs font-medium text-(--color-muted)">Dato</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(b => {
                const trip = b.trips as unknown as { name: string } | null
                return (
                  <tr key={b.id} className="border-b border-(--color-border) last:border-0">
                    <td className="px-5 py-3 text-(--color-text)">{b.first_name} {b.last_name}</td>
                    <td className="px-5 py-3 text-(--color-muted)">{trip?.name ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${bookingStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-(--color-muted) text-xs">
                      {new Date(b.created_at).toLocaleDateString('nb-NO')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-(--color-surface) border border-(--color-border) rounded-xl p-5">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-(--color-muted) mt-1">{label}</div>
    </div>
  )
}
