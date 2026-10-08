import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleForAdmin, getTeamNames } from '@/lib/articles/queries'
import ArticleForm from '@/components/admin/ArticleForm'

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [article, teamNames] = await Promise.all([getArticleForAdmin(id), getTeamNames()])
  if (!article) notFound()

  return (
    <div>
      <Link href="/admin/articles" className="text-sm text-(--color-muted) hover:text-(--color-cta)">← Alle artikler</Link>
      <div className="mt-4">
        <ArticleForm article={article} teamNames={teamNames} />
      </div>
    </div>
  )
}
