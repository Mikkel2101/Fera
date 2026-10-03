'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart/context'
import { SHOP_ENABLED } from '@/lib/flags'

const SHOP_CATEGORIES = [
  { label: 'Racketer',  href: '/shop?category=racket' },
  { label: 'Sko',       href: '/shop?category=shoes' },
  { label: 'Vesker',    href: '/shop?category=bag' },
  { label: 'Baller',    href: '/shop?category=balls' },
  { label: 'Klær',      href: '/shop?category=clothing' },
  { label: 'Tilbehør',  href: '/shop?category=accessories' },
]

// SVG icons — inline, consistent 18×18 stroke style
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function IconCart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}
function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="17" x2="21" y2="17"/>
    </svg>
  )
}
function IconChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}
function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}

export default function Nav() {
  const pathname = usePathname()
  const { totalItems, openCart } = useCart()

  const [announcementVisible, setAnnouncementVisible] = useState(true)
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileShopOpen, setMobileShopOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Scroll-listener: kompakt nav etter 40px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Steng dropdown ved klikk utenfor
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lås scroll når mobil-meny er åpen
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Steng mobil-meny på rute-endring
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const isShop    = pathname.startsWith('/shop')
  const isTravels = pathname.startsWith('/travels')

  return (
    <>
      {/* ── Announcement bar ── */}
      {SHOP_ENABLED && announcementVisible && (
        <div className="bg-(--color-dark) text-white text-xs py-2 px-4 flex items-center justify-center gap-6 relative">
          <span className="hidden sm:inline">Offisiell Padelpoint-partner</span>
          <span className="text-white/40 hidden sm:inline">·</span>
          <span>Gratis frakt over 2 000 kr</span>
          <span className="text-white/40 hidden sm:inline">·</span>
          <span className="hidden sm:inline">14 dagers angrerett</span>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            aria-label="Lukk"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Main nav ── */}
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/98 backdrop-blur-md shadow-sm border-b border-(--color-border)'
          : 'bg-white border-b border-(--color-border)'
      }`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link href="/" className="shrink-0 mr-10" aria-label="Fera — til forsiden">
              <Image src="/fera-logo.svg" alt="Fera" width={80} height={28} style={{ height: '28px', width: 'auto' }} />
            </Link>

            {/* ── Desktop nav ── */}
            <div className="hidden md:flex items-center gap-1 flex-1">

              {SHOP_ENABLED && (<>
              {/* Utstyr med dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShopDropdownOpen(v => !v)}
                  onMouseEnter={() => setShopDropdownOpen(true)}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isShop
                      ? 'text-(--color-text)'
                      : 'text-(--color-subtle) hover:text-(--color-text) hover:bg-(--color-ice-light)'
                  }`}
                  aria-expanded={shopDropdownOpen}
                  aria-haspopup="true"
                >
                  Utstyr
                  <span className={`transition-transform duration-200 ${shopDropdownOpen ? 'rotate-180' : ''}`}>
                    <IconChevronDown />
                  </span>
                  {isShop && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-(--color-cta) rounded-full" />
                  )}
                </button>

                {/* Dropdown */}
                {shopDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-72 bg-white border border-(--color-border) rounded-2xl shadow-xl overflow-hidden"
                    onMouseLeave={() => setShopDropdownOpen(false)}
                  >
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-widest text-(--color-muted) font-medium mb-3">Kategorier</p>
                      <div className="grid grid-cols-2 gap-1">
                        {SHOP_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.href}
                            href={cat.href}
                            onClick={() => setShopDropdownOpen(false)}
                            className="px-3 py-2.5 text-sm text-(--color-text) hover:bg-(--color-ice-light) rounded-lg transition-colors font-medium"
                          >
                            {cat.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-(--color-border) px-4 py-3">
                      <Link
                        href="/shop"
                        onClick={() => setShopDropdownOpen(false)}
                        className="flex items-center justify-between text-sm text-(--color-cta) font-semibold hover:opacity-80 transition-opacity group"
                      >
                        Se hele sortimentet
                        <span className="group-hover:translate-x-1 transition-transform">
                          <IconArrow />
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Salg */}
              <Link
                href="/shop?sort=sale"
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === '/shop' && false
                    ? 'text-(--color-text)'
                    : 'text-(--color-subtle) hover:text-(--color-text) hover:bg-(--color-ice-light)'
                }`}
              >
                Salg
                <span className="ml-1.5 inline-flex items-center text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                  %
                </span>
              </Link>
              </>)}

              {/* Reiser */}
              <Link
                href="/travels"
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isTravels
                    ? 'text-(--color-text)'
                    : 'text-(--color-subtle) hover:text-(--color-text) hover:bg-(--color-ice-light)'
                }`}
              >
                Reiser
                {isTravels && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-(--color-cta) rounded-full" />
                )}
              </Link>
            </div>

            {/* ── Desktop ikoner ── */}
            <div className="hidden md:flex items-center gap-0.5">
              <Link
                href="/account"
                className="p-2.5 text-(--color-subtle) hover:text-(--color-text) hover:bg-(--color-ice-light) rounded-lg transition-colors"
                aria-label="Min konto"
              >
                <IconUser />
              </Link>

              {SHOP_ENABLED && (
              <button
                onClick={openCart}
                className="relative p-2.5 text-(--color-subtle) hover:text-(--color-text) hover:bg-(--color-ice-light) rounded-lg transition-colors"
                aria-label={`Handlekurv${totalItems > 0 ? ` — ${totalItems} varer` : ''}`}
              >
                <IconCart />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-(--color-cta) text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center leading-none">
                    {totalItems}
                  </span>
                )}
              </button>
              )}
            </div>

            {/* ── Mobil: cart + hamburger ── */}
            <div className="flex md:hidden items-center gap-1">
              {SHOP_ENABLED && (
              <button
                onClick={openCart}
                className="relative p-2.5 text-(--color-subtle)"
                aria-label="Handlekurv"
              >
                <IconCart />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-(--color-cta) text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center leading-none">
                    {totalItems}
                  </span>
                )}
              </button>
              )}
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2.5 text-(--color-subtle)"
                aria-label="Åpne meny"
                aria-expanded={mobileOpen}
              >
                <IconMenu />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Mobil overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="w-80 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl animate-[slideInRight_0.25s_ease-out]">

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-border)">
              <Link href="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
                <Image src="/fera-logo.svg" alt="Fera" width={70} height={24} style={{ height: '24px', width: 'auto' }} />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-(--color-muted) hover:text-(--color-text) transition-colors"
                aria-label="Lukk meny"
              >
                <IconClose />
              </button>
            </div>

            {/* Nav innhold */}
            <div className="flex-1 overflow-y-auto">

              {SHOP_ENABLED && (<>
              {/* UTSTYR-seksjon */}
              <div className="px-5 pt-6 pb-2">
                <button
                  onClick={() => setMobileShopOpen(v => !v)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-(--color-muted)">Utstyr</span>
                  <span className={`text-(--color-muted) transition-transform duration-200 ${mobileShopOpen ? 'rotate-180' : ''}`}>
                    <IconChevronDown />
                  </span>
                </button>

                {mobileShopOpen && (
                  <div className="mt-3 grid grid-cols-2 gap-1">
                    {SHOP_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        className="px-3 py-2.5 text-sm text-(--color-text) bg-(--color-ice-light) hover:bg-(--color-ice) rounded-xl transition-colors font-medium text-center"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  href="/shop"
                  className={`flex items-center justify-between mt-3 py-3 text-sm font-semibold border-b border-(--color-border) group ${
                    isShop ? 'text-(--color-cta)' : 'text-(--color-text)'
                  }`}
                >
                  Se alle produkter
                  <span className="text-(--color-muted) group-hover:translate-x-1 transition-transform">
                    <IconArrow />
                  </span>
                </Link>
              </div>

              {/* Salg */}
              <div className="px-5 py-2">
                <p className="text-[11px] uppercase tracking-widest font-semibold text-(--color-muted) mb-2">Tilbud</p>
                <Link
                  href="/shop?sort=sale"
                  className="flex items-center justify-between py-3 text-sm font-medium text-(--color-text) border-b border-(--color-border) group"
                >
                  <span className="flex items-center gap-2">
                    Salg
                    <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">%</span>
                  </span>
                  <span className="text-(--color-muted) group-hover:translate-x-1 transition-transform">
                    <IconArrow />
                  </span>
                </Link>
              </div>
              </>)}

              {/* REISER-seksjon */}
              <div className={`px-5 ${SHOP_ENABLED ? 'py-2' : 'pt-6 pb-2'}`}>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-(--color-muted) mb-2">Reiser</p>
                <Link
                  href="/travels"
                  className={`flex items-center justify-between py-3 text-sm font-medium border-b border-(--color-border) group ${
                    isTravels ? 'text-(--color-cta)' : 'text-(--color-text)'
                  }`}
                >
                  Se kommende reiser
                  <span className="text-(--color-muted) group-hover:translate-x-1 transition-transform">
                    <IconArrow />
                  </span>
                </Link>
              </div>
            </div>

            {/* Panel footer */}
            <div className="px-5 py-4 border-t border-(--color-border) flex flex-col gap-2">
              <Link
                href="/account"
                className="flex items-center gap-3 py-2.5 text-sm text-(--color-text) hover:text-(--color-cta) transition-colors font-medium"
              >
                <IconUser />
                Min konto
              </Link>
              {SHOP_ENABLED && (
              <p className="text-xs text-(--color-muted) text-center pt-1">
                Offisiell Padelpoint-partner · Gratis frakt over 2 000 kr
              </p>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}
