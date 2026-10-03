import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { safeNextPath } from '@/lib/auth/next-path'
import { LoginForm } from '@/components/shared/LoginForm'
import Nav from '@/components/shared/Nav'
import Footer from '@/components/shared/Footer'
import { CartProvider } from '@/lib/cart/context'

export const metadata: Metadata = {
  title:  'Logg inn — Fera',
  robots: { index: false },
}

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed:  'Innloggingen feilet eller lenken er utløpt. Prøv igjen.',
  missing_code: 'Innloggingslenken var ufullstendig. Prøv igjen.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next: rawNext, error } = await searchParams
  const next = safeNextPath(rawNext)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(next)

  const isBooking = next.includes('/book')

  return (
    <CartProvider>
      <Nav />
      <main className="min-h-[80vh] bg-(--color-sand-light) px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-(--color-border) bg-white p-8 sm:p-10">
          <h1 className="font-display text-3xl font-bold text-(--color-text)">
            {isBooking ? 'Logg inn for å reservere' : 'Logg inn på Fera'}
          </h1>
          <p className="mt-2 mb-8 text-sm text-(--color-muted)">
            {isBooking
              ? 'Med en Fera-konto finner du reservasjonen din under «Mine reiser», og vi kan holde deg oppdatert om turen.'
              : 'Én konto for reiser og bestillinger hos Fera.'}
          </p>

          {error && ERROR_MESSAGES[error] && (
            <p className="mb-6 rounded-lg bg-(--color-sand) px-4 py-3 text-sm text-(--color-text)" role="alert">
              {ERROR_MESSAGES[error]}
            </p>
          )}

          <LoginForm next={next} />
        </div>
      </main>
      <Footer />
    </CartProvider>
  )
}
