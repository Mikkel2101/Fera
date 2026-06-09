'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart/context'

const eventerSegmenter = [
  { label: 'Åpen tur', slug: 'apen-tur' },
  { label: 'Klubbtur', slug: 'klubbtur' },
  { label: 'Privat', slug: 'privat' },
  { label: 'Bedrift', slug: 'bedrift' },
]

export default function Nav() {
  const [eventerOpen, setEventerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { totalItems, openCart } = useCart()

  return (
    <nav className="sticky top-0 z-50 bg-(--color-bg)/95 backdrop-blur border-b border-(--color-border)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/travels" className="font-display italic font-bold text-(--color-dark) text-2xl tracking-tight leading-none">
            Fera
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/shop"
              className="text-(--color-subtle) text-[13px] hover:text-(--color-text) transition-colors"
            >
              Shop
            </Link>

            {/* Eventer dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setEventerOpen(true)}
              onMouseLeave={() => setEventerOpen(false)}
            >
              <button className="text-(--color-subtle) text-[13px] hover:text-(--color-text) transition-colors flex items-center gap-1">
                Reiser
                <span className="text-[10px]">▾</span>
              </button>
              {eventerOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-(--color-border) py-2 min-w-[180px] z-50">
                  {eventerSegmenter.map((seg) => (
                    <Link
                      key={seg.slug}
                      href={`/travels/eventer/${seg.slug}`}
                      className="block px-4 py-2 text-[13px] text-(--color-subtle) hover:text-(--color-text) hover:bg-(--color-sand) transition-colors"
                    >
                      {seg.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/travels/inspirasjon"
              className="text-(--color-subtle) text-[13px] hover:text-(--color-text) transition-colors"
            >
              Inspirasjon
            </Link>

            <Link
              href="/travels"
              className="bg-(--color-cta) text-white text-[13px] font-medium px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
            >
              Se turer
            </Link>

            {/* Cart icon */}
            <button
              onClick={openCart}
              className="relative text-(--color-subtle) hover:text-(--color-text) transition-colors"
              aria-label="Åpne handlekurv"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-(--color-cta) text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={openCart}
              className="relative text-(--color-subtle)"
              aria-label="Åpne handlekurv"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-(--color-cta) text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-(--color-subtle) p-1"
              aria-label="Meny"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-(--color-border) bg-white">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link
              href="/shop"
              className="text-(--color-subtle) text-[14px] hover:text-(--color-text) transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Shop
            </Link>
            <div>
              <p className="text-(--color-subtle) text-[14px] font-medium mb-1">Eventer</p>
              <div className="pl-3 flex flex-col gap-2">
                {eventerSegmenter.map((seg) => (
                  <Link
                    key={seg.slug}
                    href={`/travels/eventer/${seg.slug}`}
                    className="text-(--color-subtle) text-[13px] hover:text-(--color-text) transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {seg.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/travels/inspirasjon"
              className="text-(--color-subtle) text-[14px] hover:text-(--color-text) transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Inspirasjon
            </Link>
            <Link
              href="/travels"
              className="bg-(--color-cta) text-white text-[14px] font-medium px-4 py-2 rounded-full text-center hover:opacity-90 transition-opacity"
              onClick={() => setMenuOpen(false)}
            >
              Se turer
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
