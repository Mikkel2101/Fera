'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function TravelsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl mb-4">😕</p>
      <h1 className="font-display font-bold text-2xl text-(--color-text) mb-2">Noe gikk galt</h1>
      <p className="text-(--color-muted) mb-6 max-w-sm">
        Vi kunne ikke laste reisene. Prøv igjen eller gå tilbake til forsiden.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-(--color-cta) text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          Prøv igjen
        </button>
        <Link
          href="/"
          className="border border-(--color-border) text-(--color-text) font-medium px-6 py-3 rounded-full hover:bg-(--color-surface) transition-colors"
        >
          Til forsiden
        </Link>
      </div>
    </div>
  )
}
