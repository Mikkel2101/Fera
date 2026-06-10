import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AddToCartButton from '@/components/shop/AddToCartButton'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products').select('name, description, images').eq('id', id).single()

  if (!product) return { title: 'Produkt ikke funnet' }
  return {
    title: product.name,
    description: product.description ?? `${product.name} — Fera Shop`,
    openGraph: {
      title: product.name,
      description: product.description ?? '',
      ...(product.images[0] ? { images: [{ url: product.images[0] }] } : {}),
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!product) notFound()

  const primaryImage = product.images[0] ?? null

  const stockLabel =
    product.stock_status === 'out_of_stock' ? 'Utsolgt'
    : product.stock_status === 'low_stock' ? 'Få igjen'
    : 'På lager'

  const stockClass =
    product.stock_status === 'out_of_stock' ? 'text-(--color-muted)'
    : product.stock_status === 'low_stock' ? 'text-amber-600'
    : 'text-(--color-success)'

  const stockDot =
    product.stock_status === 'out_of_stock' ? 'bg-(--color-muted)'
    : product.stock_status === 'low_stock' ? 'bg-amber-500'
    : 'bg-(--color-success)'

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-(--color-muted) mb-8">
          <Link href="/shop" className="hover:text-(--color-text) transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-(--color-subtle)">{product.brand}</span>
          <span>/</span>
          <span className="text-(--color-text) line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-(--color-ice-light) rounded-2xl overflow-hidden">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-8 transition-transform duration-700 hover:scale-105"
                  priority
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <span className="text-8xl opacity-20">🏓</span>
                  <p className="text-(--color-muted) text-sm">Bilde kommer snart</p>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img, i) => (
                  <div key={i} className="relative aspect-square bg-(--color-ice-light) rounded-lg overflow-hidden border-2 border-(--color-border)">
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="100px" className="object-contain p-2" unoptimized />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-widest text-(--color-muted) font-medium mb-2">
              {product.brand}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-(--color-text) leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-(--color-gold) font-bold text-3xl">
                € {product.price_eur.toLocaleString('nb-NO', { minimumFractionDigits: 0 })}
              </span>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2 h-2 rounded-full ${stockDot}`} />
              <span className={`text-sm font-medium ${stockClass}`}>{stockLabel}</span>
            </div>

            {product.description && (
              <p className="text-(--color-muted) text-base leading-relaxed mb-8 border-t border-(--color-border) pt-6">
                {product.description}
              </p>
            )}

            <AddToCartButton product={product} />

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-(--color-border) pt-6">
              {[
                { icon: '🚚', label: 'Frakt til Norge', sub: '3–5 virkedager' },
                { icon: '🔒', label: 'Trygg betaling', sub: 'Via Stripe' },
                { icon: '🏓', label: 'Padelpoint', sub: 'Offisiell partner' },
              ].map((badge) => (
                <div key={badge.label} className="text-center p-3 bg-(--color-ice-light) rounded-xl">
                  <span className="text-xl block mb-1">{badge.icon}</span>
                  <p className="text-xs font-medium text-(--color-text) leading-snug">{badge.label}</p>
                  <p className="text-[10px] text-(--color-muted)">{badge.sub}</p>
                </div>
              ))}
            </div>

            {/* Padelpoint link */}
            {product.padelpoint_url && (
              <p className="text-xs text-(--color-muted) mt-4">
                Produktet selges via{' '}
                <a
                  href={product.padelpoint_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--color-cta) hover:underline"
                >
                  Padelpoint
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="border-t border-(--color-border) bg-(--color-ice-light) py-12 px-4 sm:px-6 lg:px-8 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-1">Planlegger du padel-reise?</p>
            <p className="font-display font-bold text-(--color-text) text-xl">Bruk utstyret i Spania. Med Fera.</p>
          </div>
          <Link
            href="/travels"
            className="bg-(--color-cta) text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Se kommende reiser →
          </Link>
        </div>
      </div>
    </div>
  )
}
