import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/shared/Nav'
import { CartProvider } from '@/lib/cart/context'
import { CurrencyProvider } from '@/lib/currency/context'
import { fetchEurNokRate } from '@/lib/currency'
import CartDrawer from '@/components/shop/CartDrawer'
import Footer from '@/components/shared/Footer'
import AccountSidebar from './_components/AccountSidebar'

export const metadata: Metadata = {
  title: {
    default: 'Min konto — Fera',
    template: '%s — Min konto | Fera',
  },
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/logg-inn?next=/account')

  const nokRate = await fetchEurNokRate()

  return (
    <CartProvider>
      <CurrencyProvider rate={nokRate}>
        <Nav />
        <CartDrawer />

        <main className="min-h-screen bg-(--color-bg)">
          <div className="max-w-[1200px] mx-auto px-4 py-10">

            {/* Mobile: stacked breadcrumb nav */}
            <div className="block md:hidden mb-6">
              <AccountSidebar />
            </div>

            <div className="flex gap-10">
              {/* Desktop sidebar */}
              <aside className="hidden md:block shrink-0 w-52">
                <AccountSidebar />
              </aside>

              {/* Page content */}
              <section className="flex-1 min-w-0">
                {children}
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </CurrencyProvider>
    </CartProvider>
  )
}
