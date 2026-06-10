import Link from 'next/link'

export const metadata = {
  title: 'Bestilling bekreftet — Fera Shop',
}

export default function ShopCheckoutSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-full bg-(--color-success)/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-(--color-success)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold text-(--color-text) mb-4">
          Bestilling bekreftet!
        </h1>
        <p className="text-(--color-muted) text-lg mb-2">
          Tusen takk for kjøpet. Du vil motta en bekreftelse på e-post.
        </p>
        <p className="text-(--color-muted) text-sm mb-10">
          Produktene leveres fra Padelpoint og sendes innen 3–5 virkedager.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="bg-(--color-cta) text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
          >
            Fortsett å handle
          </Link>
          <Link
            href="/"
            className="border border-(--color-border) text-(--color-text) font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-(--color-ice-light) transition-colors"
          >
            Tilbake til forsiden
          </Link>
        </div>
      </div>
    </div>
  )
}
