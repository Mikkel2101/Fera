// Stier som må virke selv mens COMING_SOON skjuler nettsiden:
// - /admin + Supabase-proxyen + auth-callbacken holder admin i live
// - Stripe-webhooken må kunne svare på ekte leveranser
// - avmelding fra nyhetsbrev er lovpålagt (markedsføringsloven § 15) og må alltid virke
const OPEN_PREFIXES = [
  '/admin',
  '/api/supabase',
  '/api/auth',
  '/api/webhooks',
  '/nyhetsbrev',
  '/api/nyhetsbrev',
]

export function isOpenDuringComingSoon(pathname: string, host: string): boolean {
  if (pathname.startsWith('/_next') || pathname.includes('.')) return true
  if (host.startsWith('admin.')) return true
  return OPEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
