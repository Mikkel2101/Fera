import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/shop/ProductGrid'

export const metadata = {
  title: 'Fera Shop — Padelutstyr fra Spania',
  description: 'Offisiell Padelpoint-partner. Racketer, sko, vesker og tilbehør levert til Norge.',
}

export default async function ShopPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .order('brand')

  const totalCount = products?.length ?? 0

  return (
    <>
      {/* Hero-banner */}
      <div className="bg-(--color-dark) text-white">
        <div className="max-w-[1600px] mx-auto px-4 py-12 sm:py-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-sm text-(--color-ice) font-medium mb-2 uppercase tracking-widest">
              Offisiell Padelpoint-partner
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              Padelutstyr fra Spania
            </h1>
            <p className="text-(--color-ice-light) text-base max-w-lg">
              {totalCount}+ produkter fra verdens ledende padel-merkevarer.
              Levert raskt til hele Norge med UPS.
            </p>
          </div>
          <div className="flex gap-6 shrink-0">
            <div className="text-center">
              <p className="font-display text-2xl font-bold">{totalCount}+</p>
              <p className="text-xs text-(--color-ice) mt-1">Produkter</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-bold">40+</p>
              <p className="text-xs text-(--color-ice) mt-1">Merkevarer</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-bold">3–5</p>
              <p className="text-xs text-(--color-ice) mt-1">Virkedager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brødsmule */}
      <div className="bg-white border-b border-(--color-border)">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <p className="text-(--color-muted) text-xs">
            <a href="/" className="hover:text-(--color-text) transition-colors">Hjem</a>
            <span className="mx-2">›</span>
            <span className="text-(--color-text)">Utstyr</span>
          </p>
        </div>
      </div>

      <ProductGrid products={products ?? []} />
    </>
  )
}
