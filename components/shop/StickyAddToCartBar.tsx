'use client'

import { useCart } from '@/lib/cart/context'
import { useNokRate } from '@/lib/currency/context'
import { eurToNok, formatNok } from '@/lib/currency'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

export default function StickyAddToCartBar({ product }: { product: Product }) {
  const { addItem } = useCart()
  const nokRate     = useNokRate()
  const isOutOfStock = product.stock_status === 'out_of_stock'

  function handleAdd() {
    if (isOutOfStock) return
    addItem({
      product_id:     product.id,
      name:           product.name,
      brand:          product.brand,
      price_eur:      product.price_eur,
      image:          product.images[0] ?? '',
      padelpoint_url: product.padelpoint_url ?? undefined,
    })
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-(--color-border) px-4 py-3 flex items-center gap-3 shadow-lg">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-(--color-muted) truncate">{product.brand}</p>
        <p className="text-sm font-semibold text-(--color-gold)">
          {formatNok(eurToNok(product.price_eur, nokRate))}
        </p>
      </div>
      <button
        onClick={handleAdd}
        disabled={isOutOfStock}
        className="bg-(--color-cta) text-white font-semibold px-6 py-3 rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        {isOutOfStock ? 'Utsolgt' : 'Legg i kurv'}
      </button>
    </div>
  )
}
