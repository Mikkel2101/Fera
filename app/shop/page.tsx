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
      {/* Hero */}
      <section className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-(--color-gold) font-medium mb-3">
            PADELUTSTYR & TILBEHØR
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-(--color-text) mb-3">
            Padelutstyr fra <em className="text-(--color-gold) not-italic">Spania</em>
          </h1>
          <p className="text-(--color-muted) text-lg max-w-xl">
            Offisiell Padelpoint-partner — rask levering til Norge
          </p>
        </div>
      </section>

      <ProductGrid products={products ?? []} />
    </>
  )
}
