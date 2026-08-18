'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart/context'
import { useNokRate } from '@/lib/currency/context'
import { eurToNok, formatNok } from '@/lib/currency'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalEur } = useCart()
  const nokRate = useNokRate()

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeCart])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Handlekurv"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-border)">
          <h2 className="font-semibold text-(--color-text)">
            Handlekurv {items.length > 0 && <span className="text-(--color-muted) font-normal">({items.length})</span>}
          </h2>
          <button
            onClick={closeCart}
            className="text-(--color-muted) hover:text-(--color-text) transition-colors"
            aria-label="Lukk handlekurv"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <span className="text-4xl">🛒</span>
              <p className="text-(--color-muted)">Handlekurven er tom</p>
              <button
                onClick={closeCart}
                className="text-(--color-cta) text-sm font-medium hover:underline"
              >
                Fortsett å handle
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.product_id} className="flex gap-3">
                  {/* Image */}
                  <div className="relative w-16 h-16 bg-(--color-sand) rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏓</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-(--color-text) truncate">{item.name}</p>
                    <p className="text-xs text-(--color-muted)">{item.brand}</p>
                    <p className="text-sm font-semibold text-(--color-gold) mt-0.5">
                      {formatNok(eurToNok(item.price_eur * item.quantity, nokRate))}
                    </p>
                  </div>

                  {/* Quantity + remove */}
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-(--color-muted) hover:text-red-500 transition-colors text-xs"
                      aria-label="Fjern"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-2 text-sm">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full border border-(--color-border) flex items-center justify-center text-(--color-subtle) hover:border-(--color-text) transition-colors"
                      >
                        −
                      </button>
                      <span className="text-(--color-text) font-medium w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full border border-(--color-border) flex items-center justify-center text-(--color-subtle) hover:border-(--color-text) transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-(--color-border) flex flex-col gap-3">
            {/* Frakt-progress */}
            {totalEur < 200 ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-(--color-muted) text-center">
                  Legg til{' '}
                  <span className="font-semibold text-(--color-text)">
                    {formatNok(eurToNok(200 - totalEur, nokRate))}
                  </span>
                  {' '}for gratis frakt!
                </p>
                <div className="w-full h-1.5 bg-(--color-border) rounded-full overflow-hidden">
                  <div
                    className="h-full bg-(--color-cta) rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totalEur / 200) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-(--color-success) font-semibold text-center">Gratis frakt! 🎉</p>
            )}

            <div className="flex justify-between items-center">
              <span className="text-(--color-muted) text-sm">
                {totalEur >= 200 ? 'Frakt' : `+ ${formatNok(eurToNok(20, nokRate))} frakt`}
              </span>
              <span className="text-(--color-gold) font-bold text-lg">
                {formatNok(eurToNok(totalEur, nokRate))}
              </span>
            </div>
            <Link
              href="/shop/checkout"
              onClick={closeCart}
              className="w-full bg-(--color-cta) text-white font-semibold py-3 rounded-full hover:opacity-90 transition-opacity text-center"
            >
              Gå til kasse →
            </Link>
            {/* Betalingslogoer */}
            <div className="flex items-center justify-center gap-2">
              {/* Visa */}
              <svg viewBox="0 0 60 20" className="h-5 w-auto" aria-label="Visa">
                <text x="0" y="16" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="18" fill="#1a1f71">VISA</text>
              </svg>
              {/* Mastercard */}
              <svg viewBox="0 0 38 24" className="h-5 w-auto" aria-label="Mastercard">
                <circle cx="14" cy="12" r="10" fill="#eb001b"/>
                <circle cx="24" cy="12" r="10" fill="#f79e1b"/>
                <path d="M19 5.3a10 10 0 0 1 0 13.4A10 10 0 0 1 19 5.3z" fill="#ff5f00"/>
              </svg>
              {/* Vipps */}
              <span className="text-[11px] font-bold text-white bg-(--color-vipps) px-1.5 py-0.5 rounded" aria-label="Vipps">Vipps</span>
            </div>
            <p className="text-xs text-(--color-muted) text-center bg-(--color-sand) rounded-lg px-3 py-2">
              Merk: Toll og mva. (25 %) betales til UPS ved levering.{' '}
              <Link href="/shop/levering-og-retur" className="underline hover:text-(--color-text)" onClick={closeCart}>
                Les mer
              </Link>
            </p>
            <p className="text-xs text-(--color-subtle) text-center">
              14 dagers angrerett ·{' '}
              <Link href="/shop/levering-og-retur" className="underline hover:text-(--color-text)" onClick={closeCart}>
                Vilkår
              </Link>
            </p>
            <button
              onClick={closeCart}
              className="w-full text-(--color-subtle) text-sm text-center hover:text-(--color-text) transition-colors"
            >
              Fortsett å handle →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
