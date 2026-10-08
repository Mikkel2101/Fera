import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchEurNokRate, eurToNok, formatNok } from '@/lib/currency'
import type { CartItem } from '@/lib/cart/types'

export const metadata: Metadata = { title: 'Ordrer' }

const STATUS_LABEL: Record<string, string> = {
  pending_payment:     'Venter betaling',
  paid:                'Betalt',
  ordered_at_supplier: 'Bestilt hos leverandør',
  shipped:             'Sendt',
  cancelled:           'Avlyst',
}

const STATUS_COLOR: Record<string, string> = {
  pending_payment:     'bg-(--color-sand) text-(--color-text)',
  paid:                'bg-(--color-ice-light) text-(--color-text)',
  ordered_at_supplier: 'bg-(--color-ice) text-(--color-text)',
  shipped:             'bg-emerald-100 text-emerald-800',
  cancelled:           'bg-red-100 text-red-700',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const nokRate = await fetchEurNokRate()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total_eur, total_nok, nok_rate, created_at, items, shipping_address, first_name, last_name')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold text-(--color-text)">Ordrehistorikk</h1>

      {!orders?.length ? (
        <div className="rounded-2xl border border-(--color-border) p-12 text-center">
          <p className="text-(--color-muted) mb-4">Du har ikke lagt inn noen ordrer ennå.</p>
          <Link
            href="/shop"
            className="inline-block bg-(--color-cta) text-white font-semibold text-sm rounded-full px-6 py-3 hover:bg-(--color-dark-mid) transition-colors"
          >
            Gå til butikken
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = (Array.isArray(order.items) ? order.items : []) as CartItem[]
            const address = order.shipping_address as { city?: string; country?: string } | null
            // Bruk lagret NOK-snapshot fra kjøpstidspunktet (faktisk belastet
            // beløp) fremfor å regne om total_eur med dagens kurs — unngår
            // avvik fra det kunden faktisk betalte. Eldre ordre uten snapshot
            // (fra før migrasjon 020) faller tilbake til dagens kurs.
            const itemNokRate = order.nok_rate ? Number(order.nok_rate) : nokRate
            const totalDisplay = order.total_nok != null
              ? formatNok(Number(order.total_nok))
              : order.total_eur
                ? formatNok(eurToNok(Number(order.total_eur), nokRate))
                : '—'

            return (
              <div key={order.id} className="rounded-2xl border border-(--color-border) bg-white overflow-hidden">
                {/* Ordre-header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-(--color-sand-light) border-b border-(--color-border)">
                  <div>
                    <p className="text-xs text-(--color-muted) uppercase tracking-wider font-medium">
                      Ordredato
                    </p>
                    <p className="text-sm font-semibold text-(--color-text)">
                      {new Date(order.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-(--color-muted) uppercase tracking-wider font-medium">Total</p>
                    <p className="text-sm font-semibold text-(--color-text)">{totalDisplay}</p>
                  </div>
                  {address?.city && (
                    <div>
                      <p className="text-xs text-(--color-muted) uppercase tracking-wider font-medium">Leveringssted</p>
                      <p className="text-sm font-semibold text-(--color-text)">{address.city}</p>
                    </div>
                  )}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>

                {/* Produkter */}
                <ul className="divide-y divide-(--color-border)">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 px-5 py-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-contain rounded-lg bg-(--color-sand-light) shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-(--color-text) truncate">{item.name}</p>
                        <p className="text-xs text-(--color-muted)">{item.brand} · Antall: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-(--color-text) shrink-0">
                        {item.price_eur != null ? formatNok(eurToNok(item.price_eur * item.quantity, itemNokRate)) : '—'}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
