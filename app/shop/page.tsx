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

  return (
    <>
      {/* Page header */}
      <div className="border-b border-(--color-border) bg-white">
        <div className="max-w-[1600px] mx-auto px-4 py-8">
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
