import Image from 'next/image'

export const metadata = {
  title: 'Inspirasjon — Fera Travels',
  description: 'Bilder og øyeblikk fra padelreiser vi har arrangert til Costa Blanca og Spania.',
}

const highlights = [
  {
    src: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
    alt: 'Padelbane i solen',
    label: 'På banen',
    span: 'col-span-2 row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1526888935184-a82d2a4b7e67?w=600&q=80',
    alt: 'Padel gruppe',
    label: 'Gruppen',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80',
    alt: 'Treningsøkt padel',
    label: 'Coaching',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    alt: 'Hotell pool Costa Blanca',
    label: 'Hotell & pool',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1471967183320-ee018f6e114a?w=600&q=80',
    alt: 'Spansk kystlinje',
    label: 'Destinasjon',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80',
    alt: 'Sport og velvære',
    label: 'Velvære',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80',
    alt: 'Middag i Spania',
    label: 'Mat & drikke',
    span: '',
  },
]

const stories = [
  {
    category: 'Reiserapport',
    title: 'En uke i Albir — slik var det',
    excerpt: 'Femten padel-entusiaster fra Oslo. Sju dager med sol, padel og gode minner. Her er alt som skjedde.',
    date: '20. mai 2026',
    src: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800&q=80',
    alt: 'Solnedgang ved Albir',
  },
  {
    category: 'Coaching',
    title: 'Hva skjer egentlig på en coaching-økt med André?',
    excerpt: 'André Schlyter er ikke en vanlig trener. Vi tok med kamera på banen for å vise deg hva du kan forvente.',
    date: '12. mai 2026',
    src: 'https://images.unsplash.com/photo-1544298621-a28e56a7e29e?w=800&q=80',
    alt: 'Padel coaching på bane',
  },
  {
    category: 'Destinasjon',
    title: 'Derfor elsker vi Costa Blanca',
    excerpt: '300 soldager i året, fantastiske padelsentre og mat som slår alt. Vi forteller deg hvorfor Costa Blanca er det perfekte padelreisemålet.',
    date: '3. mai 2026',
    src: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80',
    alt: 'Costa Blanca utsikt',
  },
]

export default function InspirasjonPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-(--color-dark) to-(--color-dark-mid) px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-white/50 text-xs tracking-widest uppercase font-sans mb-4">Innblikk</p>
          <h1 className="font-display text-white text-4xl md:text-6xl font-bold leading-tight mb-6">
            Inspirasjon fra{' '}
            <em className="italic text-(--color-sand)">våre turer</em>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Øyeblikk fra banen, hotellet og alle opplevelsene imellom. Slik ser en Fera-tur ut.
          </p>
          <a
            href="https://instagram.com/fera.padel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-(--color-dark) font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-(--color-sand) transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Følg @fera.padel
          </a>
        </div>
      </section>

      {/* Photo grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-2">Høydepunkter</p>
            <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl">Fra våre reiser</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 auto-rows-[200px]">
            {highlights.map((p, i) => (
              <div
                key={i}
                className={`relative rounded-xl overflow-hidden group ${p.span}`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute bottom-3 left-3 text-white text-xs font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories / Reiserapporter */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-ice-light)">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-2">Reiseblogg</p>
            <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl">Historier fra banen</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map((story) => (
              <article key={story.title} className="group bg-white rounded-2xl overflow-hidden border border-(--color-border) hover:shadow-lg transition-shadow">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={story.src}
                    alt={story.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur text-[10px] font-semibold px-2.5 py-1 rounded-full text-(--color-cta) uppercase tracking-widest">
                      {story.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-(--color-muted) text-xs mb-2">{story.date}</p>
                  <h3 className="font-display font-bold text-(--color-text) text-lg leading-snug mb-2 group-hover:text-(--color-cta) transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-(--color-muted) text-sm leading-relaxed">{story.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-3">Mer innhold</p>
          <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl mb-4">
            Følg oss på Instagram
          </h2>
          <p className="text-(--color-muted) mb-8">
            Daglige oppdateringer fra banen, turene og alt det fine som skjer mellom kampene.
          </p>
          <a
            href="https://instagram.com/fera.padel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-(--color-cta) text-white font-semibold text-sm px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            @fera.padel på Instagram
          </a>
        </div>
      </section>
    </>
  )
}
