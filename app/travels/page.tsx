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
      <section className="relative bg-(--color-community) overflow-hidden px-4 pt-20 pb-0 md:pt-32 min-h-[55vh] md:min-h-[65vh] flex flex-col justify-center pb-8 md:pb-12">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-(--color-overlay)/80" />
        <div className="relative max-w-[1600px] mx-auto w-full">
          <div className="pb-16 md:pb-24">
            <p className="text-(--color-overline-light) text-xs tracking-widest uppercase font-sans mb-4">
              Fera Travel
            </p>
            <h1 className="font-sans font-normal text-white text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
              Padelopplevelser på <span className="font-display italic">Costa Blanca</span>
            </h1>
            <p className="text-white text-lg max-w-xl leading-relaxed mb-10">
              Skreddersydde opphold for bedrifter, klubber, skoler og private grupper — med trening, opplevelser og alt det praktiske ivaretatt.
            </p>
            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-10 gap-y-4 pt-10 border-t border-white/15">
              {[
                { stat: '100+', label: 'Fornøyde reisende' },
                { stat: '5-stjernes', label: 'Coach: André Schlyter' },
                { stat: 'Costa Blanca', label: 'Destinasjon' },
              ].map((item) => (
                <div key={item.stat}>
                  <p className="text-white font-sans font-semibold text-2xl leading-none mb-1">{item.stat}</p>
                  <p className="text-white/50 text-[11px] uppercase tracking-widest">{item.label}</p>
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
      <section className="py-24 bg-(--color-sand-light)">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-3">Hva sier våre reisende</p>
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
