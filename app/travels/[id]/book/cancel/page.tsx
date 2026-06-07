import Link from 'next/link'

export default async function BookCancelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="max-w-lg mx-auto py-16 text-center px-4">
      <div className="text-6xl text-(--color-cta) mb-6">✕</div>
      <h1 className="font-display text-3xl font-semibold text-(--color-text) mb-4">
        Betalingen ble avbrutt
      </h1>
      <p className="text-(--color-muted) mb-8">
        Bookingen din ble ikke fullført. Ingen beløp er trukket.
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href={`/travels/${id}/book`}
          className="bg-(--color-cta) text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Prøv igjen →
        </Link>
        <Link
          href={`/travels/${id}`}
          className="text-(--color-subtle) hover:text-(--color-text) text-sm transition-colors"
        >
          Tilbake til turen
        </Link>
      </div>
    </div>
  )
}
