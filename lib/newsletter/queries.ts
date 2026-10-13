import { createClient } from '@/lib/supabase/server'
import { toNewsletterStatus, type NewsletterStatus } from './status'

// null = nyhetsbrev er ikke satt opp (f.eks. migrasjon 026 ikke kjørt). Panelet sier fra.
export async function getNewsletterStatus(articleId: string): Promise<NewsletterStatus | null> {
  const supabase = await createClient()
  const { data: send, error } = await supabase
    .from('newsletter_sends')
    .select('status, recipient_count, sent_count, failed_count, locked_until, completed_at')
    .eq('article_id', articleId)
    .maybeSingle()
  if (error) {
    console.error('[newsletter] kunne ikke lese utsending', articleId, error.message)
    return null
  }
  if (send) return toNewsletterStatus(send, send.recipient_count)

  const { data: count, error: countError } = await supabase.rpc('newsletter_recipient_count')
  if (countError) {
    console.error('[newsletter] kunne ikke telle mottakere', countError.message)
    return null
  }
  return toNewsletterStatus(null, count ?? 0)
}
