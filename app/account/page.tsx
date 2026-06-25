import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Oversikt' }

const STATUS_LABEL: Record<string, string> = {
  pending_payment:       'Venter betaling',
  paid:                  'Betalt',
  ordered_at_supplier:   'Bestilt hos leverandør',
  shipped:               'Sendt',
  cancelled:             'Avlyst',
}

const BOOKING_LABEL: Record<string, string> = {
  Ventende: 'Venter betaling',
  Betalt:   'Depositum betalt',
  Refundert:'Refundert',
}

type BookingWithTrip = {
  id: string
  created_at: string
  deposit_status: string
  trips: { id: string; name: string; destination: string; start_date: string } | null
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: profile }, { data: recentOrders }, { data: rawBookings }] = await Promise.all([
    supabase.from('users').select('full_name, phone, padel_level').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('id, status, total_eur, created_at, items')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('bookings')
      .select('id, deposit_status, created_at, trips(id, name, destination, start_date)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const upcomingBookings = rawBookings as unknown as BookingWithTrip[] | null
  const displayName = profile?.full_name ?? user.email?.split('@')[0] ?? 'deg'

  return (
    <div className="space-y-8">
      {/* Velkomst */}
      <div>
        <h1 className="font-display text-3xl font-semibold text-(--color-text)">
          Hei, {displayName}
        </h1>
        <p className="mt-1 text-sm text-(--color-muted)">
          Her finner du ordre, reiser og kontoinformasjon.
        </p>
      </div>

      {/* Hurtiglenker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/account/orders',    label: 'Ordrer',   desc: 'Se handlehistorikk' },
          { href: '/account/trips',     label: 'Reiser',   desc: 'Dine padel-turer' },
          { href: '/account/profile',   label: 'Profil',   desc: 'Rediger kontoen din' },
          { href: '/account/addresses', label: 'Adresser', desc: 'Leveringsadresser' },
        ].map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-1 rounded-2xl border border-(--color-border) bg-white p-4 hover:border-(--color-dark) transition-colors"
          >
            <span className="text-sm font-semibold text-(--color-text)">{label}</span>
            <span className="text-xs text-(--color-muted)">{desc}</span>
          </Link>
        ))}
      </div>

      {/* Siste ordrer */}
      <section aria-labelledby="orders-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="orders-heading" className="font-display text-xl font-semibold text-(--color-text)">Siste ordrer</h2>
          <Link href="/account/orders" className="text-sm text-(--color-muted) hover:text-(--color-text) underline">
            Se alle
          </Link>
        </div>

        {!recentOrders?.length ? (
          <div className="rounded-2xl border border-(--color-border) p-6 text-center">
            <p className="text-sm text-(--color-muted)">Ingen ordrer ennå.</p>
            <Link href="/shop" className="mt-3 inline-block text-sm font-medium text-(--color-dark) underline">
              Gå til butikken
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-(--color-border) rounded-2xl border border-(--color-border) overflow-hidden">
            {recentOrders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : []
              const firstItem = items[0] as { name?: string } | undefined
              return (
                <div key={order.id} className="flex items-center justify-between px-4 py-3 bg-white">
                  <div>
                    <p className="text-sm font-medium text-(--color-text)">
                      {firstItem?.name ?? 'Ordre'}{items.length > 1 ? ` +${items.length - 1} til` : ''}
                    </p>
                    <p className="text-xs text-(--color-muted)">
                      {new Date(order.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-(--color-text)">
                      {order.total_eur ? `€${Number(order.total_eur).toFixed(2)}` : '—'}
                    </p>
                    <span className="text-xs text-(--color-muted)">
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Kommende reiser */}
      <section aria-labelledby="trips-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="trips-heading" className="font-display text-xl font-semibold text-(--color-text)">Mine reiser</h2>
          <Link href="/account/trips" className="text-sm text-(--color-muted) hover:text-(--color-text) underline">
            Se alle
          </Link>
        </div>

        {!upcomingBookings?.length ? (
          <div className="rounded-2xl border border-(--color-border) p-6 text-center">
            <p className="text-sm text-(--color-muted)">Ingen reiser ennå.</p>
            <Link href="/travels" className="mt-3 inline-block text-sm font-medium text-(--color-dark) underline">
              Se kommende turer
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-(--color-border) rounded-2xl border border-(--color-border) overflow-hidden">
            {upcomingBookings.map((booking) => {
              const trip = booking.trips
              return (
                <div key={booking.id} className="flex items-center justify-between px-4 py-3 bg-white">
                  <div>
                    <p className="text-sm font-medium text-(--color-text)">{trip?.name ?? 'Ukjent tur'}</p>
                    <p className="text-xs text-(--color-muted)">
                      {trip?.destination ?? ''}{trip?.start_date ? ` · ${new Date(trip.start_date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-(--color-ice-light) text-(--color-text)">
                    {BOOKING_LABEL[booking.deposit_status] ?? booking.deposit_status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
