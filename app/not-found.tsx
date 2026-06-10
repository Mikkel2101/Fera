import Link from 'next/link'

export const metadata = {
  title: '404 — Side ikke funnet',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-(--color-dark) flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <img src="/fera-logo.svg" alt="Fera" className="h-10 w-auto brightness-0 invert mx-auto mb-10" />
      </div>
      <p className="text-(--color-sand) text-xs uppercase tracking-widest font-sans mb-4">404</p>
      <h1 className="font-display italic font-bold text-white text-4xl sm:text-5xl lg:text-6xl mb-4">
        Siden finnes ikke
      </h1>
      <p className="text-white/60 text-lg max-w-md leading-relaxed mb-10">
        Vi fant ikke siden du leter etter. Kanskje den ble fjernet, eller du tastet feil URL?
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="bg-white text-(--color-dark) font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-(--color-sand) transition-colors"
        >
          Tilbake til forsiden
        </Link>
        <Link
          href="/travels"
          className="border border-white/30 text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:border-white/60 transition-colors"
        >
          Se reiser
        </Link>
      </div>
    </div>
  )
}
