import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/shop/ProductGrid'
import { CATEGORY_LABELS } from '@/components/shop/categories'

export const metadata = {
  title: 'Fera Shop — Padelutstyr fra Spania',
  description: 'Offisiell Padelpoint-partner. Racketer, sko, vesker og tilbehør levert til Norge.',
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string }>
}) {
  const { category, brand } = await searchParams

  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .order('brand')

  const brands = [...new Set((products ?? []).map((p) => p.brand))].sort()

  return (
    <>
      {/* Hero */}
      <section className="relative bg-(--color-dark) overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://dbvnuoayzevtoaolhqxd.supabase.co/storage/v1/object/public/photos/two-women-action.jpg"
            alt="To spillere i aksjon på padelbane"
            fill
            sizes="100vw"
            className="object-cover opacity-30"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-(--color-dark) via-(--color-dark)/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <p className="text-(--color-sand) text-xs uppercase tracking-widest font-medium mb-4 opacity-80">
            Padelutstyr &amp; tilbehør
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Utstyr fra <em className="italic text-(--color-sand)">Spania</em>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mb-8">
            Offisiell Padelpoint-partner — racketer, sko, vesker og tilbehør levert raskt til Norge.
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => {
              const isActive = category === value
              return (
                <Link
                  key={value}
                  href={isActive ? '/shop' : `/shop?category=${value}`}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    isActive
                      ? 'bg-white text-(--color-dark) border-white'
                      : 'border-white/20 text-white/70 hover:border-white/60 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Brand bar */}
      <div className="border-b border-(--color-border) bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-center text-(--color-muted) text-xs uppercase tracking-widest mb-4">
            Vi fører merker som
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {brands.map((b) => {
              const isActive = brand === b
              return (
                <Link
                  key={b}
                  href={isActive ? '/shop' : `/shop?brand=${b}`}
                  className={`font-display font-bold text-base md:text-lg transition-all ${
                    isActive
                      ? 'text-(--color-cta) opacity-100 underline underline-offset-4'
                      : 'text-(--color-dark) opacity-60 hover:opacity-100'
                  }`}
                >
                  {b}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <ProductGrid products={products ?? []} />
    </>
  )
}
