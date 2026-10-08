// Forhindre åpen redirect — aksepter bare interne stier. Avviser også
// "//host" og "/\host", som nettlesere tolker som protokoll-relative URL-er.
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith('/')) return '/'
  if (raw.startsWith('//') || raw.startsWith('/\\')) return '/'
  return raw
}
