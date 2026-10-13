import { Resend } from 'resend'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/supabase/types'
import type { NewsletterConfig } from './config'
import { toPositionalResults, type BatchMailer, type SendStore } from './send'

type Client = SupabaseClient<Database>

// Admin-klienten (RLS + is_admin() i funksjonene) — ikke service role.
export function supabaseSendStore(supabase: Client): SendStore {
  return {
    async claim(sendId) {
      const { data, error } = await supabase.rpc('claim_newsletter_send', { p_send_id: sendId })
      if (error) throw new Error(`claim_newsletter_send: ${error.message}`)
      return data === true
    },
    async nextPending(sendId, limit) {
      const { data, error } = await supabase
        .from('newsletter_deliveries')
        .select('email')
        .eq('send_id', sendId)
        .eq('status', 'pending')
        .order('email')
        .limit(limit)
      if (error) throw new Error(`newsletter_deliveries: ${error.message}`)
      return (data ?? []).map((row) => row.email)
    },
    async record(sendId, results) {
      const { error } = await supabase.rpc('record_newsletter_batch', {
        p_send_id: sendId,
        p_results: results as unknown as Json,
      })
      if (error) throw new Error(`record_newsletter_batch: ${error.message}`)
    },
    async release(sendId) {
      const { error } = await supabase.rpc('release_newsletter_send', { p_send_id: sendId })
      if (error) throw new Error(`release_newsletter_send: ${error.message}`)
    },
  }
}

export async function findSendIdForArticle(supabase: Client, articleId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('newsletter_sends')
    .select('id')
    .eq('article_id', articleId)
    .maybeSingle()
  if (error) throw new Error(`newsletter_sends: ${error.message}`)
  return data?.id ?? null
}

export function resendBatchMailer(apiKey: string, config: NewsletterConfig): BatchMailer {
  const resend = new Resend(apiKey)
  return async (messages, idempotencyKey) => {
    const { data, error } = await resend.batch.send(
      messages.map((message) => ({
        from: config.from,
        replyTo: config.replyTo,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        headers: message.headers,
      })),
      { idempotencyKey, batchValidation: 'permissive' },
    )
    if (error || !data) return { ok: false, error: error?.message ?? 'Tomt svar fra Resend' }
    return { ok: true, results: toPositionalResults(messages.length, data.data, data.errors ?? []) }
  }
}
