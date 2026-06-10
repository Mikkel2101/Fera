import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPost, posts } from '../posts'

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
    <article>
      {/* Hero */}
      <div className="relative aspect-[21/9] max-h-[520px] w-full overflow-hidden bg-(--color-dark)">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          sizes="100vw"
          className="object-cover opacity-80"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-(--color-dark)/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-10 max-w-3xl mx-auto w-full">
          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest bg-white/90 text-(--color-cta) px-3 py-1 rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="font-display text-white font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-(--color-muted) mb-10 border-b border-(--color-border) pb-6">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime} lesing</span>
        </div>

        {/* Content */}
        <Content />

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
    </article>
  )
}
