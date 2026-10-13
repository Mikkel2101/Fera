import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPost, posts, type Author } from '../posts'
import ArticleShareButtons from '@/components/articles/ArticleShareButtons'

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

function AuthorBlock({ author }: { author: Author }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-(--color-muted)">Skrevet av</p>
      <div className="flex items-center gap-2.5">
        <div className="relative size-9 shrink-0 overflow-hidden rounded-full">
          <Image src={author.photo} alt={author.name} fill sizes="36px" className="object-cover" />
        </div>
        <div>
          <p className="text-sm font-semibold text-(--color-text)">{author.name}</p>
          <p className="text-xs text-(--color-muted)">{author.role}</p>
        </div>
      </div>
    </div>
  )
}

import EnUkeIAlbir from '../content/en-uke-i-albir'
import CoachingMedAndre from '../content/coaching-med-andre'
import DerforElskerViCostaBlanca from '../content/derfor-elsker-vi-costa-blanca'

const contentMap: Record<string, React.FC> = {
  'en-uke-i-albir': EnUkeIAlbir,
  'coaching-med-andre': CoachingMedAndre,
  'derfor-elsker-vi-costa-blanca': DerforElskerViCostaBlanca,
}

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Ikke funnet' }
  return {
    title: `${post.title} — Fera Padel`,
    description: post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      images: [{ url: post.image }],
      type: 'article',
      locale: 'nb_NO',
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const Content = contentMap[slug]
  if (!Content) notFound()

  return (
    <article className="max-w-[1450px] mx-auto px-4 pt-6 pb-10 sm:px-6 lg:px-8 lg:pt-8 lg:pb-14">
      {/* max-w-[1440px] uten egen mx-auto — holder innholdet venstrejustert med logoen, ikke sentrert i viewporten */}
      <div className="max-w-[1440px]">
      <Link
        href="/travels/inspirasjon"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-(--color-subtle) transition-colors hover:text-(--color-text)"
      >
        <span aria-hidden="true" className="size-1.5 rounded-full bg-(--color-cta)" />
        Aktuelt
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
        {/* Sidebar — kun desktop, under 1024px flyter kategori/forfatter/del med i hovedkolonnen i stedet */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="flex flex-col gap-8">
            <CategoryBadge category={post.category} />
            <AuthorBlock author={post.author} />
          </div>
          <div className="mt-6">
            <ArticleShareButtons title={post.title} />
          </div>
        </aside>

        {/* Innhold */}
        <div className="min-w-0 max-w-[1070px]">
          <div className="mb-4 lg:hidden">
            <CategoryBadge category={post.category} />
          </div>

          <h1 className="font-sans text-(--color-text) text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-(--color-muted)">
            {post.date} — {post.readTime} lesing
          </p>

          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-(--color-sand-light)">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-cover"
              priority
              unoptimized
            />
          </div>

          <div className="mt-8 space-y-6 lg:hidden">
            <AuthorBlock author={post.author} />
            <ArticleShareButtons title={post.title} />
          </div>

          <div className="mt-10">
            <Content />
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
                ← Tilbake til aktuelt
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </article>
  )
}
