import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPublishedArticles } from '@/lib/articles/queries'
import { formatArticleDate } from '@/lib/articles/format'

export const metadata: Metadata = {
  title: 'Inspirasjon — Fera Travels',
  description: 'Reiserapporter, coaching og tips fra Fera Travels på Costa Blanca.',
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
      <section className="bg-white pb-8 pt-10 sm:pt-14">
        <div className="mx-auto max-w-[1450px] px-4 sm:px-6">
          <h1 className="font-sans text-4xl font-semibold text-(--color-dark) md:text-5xl lg:text-6xl">Inspirasjon</h1>
          <p className="mt-2 text-sm text-(--color-subtle)">
            Få siste nytt fra Fera Travel
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <form action="/travels/inspirasjon" method="get" role="search" className="flex w-full max-w-sm items-center gap-2 sm:w-auto">
            {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
            <label htmlFor="article-search" className="sr-only">Søk i artikler</label>
            <input
              id="article-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Søk i artikler"
              className="min-w-0 flex-1 border-b border-(--color-border) bg-transparent px-2 py-2 text-sm text-(--color-text) placeholder:text-(--color-muted) focus:border-(--color-cta) focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Søk"
              className="grid size-9 shrink-0 place-items-center rounded-md bg-(--color-sand-light) text-(--color-dark) transition-colors hover:bg-(--color-sand-warm)"
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>
          </form>
          </div>
        </div>
      </section>

      {featuredPost && (
        <section className="py-10 sm:py-14">
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
                  <span className="grid size-9 place-items-center rounded-full bg-(--color-sand) text-xs font-bold text-(--color-dark)">F</span>
                  Fera Travel
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
        <section className="border-t border-(--color-border) py-12 sm:py-16">
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
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
                  <h3 className="font-sans text-xl font-normal leading-snug text-(--color-dark) group-hover:text-(--color-dark-mid)">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-(--color-subtle)">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!activeCategory && (
        <section className="bg-(--color-community) py-12 text-white sm:py-16">
          <div className="mx-auto grid max-w-[1450px] gap-8 px-4 sm:px-6 md:grid-cols-[1fr_1.4fr] md:items-center md:gap-14">
            <div className="max-w-xl">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-(--color-overline-light)">Neste stopp</p>
              <h2 className="font-sans text-3xl font-normal leading-tight sm:text-4xl">Opplev Costa Blanca med Fera</h2>
              <p className="mt-4 leading-relaxed text-white/75">Gode baner, personlig coaching og tid til å nyte livet utenfor banen.</p>
              <Link href="/travels" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-(--color-dark) transition-colors hover:bg-(--color-sand)">
                Se våre reiser <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={`${PHOTOS}/palm-sunset.jpg`}
                alt="Padelbane ved palmer i solnedgang på Costa Blanca"
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </section>
      )}
    </>
  )
}
