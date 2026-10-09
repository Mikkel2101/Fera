import Image from 'next/image'
import Link from 'next/link'

type InspirationPost = {
  category: string
  title: string
  excerpt: string
  date: string
  href: string
  src: string
  alt: string
}

const photos = 'https://dbvnuoayzevtoaolhqxd.supabase.co/storage/v1/object/public/photos'

const homepagePosts: InspirationPost[] = [
  {
    category: 'Inspirasjon',
    title: 'Costa Blanca: Spanias beste padeldestinasjon',
    excerpt: 'Hvorfor tusenvis av norske padel-entusiaster velger Costa Blanca som sin neste reisedestinasjon.',
    date: '5. juni 2026',
    href: '/travels/inspirasjon',
    src: `${photos}/palm-sunset.jpg`,
    alt: 'Padelbane med palmer og solnedgang',
  },
  {
    category: 'Klubbtur',
    title: 'Ta klubben med til Costa Blanca',
    excerpt: 'Skreddersydd padelreise for klubber med trening, sosialt samvær og nye opplevelser.',
    date: 'For klubber',
    href: '/travels/for-klubber',
    src: `${photos}/group-photo.jpg`,
    alt: 'Padelspillere samlet etter en kamp',
  },
  {
    category: 'Bedriftstur',
    title: 'Bedriftstur til Albir, perfekt teambuilding',
    excerpt: 'Se hvorfor Fera Padel er det naturlige valget for bedrifter som vil kombinere sport og sosialt.',
    date: '28. mai 2026',
    href: '/travels/for-bedrifter',
    src: `${photos}/group-photo.jpg`,
    alt: 'Fera-gruppen samlet på padelbanen',
  },
]

const shopPosts: InspirationPost[] = [
  ...homepagePosts.slice(0, 1),
  {
    category: 'Utstyr',
    title: 'Slik velger du riktig racket for ditt nivå',
    excerpt: 'Fra nybegynner til avansert. Vår guide hjelper deg å finne den perfekte padelracket.',
    date: '1. juni 2026',
    href: '/shop',
    src: `${photos}/player-fence.jpg`,
    alt: 'Spiller med padelracket',
  },
  homepagePosts[2],
]

export default function HomeInspirationSection({ variant = 'travels' }: { variant?: 'travels' | 'shop' }) {
  const posts = variant === 'shop' ? shopPosts : homepagePosts
  const isShop = variant === 'shop'

  return (
    <section className="py-28 overflow-hidden bg-(--color-sand-light)">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-2">Inspirasjon</p>
            <h2 className="font-sans font-normal text-(--color-text) text-4xl sm:text-5xl mb-4">Utforsk FERA-universet</h2>
            <p className="font-sans text-[18px] text-(--color-text) max-w-xl leading-relaxed">
              {isShop
                ? 'Les om tidligere padelreiser, få våre utstyrsanbefalinger og finn inspirasjon til deg som vil få mer ut av padel.'
                : 'Les om padelreisene våre, oppdag Costa Blanca og finn inspirasjon til din neste tur.'}
            </p>
          </div>
          <Link href="/travels/inspirasjon" className="text-(--color-cta) text-sm font-medium hover:underline hidden sm:block self-start">
            Se mer →
          </Link>
        </div>

        <div className="overflow-x-auto pb-6 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ marginRight: 'calc(-50vw + 50%)' }}>
          <div className="flex gap-6">
            {posts.map((post) => (
              <Link
                key={post.title}
                href={post.href}
                className="group flex-none w-[85vw] sm:w-[560px] lg:w-[640px] [scroll-snap-align:start]"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                  <Image
                    src={post.src}
                    alt={post.alt}
                    fill
                    sizes="640px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-5 left-5 text-[10px] uppercase tracking-widest text-white font-semibold bg-(--color-cta)/90 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <p className="text-(--color-muted) text-xs mb-2">{post.date}</p>
                <h3 className="font-sans font-normal text-(--color-text) text-2xl leading-snug mb-2 group-hover:text-(--color-cta) transition-colors">
                  {post.title}
                </h3>
                <p className="text-(--color-muted) text-sm leading-relaxed">{post.excerpt}</p>
              </Link>
            ))}
            <div className="flex-none w-4 sm:w-6 lg:w-8" />
          </div>
        </div>
      </div>
    </section>
  )
}