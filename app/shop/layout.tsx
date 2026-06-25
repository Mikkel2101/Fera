import type { Metadata } from 'next'
import Nav from '@/components/shared/Nav'
import { CartProvider } from '@/lib/cart/context'
import { CurrencyProvider } from '@/lib/currency/context'
import { fetchEurNokRate } from '@/lib/currency'
import CartDrawer from '@/components/shop/CartDrawer'
import Footer from '@/components/shared/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Fera Shop — Padelutstyr fra Padelpoint',
    template: '%s — Fera Shop',
  },
  description: 'Offisiell Padelpoint-partner. Racketer, sko, vesker og tilbehør levert raskt til Norge.',
  openGraph: {
    siteName: 'Fera Shop',
    locale:   'nb_NO',
    type:     'website',
  },
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const nokRate = await fetchEurNokRate()
  return (
    <CartProvider>
      <CurrencyProvider rate={nokRate}>
        <Nav />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
      </CurrencyProvider>
    </CartProvider>
  )
}
