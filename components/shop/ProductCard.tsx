'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { Database } from '@/lib/supabase/types'
import { useCart } from '@/lib/cart/context'
import { useNokRate } from '@/lib/currency/context'
import { eurToNok, formatNok } from '@/lib/currency'

type Product = Database['public']['Tables']['products']['Row']

const NEW_DAYS = 30

function stockBadge(status: string) {
  if (status === 'out_of_stock') return { label: 'Utsolgt', className: 'bg-(--color-border) text-(--color-muted)' }
  if (status === 'low_stock')    return { label: 'Få igjen', className: 'bg-(--color-cta) text-white' }
  return null
}

function ImagePlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="text-(--color-border)">
        <ellipse cx="28" cy="22" rx="16" ry="16" stroke="currentColor" strokeWidth="2"/>
        <line x1="28" y1="38" x2="28" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="22" x2="44" y2="22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5"/>
        <line x1="28" y1="6" x2="28" y2="38" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5"/>
      </svg>
    </div>
  )
}

export default function ProductCard({ product }: { product: Product }) {
  const badge          = stockBadge(product.stock_status)
  const primaryImage   = product.images[0] ?? null
  const secondaryImage = product.images[1] ?? null
  const [imgError,  setImgError]  = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { addItem }  = useCart()
  const nokRate      = useNokRate()
  const isOutOfStock = product.stock_status === 'out_of_stock'

  const isNew  = new Date(product.created_at) > new Date(Date.now() - NEW_DAYS * 86_400_000)
  const nokPrice = formatNok(eurToNok(product.price_eur, nokRate))
  const showSecondary = isHovered && !!secondaryImage && !imgError

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    addItem({
      product_id:     product.id,
      name:           product.name,
      brand:          product.brand,
      price_eur:      product.price_eur,
      image:          product.images[0] ?? '',
      padelpoint_url: product.padelpoint_url ?? undefined,
    })
  }

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {primaryImage && !imgError ? (
          <>
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-contain p-4 transition-all duration-500 ease-out absolute inset-0 ${
                isOutOfStock
                  ? 'opacity-40 grayscale'
                  : showSecondary
                  ? 'opacity-0'
                  : 'opacity-100 group-hover:scale-105'
              }`}
              unoptimized
              onError={() => setImgError(true)}
            />
            {secondaryImage && (
              <Image
                src={secondaryImage}
                alt={`${product.name} — alternativt bilde`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-contain p-4 transition-opacity duration-300 absolute inset-0 ${
                  showSecondary ? 'opacity-100' : 'opacity-0'
                }`}
                unoptimized
              />
            )}
          </>
        ) : (
          <ImagePlaceholder />
        )}

        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {isNew && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-(--color-ice) text-(--color-text)">
              Ny
            </span>
          )}
          {badge && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </div>

        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 p-3 lg:translate-y-full lg:group-hover:translate-y-0 lg:group-focus-within:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-(--color-cta) text-white text-xs font-semibold py-2.5 rounded-full hover:bg-(--color-dark-mid) transition-colors"
            >
              Legg i kurv
            </button>
          </div>
        )}
      </div>

      <div className="pt-3 pb-1">
        <p className="text-[10px] text-(--color-muted) uppercase tracking-widest font-medium mb-0.5">
          {product.brand}
        </p>
        <p className="text-(--color-text) text-sm leading-snug line-clamp-2 mb-2">
          {product.name}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-(--color-gold) font-bold text-base tabular-nums">
            {nokPrice}
          </span>
        </div>
      </div>
    </Link>
  )
}
