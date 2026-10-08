import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reserver plass — Fera Padel',
}

export default async function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-(--color-surface)">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/travels/${id}`}
          className="text-(--color-subtle) text-sm hover:text-(--color-text)"
        >
          ← Tilbake til turen
        </Link>
        {children}
      </div>
    </div>
  )
}
