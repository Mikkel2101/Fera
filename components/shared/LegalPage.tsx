import Nav from '@/components/shared/Nav'
import Footer from '@/components/shared/Footer'
import { CartProvider } from '@/lib/cart/context'

type Props = {
  title:       string
  updated:     string
  children:    React.ReactNode
}

// Felles ramme for juridiske sider (personvern, vilkår)
export default function LegalPage({ title, updated, children }: Props) {
  return (
    <CartProvider>
      <Nav />
      <main className="bg-(--color-bg) px-4 py-16">
        <article className="mx-auto max-w-2xl">
          <h1 className="font-display text-4xl font-bold text-(--color-text)">{title}</h1>
          <p className="mt-2 mb-10 text-sm text-(--color-muted)">Sist oppdatert {updated}</p>
          <div className="space-y-8 text-(--color-text) leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:underline">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </CartProvider>
  )
}
