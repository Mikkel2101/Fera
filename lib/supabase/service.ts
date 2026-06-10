import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Service role client — bypasser RLS. Kun brukt i server-side API-ruter (webhook, cron).
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
