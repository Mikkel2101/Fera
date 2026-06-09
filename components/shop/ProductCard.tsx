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
      className="group flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-white overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl">🏓</div>
        )}
        <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        <p className="text-[10px] text-(--color-muted) uppercase tracking-widest font-medium mb-0.5">
          {product.brand}
        </p>
        <p className="text-(--color-text) text-sm leading-snug line-clamp-2 mb-2">
          {product.name}
        </p>
        <span className="text-(--color-gold) font-bold text-base">
          € {product.price_eur.toLocaleString('nb-NO', { minimumFractionDigits: 0 })}
        </span>
      </div>
    </Link>
  )
}
