import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AddToCartButton from '@/components/shop/AddToCartButton'

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
    : product.stock_status === 'low_stock' ? 'text-(--color-cta)'
    : 'text-(--color-success)'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-1 text-sm text-(--color-subtle) hover:text-(--color-text) transition-colors mb-8"
      >
        ← Tilbake til butikken
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative aspect-square bg-(--color-sand) rounded-2xl overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-8"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-8xl">🏓</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-sm uppercase tracking-widest text-(--color-muted) font-medium mb-2">
            {product.brand}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-(--color-text) leading-tight mb-4">
            {product.name}
          </h1>
          <p className="text-(--color-gold) font-bold text-3xl mb-3">
            € {product.price_eur.toLocaleString('nb-NO', { minimumFractionDigits: 0 })}
          </p>
          <p className={`text-sm font-medium ${stockClass} mb-6`}>
            ● {stockLabel}
          </p>

          {product.description && (
            <p className="text-(--color-muted) text-base leading-relaxed mb-8">
              {product.description}
            </p>
          )}

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}
