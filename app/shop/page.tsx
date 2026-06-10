import Image from 'next/image'
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
      <section className="relative bg-(--color-dark) overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1600&q=80"
            alt="Padelutstyr"
            fill
            sizes="100vw"
            className="object-cover opacity-20"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-(--color-dark) via-(--color-dark)/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <p className="text-(--color-sand) text-xs uppercase tracking-widest font-medium mb-4 opacity-80">
            PADELUTSTYR & TILBEHØR
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Utstyr fra <em className="italic text-(--color-sand)">Spania</em>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mb-8">
            Offisiell Padelpoint-partner — racketer, sko, vesker og tilbehør levert raskt til Norge.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Racketer', 'Sko', 'Vesker', 'Baller', 'Tilbehør'].map((cat) => (
              <span key={cat} className="border border-white/20 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      <ProductGrid products={products ?? []} />
    </>
  )
}
