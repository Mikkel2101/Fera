import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { CONTACT_EMAIL, readUnsubscribeSecret } from '@/lib/newsletter/config'
import { verifyUnsubscribe } from '@/lib/newsletter/token'
import { unsubscribe } from '@/lib/newsletter/unsubscribe'

export const metadata: Metadata = {
  title: { absolute: 'Meld av nyhetsbrev — Fera Padel' },
  robots: { index: false, follow: false },
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// Avmelding skjer bare ved POST (knappen). E-postklienters lenkeskannere åpner
// lenker automatisk med GET, og skal ikke kunne melde folk av.
async function confirmUnsubscribe(formData: FormData) {
  'use server'
  const outcome = await unsubscribe(String(formData.get('e') ?? ''), String(formData.get('t') ?? ''))
  redirect(`/nyhetsbrev/avmeld?status=${outcome}`)
}

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-(--color-ice-light) flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white border border-(--color-border) rounded-2xl overflow-hidden">
        <p className="bg-(--color-dark) px-8 py-5 font-display font-bold tracking-[0.25em] text-white">FERA PADEL</p>
        <div className="px-8 py-10 space-y-4">
          <h1 className="font-display font-bold text-2xl text-(--color-text)">{title}</h1>
          {children}
        </div>
      </div>
    </main>
  )
}

const TEXT = 'text-(--color-subtle) leading-relaxed'
const contact = <a className="underline text-(--color-cta)" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>

const errorShell = (
  <Shell title="Noe gikk galt">
    <p className={TEXT}>Vi klarte ikke å melde deg av akkurat nå. Prøv igjen om litt, eller send en e-post til {contact}, så ordner vi det.</p>
  </Shell>
)

export default async function UnsubscribePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const status = first(params.status)

  if (status === 'ok') {
    return (
      <Shell title="Du er meldt av">
        <p className={TEXT}>Du får ikke flere nyhetsbrev fra Fera Padel. Ombestemmer du deg, kan du melde deg på igjen når som helst.</p>
      </Shell>
    )
  }
  const secret = readUnsubscribeSecret()
  if (status === 'error' || !secret) return errorShell

  const e = first(params.e)
  const t = first(params.t)
  const email = status === 'invalid' ? null : verifyUnsubscribe(e, t, secret)

  if (!email) {
    return (
      <Shell title="Lenken er ugyldig">
        <p className={TEXT}>
          Lenken er ugyldig eller ufullstendig. Kopier hele lenken fra e-posten, eller send en e-post til {contact}, så melder vi deg av.
        </p>
      </Shell>
    )
  }

  return (
    <Shell title="Meld av nyhetsbrev">
      <p className={TEXT}>Vil du slutte å få nyhetsbrev fra Fera Padel på <strong className="text-(--color-text)">{email}</strong>?</p>
      <form action={confirmUnsubscribe}>
        <input type="hidden" name="e" value={e} />
        <input type="hidden" name="t" value={t} />
        <button
          type="submit"
          className="bg-(--color-cta) text-white font-sans font-semibold rounded-full px-6 py-3 hover:bg-(--color-dark-mid) transition-colors"
        >
          Meld meg av
        </button>
      </form>
    </Shell>
  )
}
