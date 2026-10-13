import type { createClient } from '@/lib/supabase/server'
import { roomStatusesByTrip, type RoomStatus } from './rooms'

type ServerClient = Awaited<ReturnType<typeof createClient>>

// Romstatus må regnes ut fra alle påmeldinger på turen, også de som er
// filtrert bort i admin-visningen (f.eks. når lista bare viser «Bekreftet»).
export async function fetchRoomStatuses(
  supabase: ServerClient,
  tripIds: string[],
): Promise<Map<string, RoomStatus>> {
  if (tripIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from('bookings')
    .select('id, trip_id, first_name, last_name, status, room_preference, roommate_name')
    .in('trip_id', [...new Set(tripIds)])

  if (error) {
    console.error('fetchRoomStatuses failed:', error)
    return new Map()
  }
  return roomStatusesByTrip(data ?? [])
}
