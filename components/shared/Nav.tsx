'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart/context'

const navLinks = [
  { label: 'Nyheter', href: '/shop' },
  { label: 'Utstyr', href: '/shop?kategori=racket' },
  { label: 'Tilbehør', href: '/shop?kategori=accessories' },
  { label: 'Salg', href: '/shop?salg=true' },
  { label: 'Reiser', href: '/travels' },
  { label: 'Inspirasjon', href: '/travels/inspirasjon' },
]

const searchActions = [
  { label: 'Se status på din ordre', href: '/ordre-status' },
  { label: 'Bli med i Fera Community', href: '/#nyhetsbrev' },
  { label: 'Betaling', href: '/hjelp/betaling' },
  { label: 'Levering', href: '/hjelp/levering' },
  { label: 'Bytte og retur', href: '/hjelp/retur' },
]

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-(--color-text) text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
      {label}
    </span>
  )
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { totalItems, openCart } = useCart()

  return (
    <>
      <nav className="sticky top-0 z-40 bg-(--color-bg)/95 backdrop-blur border-b border-(--color-border)">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/" className="flex items-center leading-none shrink-0 mr-8">
              <img src="/fera-logo.svg" alt="Fera" className="h-7 w-auto" />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6 flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-(--color-subtle) text-[14px] hover:text-(--color-text) transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop icon group */}
            <div className="hidden md:flex items-center gap-1">

              {/* Search */}
              <div className="relative group">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-(--color-subtle) hover:text-(--color-text) transition-colors"
                  aria-label="Søk"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </button>
                <Tooltip label="Søk" />
              </div>

              {/* User */}
              <div className="relative group">
                <button className="p-2 text-(--color-subtle) hover:text-(--color-text) transition-colors" aria-label="Logg inn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
                <Tooltip label="Logg inn" />
              </div>

              {/* Favorites */}
              <div className="relative group">
                <button className="p-2 text-(--color-subtle) hover:text-(--color-text) transition-colors" aria-label="Favoritter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
                <Tooltip label="Favoritter" />
              </div>

              {/* Cart */}
              <div className="relative group">
                <button
                  onClick={openCart}
                  className="relative p-2 text-(--color-subtle) hover:text-(--color-text) transition-colors"
                  aria-label="Handlekurv"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-(--color-cta) text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
                <Tooltip label="Handlekurv" />
              </div>
            </div>

            {/* Mobile: search + cart + hamburger */}
            <div className="flex md:hidden items-center gap-1">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-(--color-subtle)" aria-label="Søk">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
              <button onClick={openCart} className="relative p-2 text-(--color-subtle)" aria-label="Handlekurv">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-(--color-cta) text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-(--color-subtle)" aria-label="Meny">
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
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-(--color-subtle) text-[14px] py-2.5 hover:text-(--color-text) transition-colors border-b border-(--color-border) last:border-0"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Search panel */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          {/* Panel — slides in from right */}
          <div className="w-full max-w-[420px] bg-white h-full flex flex-col shadow-2xl animate-[slideInRight_0.25s_ease-out]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-7 pb-5 border-b border-(--color-border)">
              <h2 className="font-sans font-normal text-(--color-text) text-xl">Søk</h2>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1.5 text-(--color-muted) hover:text-(--color-text) transition-colors"
                aria-label="Lukk søk"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Search input */}
            <div className="px-6 py-5">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Søk etter produkter, reiser…"
                  className="w-full pl-10 pr-4 py-3 bg-(--color-sand-light) border border-(--color-border) rounded-full text-sm text-(--color-text) focus:outline-none focus:border-(--color-text)/30 transition-colors"
                />
              </div>
            </div>

            {/* Suggested actions */}
            <div className="px-6 flex-1">
              <p className="text-(--color-overline) text-[11px] uppercase tracking-widest font-medium mb-3">Forslag</p>
              <ul>
                {searchActions.map((action) => (
                  <li key={action.label}>
                    <Link
                      href={action.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between py-3.5 text-(--color-text) text-sm hover:text-(--color-cta) transition-colors group border-b border-(--color-border)"
                    >
                      <span>{action.label}</span>
                      <svg className="w-4 h-4 text-(--color-border) group-hover:text-(--color-cta) transition-colors shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
