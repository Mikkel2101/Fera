'use client'
import { CartProvider } from '@/lib/cart/context'

export default function HomeCartProvider({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}
