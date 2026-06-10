'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart/context'

type FormState = {
  first_name:     string
  last_name:      string
  email:          string
  phone:          string
  terms_accepted: boolean
}

type FieldError = Partial<Record<keyof FormState, string>>

export default function ShopCheckoutPage() {
  const { items, totalEur, clearCart } = useCart()
  const router = useRouter()

  const [form, setForm] = useState<FormState>({
    first_name:     '',
    last_name:      '',
    email:          '',
    phone:          '',
    terms_accepted: false,
  })
  const [errors,      setErrors]      = useState<FieldError>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError,  setServerError]  = useState('')

  // Redirect til shop hvis kurven er tom
  useEffect(() => {
    if (items.length === 0) router.replace('/shop')
  }, [items, router])

  const shippingEur = totalEur >= 200 ? 0 : 20
  const grandTotal  = totalEur + shippingEur

  function validate(): boolean {
    const e: FieldError = {}
    if (!form.first_name.trim())  e.first_name     = 'Fornavn er påkrevd'
    if (!form.last_name.trim())   e.last_name      = 'Etternavn er påkrevd'
    if (!form.email.includes('@')) e.email         = 'Ugyldig e-postadresse'
    if (!form.terms_accepted)     e.terms_accepted = 'Du må godta vilkårene'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setServerError('')

    try {
      const res = await fetch('/api/shop/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          items:          items,
          first_name:     form.first_name,
          last_name:      form.last_name,
          email:          form.email,
          phone:          form.phone || undefined,
          terms_accepted: form.terms_accepted,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        setServerError(data.error?.fieldErrors ? 'Fyll ut alle påkrevde felt' : (data.error ?? 'Noe gikk galt'))
        setIsSubmitting(false)
        return
      }

      clearCart()
      window.location.href = data.url
    } catch {
      setServerError('Noe gikk galt. Prøv igjen.')
      setIsSubmitting(false)
    }
  }

  function field(name: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setForm(prev => ({ ...prev, [name]: value }))
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  if (items.length === 0) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-(--color-text) mb-8">Kasse</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col gap-6">
          <section className="bg-white border border-(--color-border) rounded-2xl p-6">
            <h2 className="font-semibold text-(--color-text) mb-5">Kontaktinformasjon</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-(--color-muted)">Fornavn *</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={field('first_name')}
                  className="border border-(--color-border) rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-(--color-cta)"
                  autoComplete="given-name"
                />
                {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-(--color-muted)">Etternavn *</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={field('last_name')}
                  className="border border-(--color-border) rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-(--color-cta)"
                  autoComplete="family-name"
                />
                {errors.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <label className="text-sm text-(--color-muted)">E-post *</label>
              <input
                type="email"
                value={form.email}
                onChange={field('email')}
                className="border border-(--color-border) rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-(--color-cta)"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <label className="text-sm text-(--color-muted)">Telefon (valgfritt)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={field('phone')}
                className="border border-(--color-border) rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-(--color-cta)"
                autoComplete="tel"
              />
            </div>
          </section>

          {/* Vilkår */}
          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.terms_accepted}
                onChange={field('terms_accepted')}
                className="mt-0.5 accent-(--color-cta)"
              />
              <span className="text-sm text-(--color-text)">
                Jeg har lest og godtar{' '}
                <Link
                  href="/shop/levering-og-retur"
                  target="_blank"
                  className="text-(--color-cta) underline hover:opacity-80"
                >
                  leveringsvilkårene og returpolicyen
                </Link>
                , inkludert at returer er kundens ansvar.*
              </span>
            </label>
            {errors.terms_accepted && <p className="text-xs text-red-500">{errors.terms_accepted}</p>}
          </div>

          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-(--color-cta) text-white font-semibold py-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Åpner betaling…
              </>
            ) : (
              `Betal € ${grandTotal.toFixed(2)} →`
            )}
          </button>

          <p className="text-xs text-(--color-subtle) text-center">
            Betaling håndteres sikkert av Stripe. Adressen oppgis på neste side.
          </p>
        </form>

        {/* Ordresammendrag */}
        <aside className="lg:col-span-2">
          <div className="bg-white border border-(--color-border) rounded-2xl p-6 sticky top-4">
            <h2 className="font-semibold text-(--color-text) mb-5">Din bestilling</h2>

            <ul className="flex flex-col gap-4 mb-6">
              {items.map((item) => (
                <li key={item.product_id} className="flex gap-3">
                  <div className="relative w-14 h-14 bg-(--color-sand) rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🏓</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-(--color-text) leading-tight">{item.name}</p>
                    <p className="text-xs text-(--color-muted)">{item.brand} · ×{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-(--color-gold) shrink-0">
                    € {(item.price_eur * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-t border-(--color-border) pt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-(--color-muted)">
                <span>Varer</span>
                <span>€ {totalEur.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-(--color-muted)">
                <span>Frakt (UPS, {shippingEur === 0 ? 'gratis over €200' : 'Norge'})</span>
                <span>{shippingEur === 0 ? 'Gratis' : `€ ${shippingEur.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-(--color-text) text-base mt-1">
                <span>Totalt</span>
                <span>€ {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-(--color-ice-light) text-xs text-(--color-subtle)">
              Leveres om 3–5 virkedager med UPS fra Spania. Toll og avgifter betales separat til UPS.
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
