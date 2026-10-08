import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleForAdmin } from '@/lib/articles/queries'
import ArticleForm from '@/components/admin/ArticleForm'

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await getArticleForAdmin(id)
  if (!article) notFound()

  return (
    <div>
      <Link href="/admin/articles" className="text-sm text-(--color-muted) hover:text-(--color-cta)">← Alle artikler</Link>
      <div className="mt-4">
        <ArticleForm article={article} />
      </div>
    </div>
  )
}
