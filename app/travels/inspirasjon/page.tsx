import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPublishedArticles } from '@/lib/articles/queries'
import { formatArticleDate } from '@/lib/articles/format'
import InspirasjonSearch from '@/components/travels/InspirasjonSearch'

export const metadata: Metadata = {
  title: 'Inspirasjon — FERA Travels',
  description: 'Reiserapporter, coaching og tips fra FERA Travels på Costa Blanca.',
}

const PHOTOS = 'https://dbvnuoayzevtoaolhqxd.supabase.co/storage/v1/object/public/photos'

export default async function InspirasjonPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const posts = await getPublishedArticles()
  const categories = Array.from(new Set(posts.map((post) => post.category)))

  const { category, q } = await searchParams
  const activeCategory = categories.find((c) => c === category) ?? null
  const categoryPosts = activeCategory
    ? posts.filter((post) => post.category === activeCategory)
    : posts
  const query = q?.trim().toLocaleLowerCase('nb-NO') ?? ''
  const visiblePosts = query
    ? categoryPosts.filter((post) =>
        `${post.title} ${post.excerpt} ${post.category}`.toLocaleLowerCase('nb-NO').includes(query)
      )
    : categoryPosts
  const featuredPost = visiblePosts[0]
  const latestPosts = visiblePosts

  return (
    <>
      <section className="bg-white pb-0 pt-10 sm:pt-14">
        <div className="mx-auto max-w-[1450px] px-4 sm:px-6">
          <h1 className="font-sans text-5xl font-semibold text-(--color-dark) sm:text-6xl">Inspirasjon</h1>
          <p className="mt-2 text-lg text-(--color-subtle)">
            Alt om våre reiser og destinasjoner — siste nytt, tips og inspirasjon, samlet på ett sted.
          </p>

          <div className="relative mt-6 flex flex-wrap items-center gap-3 sm:static sm:justify-between">
          <nav aria-label="Filtrer artikler" className="flex flex-wrap gap-1.5">
            <Link
              href="/travels/inspirasjon"
              aria-current={!activeCategory ? 'page' : undefined}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                !activeCategory
                  ? 'bg-(--color-cta) text-white'
                  : 'bg-(--color-sand-light) text-(--color-subtle) hover:bg-(--color-ice-light)'
              }`}
            >
              Utvalgt <span className="ml-1 text-[10px] opacity-70">{posts.length}</span>
            </Link>
            {categories.map((item) => (
              <Link
                key={item}
                href={`/travels/inspirasjon?category=${encodeURIComponent(item)}`}
                aria-current={activeCategory === item ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeCategory === item
                    ? 'bg-(--color-cta) text-white'
                    : 'bg-(--color-sand-light) text-(--color-subtle) hover:bg-(--color-ice-light)'
                }`}
              >
                {item} <span className="ml-1 text-[10px] opacity-70">{posts.filter((post) => post.category === item).length}</span>
              </Link>
            ))}
          </nav>
          <InspirasjonSearch activeCategory={activeCategory} defaultValue={q} />
          </div>
          <div className="mt-6 sm:mt-8 border-t border-(--color-border)" />
        </div>
      </section>

      {featuredPost && (
        <section className="pt-6 pb-10 sm:pt-8 sm:pb-14">
          <div className="mx-auto grid max-w-[1450px] gap-8 px-4 sm:px-6 lg:grid-cols-[1.55fr_1fr] lg:items-center">
            <Link
              href={`/travels/inspirasjon/${featuredPost.slug}`}
              className="group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-(--color-sand-light) lg:aspect-auto lg:h-[480px]"
            >
              {featuredPost.cover_image && (
                <Image
                  src={featuredPost.cover_image}
                  alt={featuredPost.cover_image_alt ?? ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  unoptimized
                  priority
                />
              )}
              <span className="absolute bottom-5 left-5 rounded-full bg-(--color-cta)/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
                {featuredPost.category}
              </span>
            </Link>
            <article className="flex flex-col items-start py-2 lg:h-full lg:py-8">
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-(--color-overline)">
                {formatArticleDate(featuredPost.published_at)} · {featuredPost.reading_minutes} min lesing
              </p>
              <Link href={`/travels/inspirasjon/${featuredPost.slug}`} className="group">
                <h2 className="font-sans text-4xl font-normal leading-tight text-(--color-dark) group-hover:text-(--color-dark-mid) sm:text-5xl">
                  {featuredPost.title}
                </h2>
              </Link>
              <p className="mt-4 max-w-xl leading-relaxed text-(--color-subtle)">{featuredPost.excerpt}</p>
              <div className="mt-8 flex w-full flex-wrap items-center justify-between gap-x-5 gap-y-3 lg:mt-auto">
                <p className="flex items-center gap-3 text-sm font-medium text-(--color-text)">
                  <span className="grid size-9 place-items-center rounded-full bg-(--color-ice) text-xs font-bold text-(--color-dark)">F</span>
                  Teamet i FERA
                </p>
                <Link
                  href={`/travels/inspirasjon/${featuredPost.slug}`}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-(--color-cta) underline decoration-(--color-border) underline-offset-4 hover:decoration-(--color-cta)"
                >
                  Les artikkelen <span aria-hidden="true" className="ml-2">→</span>
                </Link>
              </div>
            </article>
          </div>
        </section>
      )}

      {latestPosts.length > 0 && (
        <section className="border-t border-(--color-border) pt-12 pb-28 sm:pt-16 sm:pb-36">
          <div className="mx-auto max-w-[1450px] px-4 sm:px-6">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-(--color-subtle)">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-(--color-cta)" />
                  Nyeste artikler
                </p>
              </div>
              {activeCategory && (
                <Link href="/travels/inspirasjon" className="text-sm font-medium text-(--color-cta) hover:underline">
                  Vis alle
                </Link>
              )}
            </div>
            {/* Mobil — kompakt liste uten ingress, bilde på venstre side */}
            <div className="sm:hidden divide-y divide-(--color-border) border-t border-(--color-border)">
              {latestPosts.map((post) => (
                <Link key={post.slug} href={`/travels/inspirasjon/${post.slug}`} className="group flex gap-4 py-5">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-(--color-sand-light)">
                    {post.cover_image && (
                      <Image
                        src={post.cover_image}
                        alt={post.cover_image_alt ?? ''}
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-(--color-sand-light) px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-(--color-dark)">
                      {post.category}
                    </span>
                    <h3 className="mt-1.5 line-clamp-2 font-sans text-lg font-medium leading-snug text-(--color-dark) group-hover:text-(--color-dark-mid)">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-(--color-muted)">
                      {formatArticleDate(post.published_at)} — {post.reading_minutes} min lesing
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Nettbrett/desktop — grid med bilde og ingress */}
            <div className="hidden sm:grid grid-cols-2 gap-x-10 gap-y-14 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <Link key={post.slug} href={`/travels/inspirasjon/${post.slug}`} className="group">
                  <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-2xl bg-(--color-sand-light)">
                    {post.cover_image && (
                      <Image
                        src={post.cover_image}
                        alt={post.cover_image_alt ?? ''}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        unoptimized
                      />
                    )}
                    <span className="absolute bottom-4 left-4 rounded-full bg-(--color-cta)/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
                      {post.category}
                    </span>
                  </div>
                  <p className="mb-2 text-xs text-(--color-muted)">
                    {formatArticleDate(post.published_at)} · {post.reading_minutes} min lesing
                  </p>
                  <h3 className="line-clamp-2 font-sans text-2xl font-normal leading-snug text-(--color-dark) group-hover:text-(--color-dark-mid)">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-base leading-relaxed text-(--color-subtle)">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!activeCategory && (
        <section className="bg-(--color-community) py-20 text-white sm:py-28">
          <div className="mx-auto grid max-w-[1450px] gap-0 px-4 sm:px-6 md:grid-cols-[1fr_1.4fr] md:items-center md:gap-14">
            {/* md:block gjengir denne gruppen som normal blokk slik at overskrift/tekst/knapp havner i venstre kolonne på desktop; på mobil blir den usynlig (display: contents) slik at order-N under styrer rekkefølgen direkte. gap-0 på grid-containeren er bevisst — ellers arver de flate order-elementene grid-gapet som ekstra avstand oppå sine egne mt-klasser */}
            <div className="contents md:block md:max-w-xl">
              <p className="order-1 mb-3 text-xs font-medium uppercase tracking-[0.16em] text-(--color-overline-light)">Neste stopp</p>
              <h2 className="order-2 font-sans text-3xl font-normal leading-tight sm:text-4xl">Opplev Costa Blanca med FERA</h2>
              {/* Video kun i mobil-rekkefølgen her — den egentlige, synlige videoen på desktop ligger i høyrekolonnen under */}
              <div className="order-3 relative mt-7 aspect-[16/9] overflow-hidden rounded-2xl md:mt-0 md:hidden">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                  src="/fera-travels.mp4"
                />
              </div>
              <p className="order-4 mt-7 leading-snug text-white/75 md:mt-4 md:leading-relaxed">Gode baner, personlig coaching og tid til å nyte livet utenfor banen.</p>
              <Link href="/travels" className="order-5 mt-5 inline-flex min-h-11 w-fit items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-(--color-dark) transition-colors hover:bg-(--color-sand) md:mt-6">
                Se våre reiser <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>
            <div className="hidden md:block relative aspect-[16/9] overflow-hidden rounded-2xl">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                src="/fera-travels.mp4"
              />
            </div>
          </div>
        </section>
      )}
    </>
  )
}
