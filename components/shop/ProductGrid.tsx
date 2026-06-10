'use client'

import { useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProductCard from './ProductCard'
import { CATEGORY_LABELS } from './categories'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

function ProductGridInner({ products }: { products: Product[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const brandFilter = searchParams.get('brand') ?? ''
  const categoryFilter = searchParams.get('category') ?? ''

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  )

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (!brandFilter || p.brand === brandFilter) &&
          (!categoryFilter || p.category === categoryFilter)
      ),
    [products, brandFilter, categoryFilter]
  )

  function setFilter(key: 'brand' | 'category', value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(params.size ? `/shop?${params}` : '/shop', { scroll: false })
  }

  return (
    <>
      <div className="bg-white border-b border-(--color-border) sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-wrap gap-2">
            <FilterPill active={!categoryFilter} onClick={() => setFilter('category', '')}>
              Alle
            </FilterPill>
            {categories.map((c) => (
              <FilterPill
                key={c}
                active={categoryFilter === c}
                onClick={() => setFilter('category', categoryFilter === c ? '' : c)}
              >
                {CATEGORY_LABELS[c] ?? c}
              </FilterPill>
            ))}
          </div>

          {brandFilter && (
            <button
              onClick={() => setFilter('brand', '')}
              className="text-(--color-cta) text-xs font-medium hover:underline underline-offset-4"
            >
              {brandFilter} ✕
            </button>
          )}

          <span className="ml-auto text-sm text-(--color-muted) tabular-nums">
            {filtered.length} produkter
          </span>
        </div>
      </div>

      <div className="bg-(--color-bg) min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-xl text-(--color-text) mb-3">
                Ingen produkter passer filteret
              </p>
              <button
                onClick={() => router.replace('/shop')}
                className="text-(--color-cta) text-sm font-medium underline underline-offset-4"
              >
                Nullstill filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-(--color-cta) ${
        active
          ? 'bg-(--color-dark) text-white border-(--color-dark)'
          : 'border-(--color-border) text-(--color-subtle) hover:border-(--color-dark) hover:text-(--color-text)'
      }`}
    >
      {children}
    </button>
  )
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProductGridInner products={products} />
    </Suspense>
  )
}
