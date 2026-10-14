import Link from 'next/link'
import Image from 'next/image'
import HomeInspirationSection from '@/components/home/HomeInspirationSection'
import TripsCarousel from '@/components/home/TripsCarousel'
import HeroFeatureLoop from '@/components/home/HeroFeatureLoop'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Trip = Database['public']['Tables']['trips']['Row']

const HERO_FEATURES = [
  { title: 'Mer enn padel', detail: 'Gode opplevelser på og utenfor banen' },
  { title: 'For alle nivåer', detail: 'Personlig og tilpasset oppfølging' },
  { title: 'Costa Blanca', detail: 'Solfylte dager med sport og fellesskap' },
]

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
    .limit(6)

  const trips = (data ?? []) as Trip[]

  return (
    <main>
      <section className="relative min-h-[calc(88svh-4rem)] md:min-h-[calc(92svh-4rem)] flex items-center overflow-hidden bg-(--color-community)">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/Solrik%20padelglede%20i%20resortmilj%C3%B8%20FINAL%202%20MOBIL.png"
          className="absolute inset-0 w-full h-full object-cover"
          src="/fera-travels.mp4"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 80% at 28% 50%, color-mix(in srgb, var(--color-overlay) 75%, transparent) 0%, color-mix(in srgb, var(--color-overlay) 60%, transparent) 40%, color-mix(in srgb, var(--color-dark) 42%, transparent) 70%, color-mix(in srgb, var(--color-dark) 22%, transparent) 100%)',
          }}
        />
        <div className="relative w-full max-w-[1450px] mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-6xl">
            <h1 className="font-sans font-normal text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] mb-6">
              Padel&shy;opplevelser<br />
              på <span className="font-display italic">Costa Blanca</span>
            </h1>
            <p className="text-white text-base sm:text-lg max-w-2xl leading-relaxed mb-9">
              Kurerte padelreiser for klubber, bedrifter og venner - med trening, opplevelser og alt det praktiske ivaretatt.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/travels#turer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-base font-normal text-(--color-dark) transition-colors hover:bg-(--color-sand)"
              >
                Utforsk reisene
              </Link>
              <Link
                href="/travels/skreddersydde-reiser#tilbud"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/60 px-6 py-3 text-base font-normal text-white transition-colors hover:bg-white/10"
              >
                Be om tilbud
              </Link>
            </div>
            <div className="hidden sm:grid mt-12 max-w-3xl grid-cols-3 gap-6 border-t border-white/25 pt-6">
              {HERO_FEATURES.map((item) => (
                <div key={item.title}>
                  <p className="text-white font-semibold text-lg">{item.title}</p>
                  <p className="text-white/75 text-sm">{item.detail}</p>
                </div>
              ))}
            </div>
            <div className="sm:hidden">
              <HeroFeatureLoop items={HERO_FEATURES} />
            </div>
          </div>
        </div>
      </section>

      <section id="turer" className="scroll-mt-20 overflow-hidden pt-20 sm:pt-24 pb-28 sm:pb-32">
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-(--color-overline) text-sm uppercase tracking-[0.18em] font-medium mb-3">Utvalgte reiser</p>
            <h2 className="font-sans font-normal text-(--color-text) text-5xl sm:text-6xl mb-4">Finn reisen som passer deg</h2>
            <p className="text-(--color-subtle) max-w-xl text-lg leading-relaxed">
              Noen av våre kommende turer til Costa Blanca — bla gjennom og finn den som passer dere.
            </p>
          </div>
          {trips.length > 0 ? (
            <TripsCarousel trips={trips} seeAllHref="/travels" />
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

      <section className="bg-(--color-community) text-white md:min-h-[720px]">
        <div className="mx-auto grid max-w-[1450px] gap-10 px-4 py-20 sm:px-6 md:min-h-[720px] md:grid-cols-[1fr_1.4fr] md:items-center md:gap-14 md:py-24">
          <div>
            <p className="text-(--color-overline-light) text-sm uppercase tracking-[0.18em] font-medium mb-4 md:mb-3">Mer enn timer på banen</p>
            <h2 className="font-sans font-normal text-5xl sm:text-6xl leading-tight mb-6 md:mb-5">Det er menneskene som gjør opplevelsen.</h2>
            <p className="max-w-xl text-white/80 leading-relaxed mb-8 md:mb-7">
              Padel har alltid handlet om mer enn selve spillet. Det handler om menneskene du møter, og alt det gode som skjer på og utenfor banen.
            </p>
            <Link href="/travels/om-oss" className="inline-block min-h-11 text-lg font-semibold text-(--color-overline-light) underline decoration-(--color-overline-light)/50 underline-offset-4 hover:decoration-(--color-overline-light)">
              Les mer om FERA <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="relative aspect-[16/10] w-full mx-auto rounded-2xl overflow-hidden bg-black md:aspect-[3/2] md:w-[95%]">
            <Image
              src="/Bilder%20fra%20tur/DSC02287-2.JPG"
              alt="Gjeng fra en FERA-padeltur samlet ved nettet etter spill"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <HomeInspirationSection variant="travels" />
    </main>
  )
}