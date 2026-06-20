'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/account',           label: 'Oversikt'   },
  { href: '/account/orders',    label: 'Ordrer'     },
  { href: '/account/trips',     label: 'Reiser'     },
  { href: '/account/profile',   label: 'Profil'     },
  { href: '/account/addresses', label: 'Adresser'   },
]

export default function AccountSidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="flex flex-col gap-1 min-w-[200px]">
      <p className="text-xs font-semibold uppercase tracking-widest text-(--color-muted) mb-2 px-3">
        Min konto
      </p>

      {navLinks.map(({ href, label }) => {
        const active = href === '/account' ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={[
              'px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              active
                ? 'bg-(--color-dark) text-white'
                : 'text-(--color-text) hover:bg-(--color-sand-light)',
            ].join(' ')}
          >
            {label}
          </Link>
        )
      })}

      <div className="mt-4 border-t border-(--color-border) pt-4">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-sand-light) transition-colors"
        >
          Logg ut
        </button>
      </div>
    </nav>
  )
}
