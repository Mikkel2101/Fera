'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart/context'

const reiserLinks = [
  { label: 'Se alle turer', href: '/travels' },
  { label: 'For klubber & coacher', href: '/travels/for-klubber' },
  { label: 'For bedrifter', href: '/travels/for-bedrifter' },
  { label: 'FAQ', href: '/travels/faq' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [reiserOpen, setReiserOpen] = useState(false)
  const { totalItems, openCart } = useCart()

  return (
    <nav className="sticky top-0 z-50 bg-(--color-bg)/95 backdrop-blur border-b border-(--color-border)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="font-display italic font-bold text-(--color-dark) text-2xl tracking-tight leading-none">
            Fera
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/shop" className="text-(--color-subtle) text-[13px] hover:text-(--color-text) transition-colors">Shop</Link>

            {/* Reiser dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setReiserOpen(true)}
              onMouseLeave={() => setReiserOpen(false)}
            >
              <button className="text-(--color-subtle) text-[13px] hover:text-(--color-text) transition-colors flex items-center gap-1">
                Reiser
                <span className="text-[10px]">▾</span>
              </button>
              {/* Invisible bridge so mouse can travel from button to dropdown */}
              <div className="absolute top-full left-0 right-0 h-3" />
              {reiserOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 bg-white rounded-xl shadow-lg border border-(--color-border) py-2 min-w-[200px] z-50">
                  {reiserLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2.5 text-[13px] text-(--color-subtle) hover:text-(--color-text) hover:bg-(--color-ice-light) transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/travels/om-oss" className="text-(--color-subtle) text-[13px] hover:text-(--color-text) transition-colors">Om oss</Link>

            <Link
              href="/travels"
              className="bg-(--color-cta) text-white text-[13px] font-medium px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
            >
              Se turer
            </Link>

            {/* Cart */}
            <button onClick={openCart} className="relative text-(--color-subtle) hover:text-(--color-text) transition-colors" aria-label="Åpne handlekurv">
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
            <button onClick={openCart} className="relative text-(--color-subtle)" aria-label="Åpne handlekurv">
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
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-(--color-subtle) p-1" aria-label="Meny">
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
          <div className="px-4 py-4 flex flex-col gap-1">
            <Link href="/shop" className="text-(--color-subtle) text-[14px] py-2 hover:text-(--color-text) transition-colors" onClick={() => setMenuOpen(false)}>Shop</Link>
            <div className="py-1">
              <p className="text-(--color-text) text-[14px] font-medium py-1">Reiser</p>
              <div className="pl-3 flex flex-col gap-1 border-l border-(--color-border) ml-1">
                {reiserLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-(--color-subtle) text-[13px] py-1.5 hover:text-(--color-text) transition-colors" onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/travels/om-oss" className="text-(--color-subtle) text-[14px] py-2 hover:text-(--color-text) transition-colors" onClick={() => setMenuOpen(false)}>Om oss</Link>
            <Link href="/travels/inspirasjon" className="text-(--color-subtle) text-[14px] py-2 hover:text-(--color-text) transition-colors" onClick={() => setMenuOpen(false)}>Inspirasjon</Link>
            <div className="pt-2">
              <Link href="/travels" className="block bg-(--color-cta) text-white text-[14px] font-medium px-4 py-2.5 rounded-full text-center hover:opacity-90 transition-opacity" onClick={() => setMenuOpen(false)}>Se turer</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
