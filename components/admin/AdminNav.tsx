'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/trips',     label: 'Turer' },
  { href: '/admin/bookings',  label: 'Bookinger' },
  { href: '/admin/waitlist',  label: 'Venteliste' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-(--color-dark) text-white px-6 py-3 flex items-center gap-6 sticky top-0 z-50">
      <span className="font-display text-(--color-gold) font-semibold mr-2">
        Fera Admin
      </span>
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm transition-colors ${
            pathname === href || pathname.startsWith(href + '/')
              ? 'text-white font-medium'
              : 'text-(--color-muted) hover:text-white'
          }`}
        >
          {label}
        </Link>
      ))}
      <Link
        href="/admin/trips/new"
        className="ml-auto bg-(--color-cta) text-white text-sm px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
      >
        + Ny tur
      </Link>
    </nav>
  )
}
