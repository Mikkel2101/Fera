import Link from 'next/link'

export const metadata = {
  title: 'Betaling avbrutt — Fera Shop',
}

export default function ShopCheckoutCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-full bg-(--color-border) flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-(--color-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold text-(--color-text) mb-4">
          Betaling avbrutt
        </h1>
        <p className="text-(--color-muted) text-lg mb-10">
          Ingen bekymring — varene dine er fortsatt i handlekurven.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="bg-(--color-cta) text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
          >
            Tilbake til butikken
          </Link>
        </div>
      </div>
    </div>
  )
}
