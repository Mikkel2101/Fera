export const metadata = {
  title: 'Inspirasjon — Fera',
  description: 'Bilder og øyeblikk fra reiser vi har arrangert. Følg oss på Instagram for å se alt som skjer.',
}

const photos = [
  { bg: 'from-orange-900 to-orange-700', label: 'På banen' },
  { bg: 'from-slate-700 to-slate-900', label: 'Gruppen' },
  { bg: 'from-green-900 to-green-700', label: 'Trening' },
  { bg: 'from-blue-900 to-cyan-700', label: 'Destinasjon' },
  { bg: 'from-purple-900 to-indigo-700', label: 'Kvelds-padel' },
  { bg: 'from-red-900 to-red-700', label: 'Turnering' },
  { bg: 'from-yellow-800 to-amber-600', label: 'Sol og bane' },
]

export default function InspirasjonPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-(--color-dark) to-(--color-dark-mid) px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-(--color-gold) text-xs tracking-widest uppercase font-sans mb-4">Innblikk</p>
          <h1 className="font-display text-white text-4xl md:text-6xl font-bold leading-tight mb-6">
            Inspirasjon fra{' '}
            <em className="italic text-(--color-sand)">våre turer</em>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Bilder og øyeblikk fra reiser vi har arrangert. Følg oss på Instagram for å se alt som skjer.
          </p>
          <a
            href="https://instagram.com/feratravels"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-(--color-dark) font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-(--color-sand) transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Følg @feratravels
          </a>
        </div>
      </section>

      {/* Instagram-seksjon */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-widest text-(--color-gold) font-medium mb-2">Instagram</p>
          <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl mb-3">@feratravels</h2>
          <p className="text-(--color-muted)">Følg oss for daglige oppdateringer, treningsvideoer og reiseinspiration.</p>
        </div>

        {/* Photo grid */}
        <div className="max-w-5xl mx-auto">
          <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-6">Høydepunkter</p>
          <h3 className="font-display italic font-bold text-(--color-text) text-2xl mb-8">Fra våre reiser</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-10">
            {photos.map((p, i) => (
              <div key={i} className={`aspect-square rounded-xl bg-gradient-to-br ${p.bg} flex items-end p-3 overflow-hidden`}>
                <span className="text-white/60 text-xs uppercase tracking-widest">{p.label}</span>
              </div>
            ))}
          </div>

          <a
            href="https://instagram.com/feratravels"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-(--color-border) text-(--color-text) font-semibold text-sm px-7 py-3 rounded-full hover:bg-(--color-ice-light) transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Se mer på Instagram
          </a>
        </div>
      </section>
    </>
  )
}
