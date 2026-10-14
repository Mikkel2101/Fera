import { createClient } from '@/lib/supabase/server'
import TripListClient from '@/components/travels/TripListClient'
import Testimonials from '@/components/travels/Testimonials'

export const metadata = {
  title: 'Våre reiser',
  description: 'Utforsk våre padelreiser på Costa Blanca, med spill, gode opplevelser og alt det praktiske ivaretatt.',
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
      <section className="relative bg-(--color-community) overflow-hidden px-4 pt-14 pb-10 md:pt-16 md:pb-12 min-h-[42vh] md:min-h-[50vh] flex flex-col justify-center">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-(--color-overlay)/80" />
        <div className="relative max-w-[1450px] mx-auto w-full">
          <h1 className="font-sans font-normal text-white text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Våre reiser
          </h1>
          <p className="text-white text-lg max-w-xl leading-relaxed">
            Utforsk våre padelreiser på Costa Blanca - med spill, gode opplevelser og alt det praktiske ivaretatt.
          </p>
        </div>
      </section>

      {/* Listevisning med filtrering */}
      <div id="turer">
        <TripListClient initialTrips={trips ?? []} />
      </div>

      <Testimonials />
    </>
  )
}
