import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleForAdmin, getTeamNames } from '@/lib/articles/queries'
import { getNewsletterStatus } from '@/lib/newsletter/queries'
import ArticleForm from '@/components/admin/ArticleForm'
import NewsletterPanel from '@/components/admin/NewsletterPanel'

// Nyhetsbrev-utsendingen kjører som server action på denne siden (tidsbudsjett 240 s).
export const maxDuration = 300

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [article, teamNames, newsletter] = await Promise.all([
    getArticleForAdmin(id),
    getTeamNames(),
    getNewsletterStatus(id),
  ])
  if (!article) notFound()

  return (
    <div>
      <Link href="/admin/articles" className="text-sm text-(--color-muted) hover:text-(--color-cta)">← Alle artikler</Link>
      <div className="mt-4">
        <ArticleForm
          article={article}
          teamNames={teamNames}
          newsletterPanel={
            <NewsletterPanel articleId={article.id} isPublished={article.status === 'published'} status={newsletter} />
          }
        />
      </div>
    </div>
  )
}
