'use client'

import { useMemo, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProductCard from './ProductCard'
import { CATEGORY_LABELS } from './categories'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

type SortKey = 'default' | 'price_asc' | 'price_desc' | 'newest' | 'sale'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default',    label: 'Anbefalt' },
  { value: 'price_asc',  label: 'Pris: lav → høy' },
  { value: 'price_desc', label: 'Pris: høy → lav' },
  { value: 'newest',     label: 'Nyeste' },
  { value: 'sale',       label: 'Salg' },
]

function ProductGridInner({ products }: { products: Product[] }) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const brandFilter    = searchParams.get('brand')    ?? ''
  const categoryFilter = searchParams.get('category') ?? ''

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [sort,  setSort]  = useState<SortKey>((searchParams.get('sort') as SortKey) ?? 'default')

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  )

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) =>
        (!brandFilter    || p.brand    === brandFilter) &&
        (!categoryFilter || p.category === categoryFilter)
    )

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      )
    }

    switch (sort) {
      case 'price_asc':  return [...list].sort((a, b) => a.price_eur - b.price_eur)
      case 'price_desc': return [...list].sort((a, b) => b.price_eur - a.price_eur)
      case 'newest':     return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'sale':       return [...list].sort((a, b) => (b.is_on_sale ? 1 : 0) - (a.is_on_sale ? 1 : 0))
      default:           return list
    }
  }, [products, brandFilter, categoryFilter, query, sort])

  function setFilter(key: 'brand' | 'category', value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(params.size ? `/shop?${params}` : '/shop', { scroll: false })
  }

  return (
    <>
      {/* Filter + søk-bar */}
      <div className="bg-white border-b border-(--color-border) sticky top-14 z-30">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          {/* Søkefelt */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Søk produkt eller merke…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-(--color-border) rounded-full focus:outline-none focus:border-(--color-cta) bg-white"
            />
          </div>

          {/* Kategoripills */}
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

          {/* Sortering */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-(--color-muted) tabular-nums hidden sm:block">
              {filtered.length} produkter
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="text-xs border border-(--color-border) rounded-full px-3 py-1.5 focus:outline-none focus:border-(--color-cta) bg-white text-(--color-text) cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-(--color-bg) min-h-screen">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-xl text-(--color-text) mb-3">
                {query ? `Ingen resultater for «${query}»` : 'Ingen produkter passer filteret'}
              </p>
              <button
                onClick={() => {
                  setQuery('')
                  router.replace('/shop')
                }}
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
