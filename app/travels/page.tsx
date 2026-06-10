import { createClient } from '@/lib/supabase/server'
import TripListClient from '@/components/travels/TripListClient'
import Link from 'next/link'

export const metadata = {
  title: 'Padelreiser til Spania',
  description: 'Kurerte padel-reisepakker til Costa Blanca for norske padel-entusiaster. Alt inkludert.',
}

export default async function TravelsPage() {
  const supabase = await createClient()
  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('published', true)
    .order('start_date', { ascending: true })

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-(--color-dark) via-(--color-dark) to-(--color-dark-mid) px-4 sm:px-6 lg:px-8 pt-16 pb-0 md:pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end pb-16 md:pb-24">
            <div>
              <p className="text-(--color-sand) text-xs tracking-widest uppercase font-sans mb-4 opacity-70">
                Kommende turer
              </p>
              <h1 className="font-display text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Finn ditt neste{' '}
                <em className="italic text-(--color-sand) not-italic">padel-eventyr</em>
              </h1>
              <p className="text-white/60 text-lg max-w-xl leading-relaxed mb-8">
                Kurerte reisepakker til Costa Blanca — for bedrifter, klubber, vennegjenger og skoler. Alt inkludert, kun kofferten mangler.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#turer"
                  className="bg-white text-(--color-dark) font-semibold text-sm px-6 py-3 rounded-full hover:bg-(--color-sand) transition-colors"
                >
                  Se alle turer ↓
                </Link>
                <Link
                  href="/travels/for-bedrifter"
                  className="border border-white/30 text-white font-semibold text-sm px-6 py-3 rounded-full hover:border-white/60 transition-colors"
                >
                  Bedriftsturer
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pb-8">
              {[
                { number: '100+', label: 'Fornøyde reisende' },
                { number: 'Costa Blanca', label: 'Destinasjon' },
                { number: 'André Schlyter', label: 'World class coach' },
              ].map((stat) => (
                <div key={stat.number} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="font-display font-bold text-white text-base sm:text-lg leading-tight mb-1">{stat.number}</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Listevisning med filtrering */}
      <div id="turer">
        <TripListClient initialTrips={trips ?? []} />
      </div>
    </>
  )
}
