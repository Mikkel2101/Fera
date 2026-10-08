import Link from 'next/link'
import { listArticlesForAdmin } from '@/lib/articles/queries'
import { createArticleAndOpen } from '@/lib/actions/articles'
import { formatArticleDate } from '@/lib/articles/format'

export default async function AdminArticlesPage() {
  const articles = await listArticlesForAdmin()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold text-(--color-text)">Artikler</h1>
        <form action={createArticleAndOpen}>
          <button type="submit" className="bg-(--color-cta) text-white text-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
            + Ny artikkel
          </button>
        </form>
      </div>

      {articles.length === 0 && (
        <p className="text-(--color-muted) text-sm">Ingen artikler ennå. Skriv den første!</p>
      )}

      <div className="space-y-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/admin/articles/${article.id}`}
            className="bg-(--color-surface) border border-(--color-border) rounded-xl px-5 py-4 flex items-center gap-4 hover:border-(--color-cta) transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-(--color-text) truncate">{article.title}</div>
              <div className="text-xs text-(--color-muted) mt-0.5">
                {article.author_name ?? 'Ukjent forfatter'}
                {article.published_at && ` · ${formatArticleDate(article.published_at)}`}
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${article.status === 'published' ? 'bg-(--color-success) text-white' : 'bg-(--color-sand) text-(--color-subtle)'}`}>
              {article.status === 'published' ? 'Publisert' : 'Utkast'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
