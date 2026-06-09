'use client'

import { useState, useMemo } from 'react'
import ProductCard from './ProductCard'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

export default function ProductGrid({ products }: { products: Product[] }) {
  const [brandFilter, setBrandFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const brands = useMemo(() =>
    [...new Set(products.map(p => p.brand))].sort(), [products])

  const categories = useMemo(() =>
    [...new Set(products.map(p => p.category))].sort(), [products])

  const filtered = useMemo(() =>
    products.filter(p =>
      (!brandFilter || p.brand === brandFilter) &&
      (!categoryFilter || p.category === categoryFilter)
    ), [products, brandFilter, categoryFilter])

  const categoryLabels: Record<string, string> = {
    racket: 'Racketer', shoes: 'Sko', bag: 'Vesker',
    balls: 'Baller', clothing: 'Klær', accessories: 'Tilbehør',
  }

  return (
    <>
      {/* Filter bar */}
      <div className="bg-white border-b border-(--color-border) sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-3 items-center">
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="border border-(--color-border) rounded-full px-4 py-1.5 text-sm text-(--color-subtle) bg-white focus:outline-none focus:border-(--color-gold)"
          >
            <option value="">Alle merker</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border border-(--color-border) rounded-full px-4 py-1.5 text-sm text-(--color-subtle) bg-white focus:outline-none focus:border-(--color-gold)"
          >
            <option value="">Alle kategorier</option>
            {categories.map(c => (
              <option key={c} value={c}>{categoryLabels[c] ?? c}</option>
            ))}
          </select>
          {(brandFilter || categoryFilter) && (
            <button
              onClick={() => { setBrandFilter(''); setCategoryFilter('') }}
              className="text-(--color-cta) text-sm hover:underline"
            >
              Nullstill filter
            </button>
          )}
          <span className="ml-auto text-sm text-(--color-muted)">
            {filtered.length} produkter
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-(--color-bg) min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-(--color-muted)">
              Ingen produkter passer filteret
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-(--color-border)">
              {filtered.map(p => (
                <div key={p.id} className="bg-white p-4">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
