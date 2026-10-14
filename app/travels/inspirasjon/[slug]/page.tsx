import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import ArticleBody from '@/components/articles/ArticleBody'
import ArticleShareButtons from '@/components/articles/ArticleShareButtons'
import { getPublishedArticle } from '@/lib/articles/queries'
import { readingTimeMinutes } from '@/lib/articles/content'
import { formatArticleDate } from '@/lib/articles/format'

function CategoryBadge({ category }: { category: string }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-(--color-muted)">Kategori</p>
      <span className="inline-block rounded-full bg-(--color-sand-light) px-3 py-1 text-xs font-semibold text-(--color-dark)">
        {category}
      </span>
    </div>
  )
}

// Databasen har foreløpig bare forfatterens navn og rolle, ikke bilde.
function AuthorBlock({ authorName, authorRole }: { authorName: string; authorRole: string | null }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-(--color-muted)">Skrevet av</p>
      <p className="text-sm font-semibold text-(--color-text)">{authorName}</p>
      {authorRole && <p className="text-xs text-(--color-muted)">{authorRole}</p>}
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getPublishedArticle(slug)
  if (!article) return { title: 'Ikke funnet' }
  const description = article.meta_description ?? article.excerpt
  return {
    title: `${article.title} — FERA Padel`,
    description,
    openGraph: {
      title: article.title,
      description,
      images: article.cover_image ? [{ url: article.cover_image }] : [],
      type: 'article',
      locale: 'nb_NO',
      publishedTime: article.published_at ?? undefined,
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getPublishedArticle(slug)
  if (!article) notFound()

  const readingMinutes = readingTimeMinutes(article.content)

  return (
    <article className="max-w-[1450px] mx-auto px-4 pt-6 pb-10 sm:px-6 lg:px-8 lg:pt-8 lg:pb-14">
      {/* max-w-[1440px] uten egen mx-auto — holder innholdet venstrejustert med logoen, ikke sentrert i viewporten */}
      <div className="max-w-[1440px]">
      {/* Mobil/nettbrett — ikke sticky, under 1024px ligger den over innholdet i stedet for i sidekolonnen */}
      <Link
        href="/travels/inspirasjon"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-(--color-subtle) transition-colors hover:text-(--color-text) lg:hidden"
      >
        <span aria-hidden="true" className="size-1.5 rounded-full bg-(--color-cta)" />
        Inspirasjon
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[160px_1fr] lg:gap-40">
        {/* Sidebar — kun desktop, under 1024px flyter innholdet over i hovedkolonnen i stedet */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start lg:pt-6">
          <Link
            href="/travels/inspirasjon"
            className="mb-12 inline-flex items-center gap-2 text-base font-medium text-(--color-subtle) transition-colors hover:text-(--color-text)"
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-(--color-cta)" />
            Inspirasjon
          </Link>
          <div className="flex flex-col gap-12">
            <CategoryBadge category={article.category} />
            {article.author_name && <AuthorBlock authorName={article.author_name} authorRole={article.author_role} />}
          </div>
          <div className="mt-10">
            <ArticleShareButtons title={article.title} />
          </div>
        </aside>

        {/* Innhold */}
        <div className="min-w-0 max-w-[900px] lg:pt-6">
          <div className="mb-4 lg:hidden">
            <CategoryBadge category={article.category} />
          </div>

          <h1 className="font-sans text-(--color-text) text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <p className="mt-4 text-sm text-(--color-muted)">
            {formatArticleDate(article.published_at)} — {readingMinutes} min lesing
          </p>

          {article.cover_image && (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-(--color-sand-light)">
              <Image
                src={article.cover_image}
                alt={article.cover_image_alt ?? ''}
                fill
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          )}

          <div className="mt-8 space-y-6 lg:hidden">
            {article.author_name && <AuthorBlock authorName={article.author_name} authorRole={article.author_role} />}
            <ArticleShareButtons title={article.title} />
          </div>

          <div className="mt-10">
            <ArticleBody doc={article.content} />
          </div>

          {/* CTA */}
          <div className="mt-16 border-t border-(--color-border) pt-10">
            <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-2">Klar for turen?</p>
            <p className="font-display font-bold text-(--color-text) text-2xl mb-5">
              Se kommende padelreiser til Spania
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/travels"
                className="bg-(--color-cta) text-white font-semibold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
              >
                Se alle turer →
              </Link>
              <Link
                href="/travels/inspirasjon"
                className="border border-(--color-border) text-(--color-subtle) text-sm px-6 py-3 rounded-full hover:border-(--color-dark) hover:text-(--color-text) transition-colors"
              >
                ← Tilbake til inspirasjon
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </article>
  )
}
