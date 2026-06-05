'use client'

import { useState } from 'react'
import Link from 'next/link'

const eventerSegmenter = [
  { label: 'Åpen tur', slug: 'apen-tur' },
  { label: 'Klubbtur', slug: 'klubbtur' },
  { label: 'Privat', slug: 'privat' },
  { label: 'Bedrift', slug: 'bedrift' },
]

export default function Nav() {
  const [eventerOpen, setEventerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[--color-border]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/travels" className="flex items-center shrink-0">
            <span className="font-display font-bold text-[--color-text] text-lg leading-none">
              FERA
            </span>
            <span className="font-display font-normal text-[--color-gold] text-lg leading-none">
              {' \\ PADEL'}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/travels/shop"
              className="text-[--color-subtle] text-[13px] hover:text-[--color-text] transition-colors"
            >
              Shop
            </Link>

            {/* Eventer dropdown */}
            <div className="relative">
              <button
                onClick={() => setEventerOpen((v) => !v)}
                onBlur={() => setTimeout(() => setEventerOpen(false), 150)}
                className="flex items-center gap-1 text-[--color-subtle] text-[13px] hover:text-[--color-text] transition-colors"
              >
                Eventer
                <span className="text-[10px]">▾</span>
              </button>
              {eventerOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-[--color-border] shadow-md rounded-lg overflow-hidden">
                  {eventerSegmenter.map((seg) => (
                    <Link
                      key={seg.slug}
                      href={`/travels/eventer/${seg.slug}`}
                      className="block px-4 py-2.5 text-[13px] text-[--color-subtle] hover:bg-[--color-sand] hover:text-[--color-text] transition-colors"
                    >
                      {seg.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/travels/inspirasjon"
              className="text-[--color-subtle] text-[13px] hover:text-[--color-text] transition-colors"
            >
              Inspirasjon
            </Link>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/travels/profil"
              className="text-[--color-subtle] text-[13px] hover:text-[--color-text] transition-colors"
            >
              Profil
            </Link>
            <Link
              href="/travels/cart"
              className="text-[--color-subtle] text-[13px] hover:text-[--color-text] transition-colors"
            >
              🛒
            </Link>
            <Link
              href="/travels"
              className="bg-[--color-cta] text-white text-[13px] font-medium px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              Se turer
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[--color-text] text-xl"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[--color-border] bg-white">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link
              href="/travels/shop"
              className="text-[--color-subtle] text-[14px] hover:text-[--color-text] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Shop
            </Link>
            <div>
              <p className="text-[--color-subtle] text-[14px] font-medium mb-1">Eventer</p>
              <div className="pl-3 flex flex-col gap-2">
                {eventerSegmenter.map((seg) => (
                  <Link
                    key={seg.slug}
                    href={`/travels/eventer/${seg.slug}`}
                    className="text-[--color-subtle] text-[13px] hover:text-[--color-text] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {seg.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/travels/inspirasjon"
              className="text-[--color-subtle] text-[14px] hover:text-[--color-text] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Inspirasjon
            </Link>
            <Link
              href="/travels"
              className="bg-[--color-cta] text-white text-[14px] font-medium px-4 py-2 rounded-full text-center hover:opacity-90 transition-opacity"
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
