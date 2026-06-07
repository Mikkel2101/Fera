# FeraShop MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build FeraShop (product list + detail + cart drawer) on top of the existing FeraTravels platform, with shared Nav and Vercel deploy — ready for Padelpoint meeting 2026-06-11.

**Architecture:** New `products` Supabase table + RLS. FeraShop pages under `/shop` and `/shop/[id]`. Global cart state via React Context + localStorage, rendered as a slide-in drawer. Shared Nav component replaces the travels-only Nav.

**Tech Stack:** Next.js 16, Supabase (server client for RSC, browser client for mutations), React Context, Tailwind v4 with `(--color-*)` CSS variable syntax, Vercel.

**Key rules:**
- CSS tokens always use parenthesis syntax: `bg-(--color-cta)`, `text-(--color-gold)` etc.
- Next.js 16: `await params` and `await searchParams` — they are Promises
- Server components: `import { createClient } from '@/lib/supabase/server'`
- Client components: `import { createClient } from '@/lib/supabase/client'`
- No hardcoded hex values — always use CSS tokens

---

## File Map

**New files:**
- `supabase/migrations/004_shop_products.sql` — products table + RLS
- `lib/supabase/types.ts` — add Product type (update existing)
- `lib/cart/types.ts` — CartItem, CartState types
- `lib/cart/context.tsx` — CartContext + CartProvider + useCart hook
- `components/shared/Nav.tsx` — unified nav for travels + shop (replaces travels/Nav.tsx)
- `components/shop/ProductCard.tsx` — single product card
- `components/shop/ProductGrid.tsx` — grid + filter wrapper
- `components/shop/CartDrawer.tsx` — slide-in cart drawer
- `app/shop/page.tsx` — shop listing (rewrite existing stub)
- `app/shop/layout.tsx` — shop layout with CartProvider (rewrite existing stub)
- `app/shop/[id]/page.tsx` — product detail page

**Modified files:**
- `components/travels/Nav.tsx` — replaced: re-export from shared/Nav
- `app/travels/layout.tsx` — update import to shared/Nav
- `app/travels/page.tsx` — verify dark hero matches spec, fix if needed
- `components/travels/TripListClient.tsx` — verify client filter + dark hero

---

## Task 1: DB migration — products table

**Files:**
- Create: `supabase/migrations/004_shop_products.sql`
- Modify: `lib/supabase/types.ts`

- [ ] **Step 1: Write migration**

Create `supabase/migrations/004_shop_products.sql`:

```sql
-- Products table for FeraShop
CREATE TABLE public.products (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  slug           text UNIQUE NOT NULL,
  brand          text NOT NULL,
  category       text NOT NULL CHECK (category IN ('racket','shoes','bag','balls','clothing','accessories')),
  description    text,
  price_eur      numeric(10,2) NOT NULL,
  images         text[] DEFAULT '{}',
  stock_status   text NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','low_stock','out_of_stock')),
  padelpoint_id  text,
  padelpoint_url text,
  published      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products" ON public.products
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products" ON public.products
  USING (is_admin())
  WITH CHECK (is_admin());

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
CREATE POLICY "Admin can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND is_admin());
```

- [ ] **Step 2: Run migration in Supabase**

Open Supabase SQL Editor → switch to `postgres` role → paste and run the migration.

Verify: `SELECT * FROM public.products LIMIT 1;` returns empty table without error.

- [ ] **Step 3: Add Product type to lib/supabase/types.ts**

In `lib/supabase/types.ts`, add the `products` table inside the `Tables` object (alongside `trips`, `bookings`, etc.):

```typescript
      products: {
        Row: {
          id: string
          name: string
          slug: string
          brand: string
          category: string
          description: string | null
          price_eur: number
          images: string[]
          stock_status: string
          padelpoint_id: string | null
          padelpoint_url: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          brand: string
          category: string
          description?: string | null
          price_eur: number
          images?: string[]
          stock_status?: string
          padelpoint_id?: string | null
          padelpoint_url?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          brand?: string
          category?: string
          description?: string | null
          price_eur?: number
          images?: string[]
          stock_status?: string
          padelpoint_id?: string | null
          padelpoint_url?: string | null
          published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/Mikkel/Documents/Projects/Fera && npx tsc --noEmit
```

