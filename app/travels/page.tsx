import { createClient } from '@/lib/supabase/server'
import TripListClient from '@/components/travels/TripListClient'

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
      <section className="bg-gradient-to-b from-(--color-dark) to-(--color-dark-mid) px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <p className="text-(--color-gold) text-xs tracking-widest uppercase font-sans mb-4">
            Kommende turer
          </p>
          <h1 className="font-display text-white text-4xl md:text-6xl font-bold leading-tight mb-6">
            Finn ditt neste{' '}
            <em className="italic text-(--color-gold) not-italic">eventyr</em>
          </h1>
          <p className="text-(--color-muted) text-lg max-w-xl leading-relaxed">
            Kurerte padel-reisepakker til Costa Blanca — for bedrifter, klubber,
            vennegjenger og skoler. Alt inkludert, kun kofferten mangler.
          </p>
        </div>
      </section>

      {/* Listevisning med filtrering */}
      <TripListClient initialTrips={trips ?? []} />
    </>
  )
}
