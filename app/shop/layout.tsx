import type { Metadata } from 'next'
import Nav from '@/components/shared/Nav'
import { CartProvider } from '@/lib/cart/context'
import CartDrawer from '@/components/shop/CartDrawer'

export const metadata: Metadata = {
  title: 'Fera Shop',
  description: 'Padelutstyr fra Spania',
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Nav />
      <CartDrawer />
      <main>{children}</main>
    </CartProvider>
  )
}
