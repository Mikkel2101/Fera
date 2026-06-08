'use client'

import { useCart } from '@/lib/cart/context'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()

  const isOutOfStock = product.stock_status === 'out_of_stock'

  function handleAdd() {
    addItem({
      product_id: product.id,
      name: product.name,
      brand: product.brand,
      price_eur: product.price_eur,
      image: product.images[0] ?? '',
    })
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isOutOfStock}
      className="w-full bg-(--color-cta) text-white font-semibold py-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed text-lg"
    >
      {isOutOfStock ? 'Utsolgt' : 'Legg i kurv'}
    </button>
  )
}
