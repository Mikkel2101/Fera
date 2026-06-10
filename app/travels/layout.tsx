import type { Metadata } from 'next'
import Nav from '@/components/travels/Nav'
import { CartProvider } from '@/lib/cart/context'
import CartDrawer from '@/components/shop/CartDrawer'
import Footer from '@/components/shared/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Fera Travels — Padel-reiser til Costa Blanca',
    template: '%s — Fera Travels',
  },
  description: 'Kurerte padel-reisepakker til Spania for norske padel-entusiaster. Hotell, coaching og opplevelser inkludert.',
  openGraph: {
    siteName: 'Fera Travels',
    locale: 'nb_NO',
    type: 'website',
  },
}

export default function TravelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Nav />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  )
}
