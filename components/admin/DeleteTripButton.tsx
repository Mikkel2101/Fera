'use client'

import { deleteTrip } from '@/lib/actions/trips'

export default function DeleteTripButton({ tripId, tripName }: { tripId: string; tripName: string }) {
  return (
    <form action={deleteTrip.bind(null, tripId)}>
      <button
        type="submit"
        className="text-sm text-(--color-muted) hover:text-red-500 transition-colors"
        onClick={e => { if (!confirm(`Slett "${tripName}"?`)) e.preventDefault() }}
      >
        Slett
      </button>
    </form>
  )
}
