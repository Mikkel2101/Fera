import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TripHero from '@/components/travels/detail/TripHero'
import TripMetaBar from '@/components/travels/detail/TripMetaBar'
import TripBookingCard from '@/components/travels/detail/TripBookingCard'
import TripProgram from '@/components/travels/detail/TripProgram'
import TripIncluded from '@/components/travels/detail/TripIncluded'
import TripExtras from '@/components/travels/detail/TripExtras'
import TripCoaches from '@/components/travels/detail/TripCoaches'
import TripPrices from '@/components/travels/detail/TripPrices'
import TripFaq from '@/components/travels/detail/TripFaq'
import WaitlistForm from '@/components/travels/detail/WaitlistForm'

type Extra = { name: string; price_eur: number }
type Coach = { name: string; title: string; bio: string }
type FaqItem = { question: string; answer: string }

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: trip } = await supabase
    .from('trips')
    .select('name')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!trip) return { title: 'Tur ikke funnet — Fera Padel' }
  return { title: `${trip.name} — Fera Padel` }
}

export default async function TripDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!trip) notFound()

  return (
    <>
      <TripHero trip={trip} />
      <TripMetaBar trip={trip} />

      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-2 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 items-start">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TripBookingCard trip={trip} />
            </div>
          </aside>

          <div className="min-w-0 max-w-[900px] divide-y divide-(--color-border)">
            {trip.description && (
              <section className="py-10 first:pt-0">
                <p className="text-(--color-text) text-lg leading-relaxed">{trip.description}</p>
              </section>
            )}

            <TripProgram program={trip.program} />
            <TripIncluded included={trip.included} />
            <TripExtras extras={trip.extras as Extra[]} />
            <TripCoaches coaches={trip.coaches as Coach[]} />
            <TripPrices trip={trip} />
            <TripFaq faq={trip.faq as FaqItem[]} />
          </div>
        </div>
      </div>

      {trip.status === 'Fullbooket' && <WaitlistForm tripId={trip.id} />}
    </>
  )
}
