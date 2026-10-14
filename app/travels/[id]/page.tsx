import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TripHero from '@/components/travels/detail/TripHero'
import TripMetaBar from '@/components/travels/detail/TripMetaBar'
import TripBookingCard from '@/components/travels/detail/TripBookingCard'
import TripProgram from '@/components/travels/detail/TripProgram'
import TripIncluded from '@/components/travels/detail/TripIncluded'
import TripExtras from '@/components/travels/detail/TripExtras'
import TripCoachingGeneric from '@/components/travels/detail/TripCoachingGeneric'
import TripTravelDetails from '@/components/travels/detail/TripTravelDetails'
import TripAreaGuide from '@/components/travels/detail/TripAreaGuide'
import TripBookingCTA from '@/components/travels/detail/TripBookingCTA'
import TripFaq from '@/components/travels/detail/TripFaq'
import WaitlistForm from '@/components/travels/detail/WaitlistForm'

type Extra = { name: string; price_eur: number }
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
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <TripBookingCard trip={trip} />
            </div>
          </aside>

          <div className="min-w-0 max-w-[900px] divide-y divide-(--color-border)">
            {trip.description && (
              <section className="py-10 first:pt-0">
                <p className="text-(--color-text) text-xl leading-relaxed">{trip.description}</p>
              </section>
            )}

            <TripProgram program={trip.program} />
            <TripCoachingGeneric />
            <TripIncluded included={trip.included} />
            <TripExtras extras={trip.extras as Extra[]} />
            <TripTravelDetails />
            <TripAreaGuide />
            <TripBookingCTA trip={trip} />
            <TripFaq faq={trip.faq as FaqItem[]} />
          </div>
        </div>
      </div>

      {trip.status === 'Fullbooket' && <WaitlistForm tripId={trip.id} />}
    </>
  )
}
