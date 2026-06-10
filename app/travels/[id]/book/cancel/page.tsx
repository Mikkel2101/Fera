import Link from 'next/link'

export default async function BookCancelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-(--color-border) flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-(--color-muted)">
              <path d="M8 8l16 16M24 8L8 24"/>
            </svg>
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-(--color-text) mb-3">
          Betaling avbrutt
        </h1>
        <p className="text-(--color-muted) mb-2">
          Bookingen din ble ikke fullført. Ingen beløp er trukket fra kortet ditt.
        </p>
        <p className="text-(--color-muted) text-sm mb-10">
          Du kan prøve igjen når du er klar.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/travels/${id}/book`}
            className="bg-(--color-cta) text-white px-7 py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            Prøv igjen →
          </Link>
          <Link
            href={`/travels/${id}`}
            className="border border-(--color-border) text-(--color-text) px-7 py-3.5 rounded-full font-medium hover:bg-(--color-ice-light) transition-colors text-sm"
          >
            Tilbake til turen
          </Link>
        </div>
      </div>
    </div>
  )
}
