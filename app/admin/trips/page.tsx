import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteTrip, setPublished } from '@/lib/actions/trips'

export default async function AdminTripsPage() {
  const supabase = await createClient()
  const { data: trips } = await supabase
    .from('trips')
    .select('id, name, destination, start_date, end_date, status, published, registered_count, max_participants')
    .order('start_date', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold text-[--color-text]">Turer</h1>
        <Link
          href="/admin/trips/new"
          className="bg-[--color-cta] text-white text-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
        >
          + Ny tur
        </Link>
      </div>

      {!trips?.length && (
        <p className="text-[--color-muted] text-sm">Ingen turer ennå. Opprett din første tur.</p>
      )}

      <div className="space-y-3">
        {trips?.map(trip => (
          <div
            key={trip.id}
            className="bg-[--color-surface] border border-[--color-border] rounded-xl px-5 py-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[--color-text] truncate">{trip.name}</div>
              <div className="text-xs text-[--color-muted] mt-0.5">
                {trip.destination} · {trip.start_date} → {trip.end_date}
              </div>
            </div>
            <div className="text-xs text-[--color-muted]">
              {trip.registered_count}/{trip.max_participants ?? '∞'}
            </div>
            <StatusBadge status={trip.status} />
            <form action={setPublished.bind(null, trip.id, !trip.published)}>
              <button
                type="submit"
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  trip.published
                    ? 'border-[--color-success] text-[--color-success] hover:bg-green-50'
                    : 'border-[--color-border] text-[--color-muted] hover:border-[--color-cta] hover:text-[--color-cta]'
                }`}
              >
                {trip.published ? 'Publisert' : 'Avpublisert'}
              </button>
            </form>
            <Link
              href={`/admin/trips/${trip.id}/edit`}
              className="text-sm text-[--color-cta] hover:underline"
            >
              Rediger
            </Link>
            <form action={deleteTrip.bind(null, trip.id)}>
              <button
                type="submit"
                className="text-sm text-[--color-muted] hover:text-red-500 transition-colors"
                onClick={e => { if (!confirm(`Slett "${trip.name}"?`)) e.preventDefault() }}
              >
                Slett
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    'Åpen':        'bg-green-100 text-[--color-success]',
    'Få plasser':  'bg-yellow-100 text-[--color-gold]',
    'Fullbooket':  'bg-red-100 text-red-600',
    'Utkast':      'bg-[--color-sand] text-[--color-muted]',
    'Avlyst':      'bg-gray-100 text-gray-500',
    'Gjennomført': 'bg-[--color-sand] text-[--color-subtle]',
  }
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full ${colours[status] ?? 'bg-[--color-sand] text-[--color-muted]'}`}>
      {status}
    </span>
  )
}
