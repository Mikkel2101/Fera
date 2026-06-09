import Nav from '@/components/shared/Nav'
import { CartProvider } from '@/lib/cart/context'
import CartDrawer from '@/components/shop/CartDrawer'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Nav />
      <CartDrawer />
      <main>{children}</main>
      <footer className="bg-(--color-dark) text-white/70 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <span className="font-display italic font-bold text-white text-2xl block mb-4">Fera</span>
            <p className="text-sm leading-relaxed">
              Profesjonelle padelopplevelser — reiser til Spania og premium utstyr fra Padelpoint.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Tjenester</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/travels" className="hover:text-white transition-colors">Padelreiser</a></li>
              <li><a href="/shop" className="hover:text-white transition-colors">Padelutstyr</a></li>
              <li><a href="/travels" className="hover:text-white transition-colors">Bedriftsturer</a></li>
              <li><a href="/travels" className="hover:text-white transition-colors">Klubbturer</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Kontakt</h4>
            <ul className="space-y-2 text-sm">
              <li>post@fera.no</li>
              <li>Instagram: @fera.padel</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-xs text-white/40">
          © {new Date().getFullYear()} Fera Padel AS
        </div>
      </footer>
    </CartProvider>
  )
}
