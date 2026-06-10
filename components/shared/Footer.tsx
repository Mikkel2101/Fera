import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-(--color-dark) text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <img src="/fera-logo.svg" alt="Fera" className="h-8 w-auto brightness-0 invert" />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Profesjonelle padelopplevelser — reiser til Spania og premium utstyr fra Padelpoint.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/fera.padel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50 hover:bg-white/10 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Reiser */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Reiser</h4>
            <ul className="space-y-3">
              <li><Link href="/travels" className="text-white/50 text-sm hover:text-white transition-colors">Se alle turer</Link></li>
              <li><Link href="/travels/for-klubber" className="text-white/50 text-sm hover:text-white transition-colors">For klubber & trenere</Link></li>
              <li><Link href="/travels/for-bedrifter" className="text-white/50 text-sm hover:text-white transition-colors">For bedrifter</Link></li>
              <li><Link href="/travels/inspirasjon" className="text-white/50 text-sm hover:text-white transition-colors">Inspirasjon</Link></li>
              <li><Link href="/travels/faq" className="text-white/50 text-sm hover:text-white transition-colors">Vanlige spørsmål</Link></li>
            </ul>
          </div>

          {/* Shop & Om oss */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Nettbutikk</h4>
            <ul className="space-y-3 mb-8">
              <li><Link href="/shop" className="text-white/50 text-sm hover:text-white transition-colors">Alle produkter</Link></li>
              <li><Link href="/shop?kategori=racket" className="text-white/50 text-sm hover:text-white transition-colors">Racketer</Link></li>
              <li><Link href="/shop?kategori=shoes" className="text-white/50 text-sm hover:text-white transition-colors">Sko</Link></li>
              <li><Link href="/shop?kategori=bag" className="text-white/50 text-sm hover:text-white transition-colors">Vesker</Link></li>
              <li><Link href="/shop?kategori=balls" className="text-white/50 text-sm hover:text-white transition-colors">Baller</Link></li>
            </ul>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Om oss</h4>
            <ul className="space-y-3">
              <li><Link href="/travels/om-oss" className="text-white/50 text-sm hover:text-white transition-colors">Teamet</Link></li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Kontakt</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:post@ferabrand.com" className="text-white/50 text-sm hover:text-white transition-colors">
                  post@ferabrand.com
                </a>
              </li>
              <li className="text-white/50 text-sm">Instagram: @fera.padel</li>
            </ul>
            <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5">
              <p className="text-white/70 text-xs leading-relaxed">
                Har du spørsmål om reiser eller utstyr?<br />
                Vi svarer innen 24 timer.
              </p>
              <a
                href="mailto:post@ferabrand.com"
                className="mt-3 inline-block text-xs text-(--color-sand) hover:text-white transition-colors font-medium"
              >
                Send e-post →
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Fera Padel AS · Alle rettigheter forbeholdt
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>Offisiell Padelpoint-partner</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Trygg betaling via Stripe</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
