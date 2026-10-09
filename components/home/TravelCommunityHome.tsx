import Link from 'next/link'
import HomeInspirationSection from '@/components/home/HomeInspirationSection'
import TripCard from '@/components/travels/TripCard'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Trip = Database['public']['Tables']['trips']['Row']

export default async function TravelCommunityHome() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from('trips')
    .select('*')
    .eq('published', true)
    .gte('start_date', today)
    .in('status', ['Åpen', 'Få plasser', 'Fullbooket'])
    .order('start_date', { ascending: true })
    .limit(3)

  const trips = (data ?? []) as Trip[]

  return (
    <main>
      <section className="relative min-h-[calc(88svh-4rem)] md:min-h-[calc(92svh-4rem)] flex items-center overflow-hidden bg-(--color-community)">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Solrik%20padelglede%20i%20resortmilj%C3%B8%20FINAL%202.png')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-(--color-overlay-neutral)/95 via-(--color-overlay-neutral)/63 to-(--color-overlay-neutral)/23"
        />
        <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-6xl">
            <h1 className="font-sans font-normal text-white text-5xl sm:text-7xl lg:text-[5rem] leading-[1.05] mb-6">
              Padelopplevelser<br />
              <span className="font-display italic">på Costa Blanca</span>
            </h1>
            <p className="text-white text-base sm:text-lg max-w-2xl leading-relaxed mb-9">
              Kurerte padelreiser for klubber, bedrifter og venner - med trening, opplevelser og alt det praktiske ivaretatt.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/travels#turer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-(--color-dark) transition-colors hover:bg-(--color-sand)"
              >
                Utforsk reisene
              </Link>
              <Link
                href="/travels/om-oss"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Møt Fera
              </Link>
            </div>
            <div className="mt-12 grid max-w-3xl grid-cols-1 gap-4 border-t border-white/25 pt-6 sm:grid-cols-3 sm:gap-6">
              {[
                { title: 'Mer enn padel', detail: 'Gode opplevelser på og utenfor banen' },
                { title: 'Små grupper', detail: 'Personlig og tilpasset alle nivåer' },
                { title: 'Costa Blanca', detail: 'Solfylte dager med sport og fellesskap' },
              ].map((item) => (
                <div key={item.title}>
                  <p className="text-white font-semibold text-lg">{item.title}</p>
                  <p className="text-white/75 text-sm">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="turer" className="scroll-mt-20 py-20 sm:py-24">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-(--color-overline) text-xs uppercase tracking-[0.18em] font-medium mb-3">Utvalgte reiser</p>
              <h2 className="font-sans font-normal text-(--color-text) text-4xl sm:text-5xl">Finn reisen som passer deg</h2>
            </div>
            <Link href="/travels" className="text-(--color-cta) text-sm font-semibold hover:underline">
              Se alle reiser <span aria-hidden="true">→</span>
            </Link>
          </div>
          {trips.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          ) : (
            <div className="border-y border-(--color-border) py-8">
              <p className="text-(--color-subtle) mb-4">Nye reiser legges ut fortløpende.</p>
              <Link href="/travels" className="text-(--color-cta) text-sm font-semibold hover:underline">
                Se reiseoversikten <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-(--color-community) text-white">
        <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:gap-14 md:py-20">
          <div>
            <p className="text-(--color-overline-light) text-xs uppercase tracking-[0.18em] font-medium mb-3">Mer enn timer på banen</p>
            <h2 className="font-sans font-normal text-4xl sm:text-5xl leading-tight mb-5">Gode dager blir enda bedre sammen.</h2>
            <p className="max-w-xl text-white/80 leading-relaxed mb-7">
              Bli kjent med Fera og måten vi setter sammen padel, nye steder og et sosialt fellesskap på.
            </p>
            <Link href="/travels/om-oss" className="inline-flex min-h-11 items-center text-sm font-semibold text-(--color-overline-light) underline decoration-(--color-overline-light)/50 underline-offset-4 hover:decoration-(--color-overline-light)">
              Les om Fera Travel <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </div>
          <video
            controls
            playsInline
            preload="none"
            poster="/Hero.png"
            className="aspect-video w-full rounded-2xl bg-black object-cover"
          >
            <source src="https://dbvnuoayzevtoaolhqxd.supabase.co/storage/v1/object/public/trips/videos/fera-travels.mp4" type="video/mp4" />
            Nettleseren din støtter ikke videoavspilling.
          </video>
        </div>
      </section>

      <HomeInspirationSection variant="travels" />
    </main>
  )
}