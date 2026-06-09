import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'
import Nav from '@/components/shared/Nav'
import CartDrawer from '@/components/shop/CartDrawer'
import HomeCartProvider from '@/components/home/HomeCartProvider'

export const metadata = {
  title: 'Fera Padel — Reiser og utstyr',
  description: 'Profesjonelle padelreiser til Spania og premium padelutstyr fra Padelpoint. Alt på ett sted.',
}

const blogPosts = [
  {
    category: 'Inspirasjon',
    title: 'Costa Blanca — Spanias beste padeldestinasjon',
    excerpt: 'Hvorfor tusenvis av norske padel-entusiaster velger Costa Blanca som sin neste reisedestinasjon.',
    date: '5. juni 2026',
  },
  {
    category: 'Utstyr',
    title: 'Slik velger du riktig racket for ditt nivå',
    excerpt: 'Fra nybegynner til avansert — vår guide hjelper deg å finne den perfekte padelracket.',
    date: '1. juni 2026',
  },
  {
    category: 'Event',
    title: 'Bedriftstur til Albir — perfekt teambuilding',
    excerpt: 'Se hvorfor Fera Padel er det naturlige valget for bedrifter som vil kombinere sport og sosialt.',
    date: '28. mai 2026',
  },
]

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: newProducts }, { data: trips }, { data: bestSellers }] = await Promise.all([
    supabase.from('products').select('*').eq('published', true).order('created_at', { ascending: false }).limit(4),
    supabase.from('trips').select('*').eq('published', true).order('start_date', { ascending: true }).limit(4),
    supabase.from('products').select('*').eq('published', true).order('name').range(4, 7),
  ])

  return (
    <HomeCartProvider>
      <Nav />
      <CartDrawer />
      <main>

        {/* ── 1. HERO ─────────────────────────────────────────── */}
        <section className="relative min-h-[88vh] flex items-center bg-(--color-dark) overflow-hidden">
          {/* Hero background image */}
          <div className="absolute inset-0"
            style={{ backgroundImage: 'url(/Hero.png)', backgroundSize: 'cover', backgroundPosition: 'center 30%' }}
          />
          {/* Gradient only at left/bottom so text is readable */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, color-mix(in srgb, var(--color-dark) 75%, transparent) 0%, color-mix(in srgb, var(--color-dark) 30%, transparent) 60%, transparent 100%)' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
            <p className="text-white/50 text-xs tracking-[0.35em] uppercase font-sans mb-6">
              PADEL · SOL · SOSIALT
            </p>
            <h1 className="font-display italic font-bold text-white text-5xl sm:text-6xl lg:text-7xl leading-tight max-w-3xl mb-6">
              Profesjonelle<br />
              <em className="not-italic text-(--color-sand)">padelopplevelser</em><br />
              fra Norge
            </h1>
            <p className="text-white/70 text-lg max-w-xl leading-relaxed mb-10">
              Vi kombinerer eksklusive padelreiser til Spania med premium utstyr direkte fra Padelpoint. Du møter opp — vi ordner resten.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/travels"
                className="bg-white text-(--color-dark) font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-(--color-sand) transition-colors"
              >
                Se kommende turer →
              </Link>
              <Link
                href="/shop"
                className="border border-white/40 text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:border-white/80 transition-colors"
              >
                Shop utstyr
              </Link>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </section>

        {/* ── 2. PRODUKTNYHETER ────────────────────────────────── */}
        {newProducts && newProducts.length > 0 && (
          <section className="py-28 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-2">Nytt inn</p>
                  <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl">Produktnyheter</h2>
                </div>
                <Link href="/shop" className="text-(--color-cta) text-sm font-medium hover:underline hidden sm:block">
                  Se alle produkter →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-(--color-border)">
                {newProducts.map((product) => (
                  <div key={product.id} className="bg-white p-4">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 3. FERA REISER HOOK ───────────────────────────────── */}
        <Link href="/travels" className="block group">
          <section className="bg-(--color-dark) py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden cursor-pointer">
            {/* Subtle radial glow */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(ellipse at 50% 100%, var(--color-dark-mid) 0%, transparent 70%)' }}
            />

            <div className="max-w-7xl mx-auto relative">
              {/* Top label */}
              <p className="text-white/40 text-xs tracking-[0.3em] uppercase font-medium mb-6 text-center">
                EKSKLUSIVT · BEGRENSET ANTALL PLASSER · 2026
              </p>

              {/* Main headline */}
              <h2 className="font-display italic font-bold text-white text-4xl sm:text-5xl lg:text-6xl text-center leading-tight mb-6">
                Opplev <em className="not-italic text-(--color-sand)">Fera Reiser</em>
              </h2>

              <p className="text-white/60 text-lg text-center max-w-2xl mx-auto mb-12 leading-relaxed">
                Hotell, baner, coaching og sosiale opplevelser i Spania — alt inkludert. Du møter opp, vi ordner resten. Turene fylles raskt.
              </p>

              {/* Stats row */}
              <div className="flex justify-center gap-12 sm:gap-20 mb-14">
                {[
                  { number: '7', label: 'netter' },
                  { number: '20', label: 'maks deltakere' },
                  { number: '100%', label: 'inkludert' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-display italic font-bold text-(--color-sand) text-3xl sm:text-4xl">{stat.number}</p>
                    <p className="text-white/40 text-xs uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Trip teasers */}
              {trips && trips.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                  {trips.map((trip) => {
                    const spotsLeft = (trip.max_participants ?? 20) - (trip.registered_count ?? 0)
                    const urgent = spotsLeft <= 5
                    return (
                      <div key={trip.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2.5">
                        <span className="text-white text-sm font-medium">{trip.name}</span>
                        <span className={`text-xs font-semibold ${urgent ? 'text-red-400' : 'text-white/40'}`}>
                          {spotsLeft <= 0 ? '● Utsolgt' : urgent ? `● ${spotsLeft} igjen` : `${spotsLeft} plasser`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* CTA */}
              <div className="text-center">
                <span className="inline-flex items-center gap-2 bg-white text-(--color-dark) font-semibold text-sm px-8 py-4 rounded-full group-hover:bg-(--color-sand) transition-colors">
                  Se alle turer og book din plass
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
          </section>
        </Link>

        {/* ── 4. BESTSELGERE ───────────────────────────────────── */}
        {bestSellers && bestSellers.length > 0 && (
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-ice-light)">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-2">Populære valg</p>
                  <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl">Bestselgere</h2>
                </div>
                <Link href="/shop" className="text-(--color-cta) text-sm font-medium hover:underline hidden sm:block">
                  Se hele sortimentet →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 5. NYHETER & INSPIRASJON ─────────────────────────── */}
        <section className="py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-2">Fra bloggen</p>
              <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl">Nyheter & inspirasjon</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <article key={post.title} className="group cursor-pointer">
                  <div className="aspect-[4/3] bg-(--color-ice) rounded-2xl mb-5 flex items-end p-6">
                    <span className="text-xs uppercase tracking-widest text-(--color-cta) font-semibold">{post.category}</span>
                  </div>
                  <p className="text-(--color-muted) text-xs mb-2">{post.date}</p>
                  <h3 className="font-display font-bold text-(--color-text) text-lg leading-snug mb-2 group-hover:text-(--color-cta) transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-(--color-muted) text-sm leading-relaxed">{post.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. INSTAGRAM ─────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-sand)">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-(--color-muted) text-xs uppercase tracking-widest font-medium mb-2">Sosiale medier</p>
              <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl mb-2">Følg oss</h2>
              <p className="text-(--color-muted)">@fera.padel</p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-(--color-dark)/10 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer">
                  <svg className="w-6 h-6 text-(--color-dark)/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <a href="https://instagram.com/feratravels" target="_blank" rel="noopener noreferrer"
                className="inline-block bg-(--color-dark) text-white text-sm font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
                Følg oss på Instagram
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ── 7. FOOTER ────────────────────────────────────────── */}
      <footer className="bg-(--color-dark) text-white/70 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <span className="font-display italic font-bold text-white text-2xl block mb-4">Fera</span>
            <p className="text-sm leading-relaxed">
              Profesjonelle padelopplevelser — reiser til Spania og premium utstyr fra Padelpoint.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Tjenester</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/travels" className="hover:text-white transition-colors">Padelreiser</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Padelutstyr</Link></li>
              <li><Link href="/travels" className="hover:text-white transition-colors">Bedriftsturer</Link></li>
              <li><Link href="/travels" className="hover:text-white transition-colors">Klubbturer</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Kontakt</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:post@feratravels.com" className="hover:text-white transition-colors">post@feratravels.com</a></li>
              <li>+47 414 94 200</li>
              <li>Instagram: @feratravels</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-xs text-white/40">
          © {new Date().getFullYear()} Fera Padel AS
        </div>
      </footer>
    </HomeCartProvider>
  )
}
