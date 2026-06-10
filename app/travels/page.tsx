import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TripListClient from '@/components/travels/TripListClient'

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
      <section className="relative bg-(--color-community) overflow-hidden px-4 sm:px-6 lg:px-8 pt-16 pb-0 md:pt-24">
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-(--color-community)/60 via-(--color-community)/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
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

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-(--color-sand-light)">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-(--color-cta) text-xs uppercase tracking-widest font-medium mb-3">Hva sier våre reisende</p>
            <h2 className="font-sans font-normal text-(--color-text) text-4xl sm:text-5xl">
              Over 100 fornøyde gjester
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: 'Den beste ferien jeg har hatt på år og dag. Kombinasjonen av padel, sol og et supert sosialt miljø var akkurat det vi trengte. Petter og André er rett og slett fantastiske verter.',
                name: 'Marte H.',
                role: 'Oslo',
                stars: 5,
              },
              {
                quote: 'Vi tok med hele laget på bedriftstur og det overgikk alle forventninger. Profesjonell coaching, perfekte baner og en gruppe som er smidd for evigheten. Anbefales på det varmeste!',
                name: 'Kristoffer V.',
                role: 'Bergen',
                stars: 5,
              },
              {
                quote: 'Jeg reiste alene og var litt spent, men trengte overhodet ikke være det. Gruppen var varm og inkluderende fra dag én. Booker igjen til høsten!',
                name: 'Ingrid S.',
                role: 'Trondheim',
                stars: 5,
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-8 border border-(--color-border)">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-(--color-gold)">
                      <path d="M8 1l1.854 3.757L14 5.457l-3 2.923.708 4.13L8 10.427l-3.708 2.083L5 8.38 2 5.457l4.146-.7L8 1z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-(--color-text) text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-(--color-text) text-sm">{t.name}</p>
                  <p className="text-(--color-muted) text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
