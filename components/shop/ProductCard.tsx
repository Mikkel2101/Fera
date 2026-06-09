import Link from 'next/link'
import Image from 'next/image'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

function stockBadge(status: string) {
  if (status === 'out_of_stock') return { label: 'Utsolgt', className: 'bg-(--color-border) text-(--color-muted)' }
  if (status === 'low_stock') return { label: 'Få igjen', className: 'bg-(--color-cta) text-white' }
  return { label: 'På lager', className: 'bg-(--color-success) text-white' }
}

export default function ProductCard({ product }: { product: Product }) {
  const badge = stockBadge(product.stock_status)
  const primaryImage = product.images[0] ?? null

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group bg-(--color-surface) border border-(--color-border) rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square bg-(--color-sand)">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl">🏓</div>
        )}
        {/* Stock badge */}
        <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-(--color-muted) uppercase tracking-wide font-medium mb-1">
          {product.brand}
        </p>
        <p className="text-(--color-text) font-medium text-sm leading-snug line-clamp-2 flex-1">
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-(--color-gold) font-bold text-lg">
            € {product.price_eur.toLocaleString('nb-NO', { minimumFractionDigits: 0 })}
          </span>
          <span className="text-(--color-cta) text-sm font-medium group-hover:underline">
            Se detaljer →
          </span>
        </div>
      </div>
    </Link>
  )
}
