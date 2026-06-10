'use client'

import { useEffect } from 'react'
import { useCart } from '@/lib/cart/context'

export default function ClearCartEffect() {
  const { clearCart } = useCart()
  useEffect(() => { clearCart() }, [clearCart])
  return null
}