Expected: no errors related to products type.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/004_shop_products.sql lib/supabase/types.ts
git commit -m "feat: add products table migration and TypeScript type"
```

---

## Task 2: Cart types + Context

**Files:**
- Create: `lib/cart/types.ts`
- Create: `lib/cart/context.tsx`

- [ ] **Step 1: Create lib/cart/types.ts**

```typescript
export type CartItem = {
  product_id: string
  name: string
  brand: string
  price_eur: number
  image: string
  quantity: number
}

export type CartState = {
  items: CartItem[]
}
```

- [ ] **Step 2: Create lib/cart/context.tsx**

```typescript
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { CartItem, CartState } from './types'

const STORAGE_KEY = 'fera-cart'

type CartContextValue = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (product_id: string) => void
  updateQuantity: (product_id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalEur: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === item.product_id)
      if (existing) {
        return prev.map(i =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((product_id: string) => {
    setItems(prev => prev.filter(i => i.product_id !== product_id))
  }, [])

  const updateQuantity = useCallback((product_id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product_id !== product_id))
    } else {
      setItems(prev =>
        prev.map(i => i.product_id === product_id ? { ...i, quantity } : i)
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalEur = items.reduce((sum, i) => sum + i.price_eur * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, totalEur, isOpen, openCart, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/cart/
git commit -m "feat: add cart context with localStorage persistence"
```

---

## Task 3: Shared Nav

**Files:**
- Create: `components/shared/Nav.tsx`
- Modify: `components/travels/Nav.tsx` (re-export)
- Modify: `app/travels/layout.tsx`

- [ ] **Step 1: Create components/shared/Nav.tsx**

```typescript
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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-(--color-border)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/travels" className="flex items-center gap-0.5">
            <span className="font-display font-bold text-(--color-text) text-lg leading-none">
              FERA
            </span>
            <span className="font-display font-normal text-(--color-gold) text-lg leading-none">
              {' \\ PADEL'}
            </span>
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
                Eventer
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
```

- [ ] **Step 2: Replace components/travels/Nav.tsx with re-export**

Overwrite `components/travels/Nav.tsx` with:

```typescript
export { default } from '@/components/shared/Nav'
```

- [ ] **Step 3: Update app/travels/layout.tsx to import shared Nav**

The import in `app/travels/layout.tsx` stays as `@/components/travels/Nav` (re-export handles it). No change needed — but CartProvider must wrap it. Update to:

```typescript
import type { Metadata } from 'next'
import Nav from '@/components/travels/Nav'
import { CartProvider } from '@/lib/cart/context'
import CartDrawer from '@/components/shop/CartDrawer'

export const metadata: Metadata = {
  title: 'Fera Travels — Padel-reiser til Costa Blanca',
  description: 'Kurerte padel-reisepakker til Spania for norske padel-entusiaster.',
}

export default function TravelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Nav />
      <CartDrawer />
      <main>{children}</main>
    </CartProvider>
  )
}
```

Note: CartDrawer doesn't exist yet — will be created in Task 5. Come back and add these imports after Task 5 is done.

- [ ] **Step 4: Verify dev server starts without errors**

```bash
npm run dev
```

Open http://localhost:3000/travels and verify nav renders with logo + cart icon.

- [ ] **Step 5: Commit**

```bash
git add components/shared/Nav.tsx components/travels/Nav.tsx app/travels/layout.tsx
git commit -m "feat: create shared Nav with cart icon, update travels layout"
```

---

## Task 4: CartDrawer component

**Files:**
- Create: `components/shop/CartDrawer.tsx`

- [ ] **Step 1: Create components/shop/CartDrawer.tsx**

```typescript
'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart/context'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalEur } = useCart()

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
                      € {(item.price_eur * item.quantity).toFixed(2)}
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
            <div className="flex justify-between items-center">
              <span className="text-(--color-muted) text-sm">Totalt</span>
              <span className="text-(--color-gold) font-bold text-lg">
                € {totalEur.toFixed(2)}
              </span>
            </div>
            <button
              className="w-full bg-(--color-cta) text-white font-semibold py-3 rounded-full hover:opacity-90 transition-opacity"
              disabled
            >
              Gå til kasse (kommer snart)
            </button>
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
```

- [ ] **Step 2: Update app/travels/layout.tsx** (add CartDrawer import as noted in Task 3 Step 3)

```typescript
import type { Metadata } from 'next'
import Nav from '@/components/travels/Nav'
import { CartProvider } from '@/lib/cart/context'
import CartDrawer from '@/components/shop/CartDrawer'

export const metadata: Metadata = {
  title: 'Fera Travels — Padel-reiser til Costa Blanca',
  description: 'Kurerte padel-reisepakker til Spania for norske padel-entusiaster.',
}

export default function TravelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Nav />
      <CartDrawer />
      <main>{children}</main>
    </CartProvider>
  )
}
```

- [ ] **Step 3: Test CartDrawer manually**

```bash
npm run dev
```

Open http://localhost:3000/travels — click 🛒 icon in nav. Drawer should slide in from right. Press Escape to close.

- [ ] **Step 4: Commit**

```bash
git add components/shop/CartDrawer.tsx app/travels/layout.tsx
git commit -m "feat: add CartDrawer slide-in component"
```

---

## Task 5: ProductCard component

**Files:**
- Create: `components/shop/ProductCard.tsx`

- [ ] **Step 1: Create components/shop/ProductCard.tsx**

```typescript
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
      className="group bg-(--color-surface) border border-(--color-border) rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square bg-(--color-sand)">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl">🏓</div>
        )}
        {/* Stock badge */}
        <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-(--color-muted) uppercase tracking-wide font-medium mb-1">
          {product.brand}
        </p>
        <p className="text-(--color-text) font-medium text-sm leading-snug line-clamp-2 flex-1">
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-(--color-gold) font-bold text-lg">
            € {product.price_eur.toLocaleString('nb-NO', { minimumFractionDigits: 0 })}
          </span>
          <span className="text-(--color-cta) text-sm font-medium group-hover:underline">
            Se detaljer →
          </span>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/shop/ProductCard.tsx
