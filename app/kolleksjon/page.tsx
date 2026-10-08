import type { Metadata } from 'next'
import Nav from '@/components/shared/Nav'
import Footer from '@/components/shared/Footer'
import NewsletterSignup from '@/components/shared/NewsletterSignup'
import { CartProvider } from '@/lib/cart/context'

export const metadata: Metadata = {
  title: 'FERA-kolleksjonen kommer',
  description: 'Vi designer vår egen kolleksjon for padelspillere. Meld deg på ventelista og få beskjed før lanseringen.',
}

// Venteliste for egne FERA-varer mens shop er skjult (se lib/routing/shop-gate.ts).
// Påmeldinger lagres i newsletter_subscribers med brands = ['kolleksjon'].
export default function KolleksjonPage() {
  return (
    <CartProvider>
      <Nav />
      <main>
        <NewsletterSignup
          list="kolleksjon"
          eyebrow="FERA-kolleksjonen"
          heading={<>Egne FERA-varer<br />kommer snart</>}
          body="Vi designer vår egen kolleksjon for padelspillere. Meld deg på, så får du beskjed før lanseringen åpner for alle."
          successText="Du står på lista. Vi gir beskjed før lanseringen!"
        />
      </main>
      <Footer />
    </CartProvider>
  )
}
