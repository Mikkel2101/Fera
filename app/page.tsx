import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'
import TripCard from '@/components/travels/TripCard'
import Nav from '@/components/shared/Nav'
import CartDrawer from '@/components/shop/CartDrawer'
import HomeCartProvider from '@/components/home/HomeCartProvider'
import Footer from '@/components/shared/Footer'
import NewsletterSignup from '@/components/shared/NewsletterSignup'

export const metadata = {
  title: 'Fera Padel — Reiser og utstyr',
  description: 'Profesjonelle padelreiser til Spania og premium padelutstyr fra Padelpoint. Alt på ett sted.',
  openGraph: {
    title: 'Fera Padel — Reiser og utstyr',
    description: 'Profesjonelle padelreiser til Spania og premium padelutstyr fra Padelpoint.',
    url: 'https://ferabrand.com',
    siteName: 'Fera Padel',
    locale: 'nb_NO',
    type: 'website',
  },
}

const blogPosts = [
  {
    category: 'Inspirasjon',
    title: 'Costa Blanca — Spanias beste padeldestinasjon',
    excerpt: 'Hvorfor tusenvis av norske padel-entusiaster velger Costa Blanca som sin neste reisedestinasjon.',
    date: '5. juni 2026',
    href: '/travels/inspirasjon',
    src: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800&q=80',
    alt: 'Costa Blanca kystlinje',
  },
  {
    category: 'Utstyr',
    title: 'Slik velger du riktig racket for ditt nivå',
    excerpt: 'Fra nybegynner til avansert — vår guide hjelper deg å finne den perfekte padelracket.',
    date: '1. juni 2026',
    href: '/shop',
    src: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
    alt: 'Padelracket',
  },
  {
    category: 'Event',
    title: 'Bedriftstur til Albir — perfekt teambuilding',
    excerpt: 'Se hvorfor Fera Padel er det naturlige valget for bedrifter som vil kombinere sport og sosialt.',
    date: '28. mai 2026',
    href: '/travels/for-bedrifter',
    src: 'https://images.unsplash.com/photo-1526888935184-a82d2a4b7e67?w=800&q=80',
    alt: 'Bedriftstur padel',
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
          <div className="absolute inset-0 bg-gradient-to-r from-(--color-dark)/75 via-(--color-dark)/30 to-transparent" />
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

        {/* ── 1b. TRUST SIGNALS BAR ────────────────────────────── */}
        <section className="border-b border-(--color-border)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-(--color-border)">
              {[
                { stat: '100+', label: 'Reisende på ett år' },
                { stat: '5-stjernes', label: 'Coach — André Schlyter' },
                { stat: 'Padelpoint', label: 'Offisiell partner' },
                { stat: 'Stripe', label: 'Trygg betaling' },
              ].map((item) => (
                <div key={item.stat} className="text-center md:px-6">
                  <p className="font-display font-bold text-(--color-dark) text-lg sm:text-xl mb-1">{item.stat}</p>
                  <p className="text-(--color-muted) text-xs uppercase tracking-widest">{item.label}</p>
                </div>
              ))}
            </div>
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

        {/* ── 2b. SLIK FUNGERER DET ────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-(--color-ice-light)">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-3">Enkelt å komme i gang</p>
            <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl mb-14">Slik fungerer det</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-(--color-border)" />
              {[
                { num: '01', title: 'Velg tur', desc: 'Bla gjennom kommende turer og finn den som passer deg — åpen gruppe, klubbtur eller bedriftstur.' },
                { num: '02', title: 'Betal depositum', desc: 'Sett plassen din med kun €250 via Stripe. Alt er inkludert — kun kofferten mangler.' },
                { num: '03', title: 'Møt opp i Spania', desc: 'Vi fikser resten. Hotell, baner, coaching og opplevelser — alt er klart når du ankommer.' },
              ].map((step) => (
                <div key={step.num} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-(--color-border) flex items-center justify-center mb-4 relative z-10">
                    <span className="font-display font-bold text-(--color-dark) text-xl">{step.num}</span>
                  </div>
                  <h3 className="font-display font-bold text-(--color-text) text-xl mb-2">{step.title}</h3>
                  <p className="text-(--color-muted) text-sm leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. FERA REISER HOOK ───────────────────────────────── */}
        <section className="relative min-h-[75vh] flex items-center overflow-hidden">
          {/* Video background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="/travels-hero.webm"
          />
          <div className="absolute inset-0 bg-(--color-dark)/80" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
            {/* Overline */}
            <p className="text-white/50 text-xs tracking-[0.35em] uppercase font-sans mb-5">
              REIS MED FERA
            </p>

            {/* Heading */}
            <h2 className="text-white text-4xl sm:text-5xl lg:text-6xl leading-tight max-w-2xl mb-5">
              <span className="font-sans font-medium">Minnerike padelopplevelser i </span>
              <span className="font-display italic font-bold">Spania</span>
            </h2>

            {/* Subtitle */}
            <p className="text-white/70 text-lg max-w-lg leading-relaxed mb-8">
              Kofferten din. Ditt padel-spill. Vår jobb er resten — hotell, baner, coaching og opplevelser som slår alt du har gjort før.
            </p>

            {/* Trip tags */}
            {trips && trips.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-10">
                {trips.slice(0, 3).map((trip) => (
                  <span key={trip.id} className="bg-white/10 border border-white/20 text-white text-sm font-medium rounded-full px-4 py-2">
                    {trip.name}{trip.destination ? `, ${trip.destination}` : ''}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <Link
              href="/travels"
              className="inline-flex items-center gap-2 bg-white text-(--color-dark) font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-(--color-sand) transition-colors"
            >
              Se reiser →
            </Link>
          </div>
        </section>

        {/* ── 3b. KOMMENDE TURER ───────────────────────────────── */}
        {trips && trips.length > 0 && (
          <section className="py-24 px-4 sm:px-6 lg:px-8 bg-(--color-dark)">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-(--color-sand)/60 text-xs uppercase tracking-widest font-medium mb-2">Neste tur</p>
                  <h2 className="font-display italic font-bold text-white text-3xl sm:text-4xl">Kommende turer</h2>
                </div>
                <Link href="/travels" className="text-(--color-sand) text-sm font-medium hover:underline hidden sm:block">
                  Se alle turer →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/travels" className="inline-block border border-white/20 text-white text-sm font-medium px-7 py-3 rounded-full hover:border-white/50 transition-colors sm:hidden">
                  Se alle turer →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── 3c. TESTIMONIALS ─────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-(--color-sand)">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-(--color-cta) text-xs uppercase tracking-widest font-medium mb-3">Hva sier reisende</p>
              <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl">
                Over 100 fornøyde gjester
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: 'Den beste ferien jeg har hatt på år og dag. Kombinasjonen av padel, sol og et supert sosialt miljø var akkurat det vi trengte. Petter og André er rett og slett fantastiske verter.',
                  name: 'Marte H.',
                  role: 'Oslo',
                  stars: 5,
                },
                {
                  quote: 'Vi tok med hele laget på bedriftstur og det overgikk alle forventninger. Profesjonell coaching, perfekte baner og en gruppe som er smidd for evigheten. Anbefales på det varmeste!',
                  name: 'Kristoffer V.',
                  role: 'Bergen',
                  stars: 5,
                },
                {
                  quote: 'Jeg reiste alene og var litt spent, men trengte overhodet ikke være det. Gruppen var varm og inkluderende fra dag én. Booker igjen til høsten!',
                  name: 'Ingrid S.',
                  role: 'Trondheim',
                  stars: 5,
                },
              ].map((t) => (
                <div key={t.name} className="bg-white rounded-2xl p-8 border border-(--color-border)">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-(--color-gold)">
                        <path d="M8 1l1.854 3.757L14 5.457l-3 2.923.708 4.13L8 10.427l-3.708 2.083L5 8.38 2 5.457l4.146-.7L8 1z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-(--color-text) text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                  <div>
                    <p className="font-semibold text-(--color-text) text-sm">{t.name}</p>
                    <p className="text-(--color-muted) text-xs">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-2">Fra bloggen</p>
                <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl">Nyheter & inspirasjon</h2>
              </div>
              <Link href="/travels/inspirasjon" className="text-(--color-cta) text-sm font-medium hover:underline hidden sm:block">
                Se mer →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link key={post.title} href={post.href} className="group block">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                    <Image
                      src={post.src}
                      alt={post.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-white font-semibold bg-(--color-cta)/90 px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <p className="text-(--color-muted) text-xs mb-2">{post.date}</p>
                  <h3 className="font-display font-bold text-(--color-text) text-lg leading-snug mb-2 group-hover:text-(--color-cta) transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-(--color-muted) text-sm leading-relaxed">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. SOSIALE MEDIER + INSTAGRAM ────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-sand)">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-(--color-cta) text-xs uppercase tracking-widest font-medium mb-3">Sosiale medier</p>
                <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl mb-4">
                  Følg oss på<br />Instagram
                </h2>
                <p className="text-(--color-text)/70 text-base leading-relaxed mb-6">
                  Daglige oppdateringer fra banen, turene og alt det fine imellom. Se hva som skjer i Fera-verdenen.
                </p>
                <a
                  href="https://instagram.com/fera.padel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-(--color-dark) text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @fera.padel
                </a>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { src: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80', alt: 'Padel bane' },
                  { src: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80', alt: 'Trening' },
                  { src: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&q=80', alt: 'Utsikt' },
                  { src: 'https://images.unsplash.com/photo-1526888935184-a82d2a4b7e67?w=400&q=80', alt: 'Gruppe' },
                  { src: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=400&q=80', alt: 'Strand' },
                  { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', alt: 'Pool' },
                ].map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="150px"
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      <NewsletterSignup />
      <Footer />
    </HomeCartProvider>
  )
}
