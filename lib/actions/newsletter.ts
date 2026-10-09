'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getArticleForAdmin } from '@/lib/articles/queries'
import type { Article } from '@/lib/articles/types'
import type { ActionResult } from '@/lib/articles/schema'
import { newsletterConfig, type NewsletterConfig } from '@/lib/newsletter/config'
import { newsletterComposer } from '@/lib/newsletter/compose'
import { runNewsletterSend, type RunResult } from '@/lib/newsletter/send'
import { findSendIdForArticle, resendBatchMailer, supabaseSendStore } from '@/lib/newsletter/runtime'

export type SendSummary = Pick<RunResult, 'status' | 'sent' | 'failed'>

type Setup = { config: NewsletterConfig; apiKey: string }
type AdminClient = Awaited<ReturnType<typeof requireAdmin>>['supabase']

const TEST_PREFIX = '[Test] '
const NOT_PUBLISHED = 'Bare publiserte artikler kan sendes som nyhetsbrev.'
const START_ERRORS: Record<string, string> = {
  already_sent: 'Denne artikkelen er allerede sendt som nyhetsbrev.',
  not_published: NOT_PUBLISHED,
  no_recipients: 'Det er ingen mottakere å sende til.',
}

function readSetup(): Setup | string {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return 'E-postutsending er ikke satt opp (RESEND_API_KEY mangler).'
  try {
    return { config: newsletterConfig(), apiKey }
  } catch {
    return 'Avmeldingslenker er ikke satt opp (NEWSLETTER_UNSUBSCRIBE_SECRET mangler i miljøvariablene).'
  }
}

async function loadPublished(articleId: string): Promise<Article | string> {
  const article = await getArticleForAdmin(articleId)
  if (!article) return 'Fant ikke artikkelen.'
  return article.status === 'published' ? article : NOT_PUBLISHED
}

export async function sendNewsletterTest(articleId: string): Promise<ActionResult<{ to: string }>> {
  const { user } = await requireAdmin()
  if (!user.email) return { ok: false, error: 'Kontoen din mangler e-postadresse.' }
  const setup = readSetup()
  if (typeof setup === 'string') return { ok: false, error: setup }
  const article = await loadPublished(articleId)
  if (typeof article === 'string') return { ok: false, error: article }

  const message = newsletterComposer(article, setup.config, TEST_PREFIX)(user.email)
  // Tilfeldig nøkkel: hver test skal faktisk sendes.
  const outcome = await resendBatchMailer(setup.apiKey, setup.config)([message], `newsletter-test/${crypto.randomUUID()}`)
  const failure = outcome.ok ? outcome.results[0]?.error : outcome.error
  if (failure) {
    console.error('[newsletter] testutsending feilet', articleId, failure)
    return { ok: false, error: 'Testen kunne ikke sendes. Prøv igjen om litt.' }
  }
  return { ok: true, data: { to: user.email } }
}

async function run(supabase: AdminClient, sendId: string, article: Article, setup: Setup): Promise<ActionResult<SendSummary>> {
  try {
    const result = await runNewsletterSend(sendId, {
      store: supabaseSendStore(supabase),
      mailer: resendBatchMailer(setup.apiKey, setup.config),
      compose: newsletterComposer(article, setup.config),
    })
    if (result.status === 'interrupted') console.error('[newsletter] utsending avbrutt', sendId, result.error)
    return { ok: true, data: { status: result.status, sent: result.sent, failed: result.failed } }
  } catch (error) {
    console.error('[newsletter] utsending feilet', sendId, error)
    return {
      ok: false,
      error: 'Utsendingen stoppet på grunn av en feil. Ingen får e-posten to ganger — trykk «Fortsett utsending» for å prøve igjen.',
    }
  } finally {
    revalidatePath(`/admin/articles/${article.id}`)
  }
}

export async function startNewsletter(articleId: string): Promise<ActionResult<SendSummary>> {
  const { supabase } = await requireAdmin()
  const setup = readSetup()
  if (typeof setup === 'string') return { ok: false, error: setup }
  const article = await loadPublished(articleId)
  if (typeof article === 'string') return { ok: false, error: article }

  const { data: sendId, error } = await supabase.rpc('start_newsletter_send', { p_article_id: articleId })
  if (error || !sendId) {
    const code = Object.keys(START_ERRORS).find((key) => error?.message.includes(key))
    if (!code) console.error('[newsletter] start feilet', articleId, error)
    return { ok: false, error: code ? START_ERRORS[code] : 'Kunne ikke starte utsendingen. Prøv igjen.' }
  }
  return run(supabase, sendId, article, setup)
}

export async function resumeNewsletter(articleId: string): Promise<ActionResult<SendSummary>> {
  const { supabase } = await requireAdmin()
  const setup = readSetup()
  if (typeof setup === 'string') return { ok: false, error: setup }
  const article = await getArticleForAdmin(articleId)
  if (!article) return { ok: false, error: 'Fant ikke artikkelen.' }

  try {
    const sendId = await findSendIdForArticle(supabase, articleId)
    if (!sendId) return { ok: false, error: 'Fant ingen utsending å fortsette.' }
    return run(supabase, sendId, article, setup)
  } catch (error) {
    console.error('[newsletter] fortsett feilet', articleId, error)
    return { ok: false, error: 'Kunne ikke fortsette utsendingen. Prøv igjen.' }
  }
}
