import Link from 'next/link'

export default function TripNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 bg-[--color-bg]">
      <h1 className="font-display text-4xl font-bold text-[--color-text]">Tur ikke funnet</h1>
      <p className="text-[--color-muted] text-lg text-center max-w-md">
        Denne turen finnes ikke eller er ikke lenger tilgjengelig.
      </p>
      <Link
        href="/travels"
        className="bg-[--color-cta] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
      >
        Se alle turer →
      </Link>
    </div>
  )
}