git commit -m "feat: add ProductCard component"
```

---

## Task 6: Shop listing page

**Files:**
- Create: `components/shop/ProductGrid.tsx`
- Modify: `app/shop/page.tsx`
- Modify: `app/shop/layout.tsx`

- [ ] **Step 1: Create components/shop/ProductGrid.tsx**

Client-side filter over products fetched server-side.

```typescript
'use client'

import { useState, useMemo } from 'react'
import ProductCard from './ProductCard'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

export default function ProductGrid({ products }: { products: Product[] }) {
  const [brandFilter, setBrandFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const brands = useMemo(() =>
    [...new Set(products.map(p => p.brand))].sort(), [products])

  const categories = useMemo(() =>
    [...new Set(products.map(p => p.category))].sort(), [products])

  const filtered = useMemo(() =>
    products.filter(p =>
      (!brandFilter || p.brand === brandFilter) &&
      (!categoryFilter || p.category === categoryFilter)
    ), [products, brandFilter, categoryFilter])

  const categoryLabels: Record<string, string> = {
    racket: 'Racketer', shoes: 'Sko', bag: 'Vesker',
    balls: 'Baller', clothing: 'Klær', accessories: 'Tilbehør',
  }

  return (
    <>
      {/* Filter bar */}
      <div className="bg-white border-b border-(--color-border) sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-3 items-center">
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="border border-(--color-border) rounded-full px-4 py-1.5 text-sm text-(--color-subtle) bg-white focus:outline-none focus:border-(--color-gold)"
          >
            <option value="">Alle merker</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border border-(--color-border) rounded-full px-4 py-1.5 text-sm text-(--color-subtle) bg-white focus:outline-none focus:border-(--color-gold)"
          >
            <option value="">Alle kategorier</option>
            {categories.map(c => (
              <option key={c} value={c}>{categoryLabels[c] ?? c}</option>
            ))}
          </select>
          {(brandFilter || categoryFilter) && (
            <button
              onClick={() => { setBrandFilter(''); setCategoryFilter('') }}
              className="text-(--color-cta) text-sm hover:underline"
            >
              Nullstill filter
            </button>
          )}
          <span className="ml-auto text-sm text-(--color-muted)">
            {filtered.length} produkter
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-(--color-bg) min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-(--color-muted)">
              Ingen produkter passer filteret
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Rewrite app/shop/page.tsx**

```typescript
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/shop/ProductGrid'

export const metadata = {
  title: 'Fera Shop — Padelutstyr fra Spania',
  description: 'Offisiell Padelpoint-partner. Racketer, sko, vesker og tilbehør levert til Norge.',
}

export default async function ShopPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .order('brand')

  return (
    <>
      {/* Hero */}
      <section className="bg-(--color-sand) py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-(--color-gold) font-medium mb-3">
            PADELUTSTYR & TILBEHØR
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-(--color-text) mb-3">
            Padelutstyr fra <em className="text-(--color-gold) not-italic">Spania</em>
          </h1>
          <p className="text-(--color-muted) text-lg max-w-xl">
            Offisiell Padelpoint-partner — rask levering til Norge
          </p>
        </div>
      </section>

      <ProductGrid products={products ?? []} />
    </>
  )
}
```

- [ ] **Step 3: Rewrite app/shop/layout.tsx**

```typescript
import type { Metadata } from 'next'
import Nav from '@/components/shared/Nav'
import { CartProvider } from '@/lib/cart/context'
import CartDrawer from '@/components/shop/CartDrawer'

export const metadata: Metadata = {
  title: 'Fera Shop',
  description: 'Padelutstyr fra Spania',
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Nav />
      <CartDrawer />
      <main>{children}</main>
    </CartProvider>
  )
}
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000/shop — should show hero + empty grid (no products yet). Nav with cart icon visible.

- [ ] **Step 5: Commit**

```bash
git add components/shop/ProductGrid.tsx app/shop/page.tsx app/shop/layout.tsx
git commit -m "feat: add shop listing page with filter grid"
```

---

## Task 7: Product detail page

**Files:**
- Create: `app/shop/[id]/page.tsx`

- [ ] **Step 1: Create app/shop/[id]/page.tsx**

```typescript
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AddToCartButton from '@/components/shop/AddToCartButton'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!product) notFound()

  const primaryImage = product.images[0] ?? null

  const stockLabel =
    product.stock_status === 'out_of_stock' ? 'Utsolgt'
    : product.stock_status === 'low_stock' ? 'Få igjen'
    : 'På lager'

  const stockClass =
    product.stock_status === 'out_of_stock' ? 'text-(--color-muted)'
    : product.stock_status === 'low_stock' ? 'text-(--color-cta)'
    : 'text-(--color-success)'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-1 text-sm text-(--color-subtle) hover:text-(--color-text) transition-colors mb-8"
      >
        ← Tilbake til butikken
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative aspect-square bg-(--color-sand) rounded-2xl overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-8"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-8xl">🏓</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-sm uppercase tracking-widest text-(--color-muted) font-medium mb-2">
            {product.brand}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-(--color-text) leading-tight mb-4">
            {product.name}
          </h1>
          <p className="text-(--color-gold) font-bold text-3xl mb-3">
            € {product.price_eur.toLocaleString('nb-NO', { minimumFractionDigits: 0 })}
          </p>
          <p className={`text-sm font-medium ${stockClass} mb-6`}>
            ● {stockLabel}
          </p>

          {product.description && (
            <p className="text-(--color-muted) text-base leading-relaxed mb-8">
              {product.description}
            </p>
          )}

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create components/shop/AddToCartButton.tsx**

This must be a client component since it calls useCart.

```typescript
'use client'

import { useCart } from '@/lib/cart/context'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()

  const isOutOfStock = product.stock_status === 'out_of_stock'

  function handleAdd() {
    addItem({
      product_id: product.id,
      name: product.name,
      brand: product.brand,
      price_eur: product.price_eur,
      image: product.images[0] ?? '',
    })
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isOutOfStock}
      className="w-full bg-(--color-cta) text-white font-semibold py-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed text-lg"
    >
      {isOutOfStock ? 'Utsolgt' : 'Legg i kurv'}
    </button>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds. Fix any TypeScript errors before continuing.

- [ ] **Step 4: Commit**

```bash
git add app/shop/[id]/ components/shop/AddToCartButton.tsx
git commit -m "feat: add product detail page with add-to-cart"
```

---

## Task 8: Import demo products

Add 10–15 real products from tiendapadelpoint.com manually via Supabase Studio.

- [ ] **Step 1: Open Supabase Studio**

Go to https://supabase.com/dashboard/project/dbvnuoayzevtoaolhqxd → Table Editor → `products`.

- [ ] **Step 2: Collect products from Padelpoint**

Browse tiendapadelpoint.com/en/ and pick 10–15 products across categories:
- 4–5 racketer (racket)
- 2–3 sko (shoes)
- 2 vesker (bag)
- 2 baller (balls)
- 1–2 tilbehør (accessories)

For each product, note: name, brand, category, price (EUR), description (kort), product URL.

- [ ] **Step 3: Upload images to Supabase Storage**

In Supabase → Storage → `products` bucket: upload the product images. Copy the public URL for each.

Public URL format: `https://dbvnuoayzevtoaolhqxd.supabase.co/storage/v1/object/public/products/<filename>`

- [ ] **Step 4: Insert products via SQL**

Example insert (repeat for each product):

```sql
INSERT INTO public.products (name, slug, brand, category, description, price_eur, images, stock_status, padelpoint_id, padelpoint_url)
VALUES (
  'Bullpadel Vertex 04',
  'bullpadel-vertex-04',
  'Bullpadel',
  'racket',
  'Offensivt racket for avanserte spillere. Diamantform med karbonfiber overflate.',
  189.00,
  ARRAY['https://dbvnuoayzevtoaolhqxd.supabase.co/storage/v1/object/public/products/bullpadel-vertex-04.jpg'],
  'in_stock',
  'PADELPOINT_ID_HER',
  'https://www.tiendapadelpoint.com/en/...'
);
```

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000/shop — produkter skal nå vises i grid. Test filter (brand, kategori). Klikk ett produkt → detaljside. Klikk "Legg i kurv" → drawer åpnes.

- [ ] **Step 6: Commit**

Products are in Supabase (not in git). No commit needed for data — but note the insert SQL in a comment or local file for reference.

---

## Task 9: FeraTravels design verification

Check that the existing travels components look correct now that CSS variables are fixed.

- [ ] **Step 1: Start dev server and check /travels**

```bash
npm run dev
```

Open http://localhost:3000/travels. Check:
- [ ] Dark gradient hero with gold label "KOMMENDE TURER" and Playfair italic heading
- [ ] TripCards with dark background (`#2C1A0E`), FERA watermark, gold price
- [ ] Status badges (green "Åpen", amber "X plasser igjen")
- [ ] Nav sticky with logo "FERA \ PADEL" in correct colors

- [ ] **Step 2: Check /travels/[id] detail page**

Open a trip detail page. Check:
- [ ] Dark hero with gradient + image overlay
- [ ] Sticky MetaBar with icon pills (date, destination, price, spots)
- [ ] "Book din plass" amber pill button
- [ ] Alternating white/sand content sections

- [ ] **Step 3: Check booking flow /travels/[id]/book**

Open booking. Check:
- [ ] Progress bar with amber fill for active/completed steps
- [ ] Step 1 form fields render correctly
- [ ] "Neste →" button in amber

- [ ] **Step 4: Fix any visual issues found**

If any component doesn't match the spec (`docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md`), fix it now. Common fixes:
- Wrong CSS token syntax → change `[--color-*]` to `(--color-*)`
- Missing font class → add `font-display` for Playfair headings
- Wrong background → check token name matches globals.css

- [ ] **Step 5: Commit fixes (if any)**

```bash
git add -A
git commit -m "fix: apply FeraTravels design spec corrections"
```

---

## Task 10: Vercel deploy

- [ ] **Step 1: Ensure Next.js config is Vercel-ready**

Read `next.config.ts` (or `next.config.js`) and verify `images.remotePatterns` includes Supabase Storage domain:

```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dbvnuoayzevtoaolhqxd.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}
export default nextConfig
```

If it's missing, add it. Commit:

```bash
git add next.config.ts
git commit -m "fix: add Supabase Storage domain to Next.js image remotePatterns"
```

- [ ] **Step 2: Ensure build passes locally**

```bash
npm run build
```

Expected: ✓ Compiled successfully. Fix any errors before deploying.

- [ ] **Step 3: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 4: Create Vercel project**

Go to https://vercel.com/new → Import Git Repository → select the Fera repo.

Framework preset: **Next.js** (auto-detected).

- [ ] **Step 5: Set environment variables in Vercel**

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL         = https://dbvnuoayzevtoaolhqxd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY    = <from Supabase → Settings → API>
SUPABASE_SERVICE_ROLE_KEY        = <from Supabase → Settings → API>
STRIPE_SECRET_KEY                = <from Stripe Dashboard → Developers → API keys>
STRIPE_WEBHOOK_SECRET            = (set after Step 7)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = <from Stripe Dashboard>
```

- [ ] **Step 6: Deploy**

Click **Deploy** in Vercel. Wait for build to complete (~2–3 min).

Open the deployed URL and verify:
- `/shop` shows products
- `/travels` shows trips
- `/admin/login` works

- [ ] **Step 7: Register Stripe webhook**

In Stripe Dashboard → Developers → Webhooks → Add endpoint:

```
URL: https://<your-vercel-domain>/api/webhooks/stripe
Events: checkout.session.completed
```

Copy the **Signing secret** → paste into Vercel env var `STRIPE_WEBHOOK_SECRET` → redeploy (or Vercel picks it up automatically).

- [ ] **Step 8: Test full booking flow**

On the deployed URL:
1. Open a trip → Book din plass → fill in Step 1 → Step 2 → go to Stripe
2. Use test card `4242 4242 4242 4242` (any future date, any CVC)
3. Verify redirect to `/travels/[id]/book/success`
4. Verify booking shows `deposit_status = Betalt` in Supabase

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "feat: Vercel deploy ready — FeraShop MVP complete"
git push origin main
```

---

## Self-Review

**Spec coverage check:**

| Spec section | Covered by task |
|---|---|
| products table | Task 1 |
| Product type in types.ts | Task 1 |
| Cart Context + localStorage | Task 2 |
| Shared Nav with cart badge | Task 3 |
| Cart Drawer | Task 4 |
| ProductCard (lys design) | Task 5 |
| /shop listing + filters | Task 6 |
| /shop/[id] detail | Task 7 |
| AddToCartButton | Task 7 |
| Product import (10–15 products) | Task 8 |
| FeraTravels design verification | Task 9 |
| Vercel deploy | Task 10 |
| Stripe webhook verification | Task 10 Step 8 |

**Stripe webhook:** Already implemented in `app/api/webhooks/stripe/route.ts`. No code changes needed — only Vercel env var `STRIPE_WEBHOOK_SECRET` and Stripe Dashboard registration (Task 10 Step 7).

**Placeholder scan:** No TBDs. All code is complete. SQL insert example is illustrative — actual product data must be gathered from Padelpoint site (Task 8 Step 2).

**Type consistency:**
- `CartItem.product_id` used consistently in context.tsx, CartDrawer, AddToCartButton
- `Product` type sourced from `Database['public']['Tables']['products']['Row']` throughout
- `useCart()` hook used in Nav, CartDrawer, AddToCartButton, ProductGrid — all client components
