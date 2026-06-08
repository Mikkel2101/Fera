import type { Metadata } from 'next'
import Nav from '@/components/travels/Nav'
import { CartProvider } from '@/lib/cart/context'

export const metadata: Metadata = {
  title: 'Fera Travels — Padel-reiser til Costa Blanca',
  description: 'Kurerte padel-reisepakker til Spania for norske padel-entusiaster.',
}

export default function TravelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Nav />
      <main>{children}</main>
    </CartProvider>
  )
}
