import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TripHero from '@/components/travels/detail/TripHero'
import TripMetaBar from '@/components/travels/detail/TripMetaBar'
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

      <div className="divide-y divide-(--color-border)">
        {trip.description && (
          <section className="bg-(--color-surface) px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto w-full">
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

      {trip.status === 'Fullbooket' && <WaitlistForm tripId={trip.id} />}
    </>
  )
}
