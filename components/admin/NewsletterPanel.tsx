'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sendNewsletterTest, startNewsletter, resumeNewsletter, type SendSummary } from '@/lib/actions/newsletter'
import type { NewsletterStatus } from '@/lib/newsletter/status'
import { formatArticleDate } from '@/lib/articles/format'

type Props = { articleId: string; isPublished: boolean; status: NewsletterStatus | null }
type Step = 'start' | 'tested' | 'confirm'
type Message = { tone: 'error' | 'success'; text: string }

const PRIMARY = 'bg-(--color-cta) text-white font-sans font-semibold rounded-full px-4 py-2 text-sm hover:bg-(--color-dark-mid) transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
const SECONDARY = 'border border-(--color-border) text-(--color-text) font-sans font-medium rounded-full px-4 py-2 text-sm hover:border-(--color-cta) disabled:opacity-50'
const NOTE = 'text-sm text-(--color-muted) leading-relaxed'

const SUMMARY_MESSAGES: Record<SendSummary['status'], Message> = {
  done: { tone: 'success', text: 'Nyhetsbrevet er sendt.' },
  locked: { tone: 'error', text: 'Utsendingen pågår allerede (kanskje i en annen fane). Last siden på nytt om litt.' },
  interrupted: { tone: 'error', text: 'E-posttjenesten svarte ikke. Ingen får e-posten to ganger — trykk «Fortsett utsending».' },
  time_budget: { tone: 'success', text: 'Utsendingen er satt på pause for å unngå tidsavbrudd. Trykk «Fortsett utsending» for resten.' },
}

function SentSummary({ status }: { status: Exclude<NewsletterStatus, { kind: 'not_sent' }> }) {
  return (
    <p className={NOTE}>
      Sendt {formatArticleDate(status.completedAt)} til {status.recipientCount} mottakere.
      {status.failedCount > 0 && ` ${status.failedCount} kunne ikke leveres.`}
    </p>
  )
}

export default function NewsletterPanel({ articleId, isPublished, status }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('start')
  const [message, setMessage] = useState<Message | null>(null)
  const [isPending, startTransition] = useTransition()

  function run(task: () => Promise<void>) {
    setMessage(null)
    startTransition(async () => {
      try {
        await task()
      } catch (error) {
        console.error('[newsletter] handling feilet', error)
        setMessage({ tone: 'error', text: 'Noe gikk galt. Prøv igjen.' })
      }
    })
  }

  const handleTest = () => run(async () => {
    const result = await sendNewsletterTest(articleId)
    if (!result.ok) {
      setMessage({ tone: 'error', text: result.error })
      return
    }
    setStep('tested')
    setMessage({ tone: 'success', text: `Test sendt til ${result.data.to}. Sjekk innboksen før du sender.` })
  })

  // Også når kallet kaster (f.eks. tidsavbrudd) kan utsendingen ha startet,
  // så hent alltid ny status fra serveren.
  const handleSend = (action: typeof startNewsletter) => run(async () => {
    try {
      const result = await action(articleId)
      setMessage(result.ok ? SUMMARY_MESSAGES[result.data.status] : { tone: 'error', text: result.error })
    } finally {
      setStep('start')
      router.refresh()
    }
  })

  function body() {
    if (!status) return <p className={NOTE}>Nyhetsbrev er ikke satt opp ennå.</p>
    if (status.kind === 'sent') return <SentSummary status={status} />
    if (status.kind === 'sending') {
      return (
        <>
          <p className={NOTE}>
            {status.sentCount + status.failedCount} av {status.recipientCount} behandlet.
            {status.isLocked ? ' Utsending pågår …' : ' Utsendingen ble avbrutt.'}
          </p>
          {!status.isLocked && (
            <button type="button" className={PRIMARY} disabled={isPending} onClick={() => handleSend(resumeNewsletter)}>
              Fortsett utsending
            </button>
          )}
        </>
      )
    }
    if (!isPublished) return <p className={NOTE}>Publiser artikkelen før den kan sendes som nyhetsbrev.</p>

    const count = status.recipientCount
    return (
      <>
        <p className={NOTE}>
          {count} mottakere. Nyhetsbrevet bruker sist lagrede versjon av artikkelen, og kan bare sendes én gang.
        </p>
        {step === 'confirm' ? (
          <div className="space-y-2 rounded-xl bg-(--color-sand) p-3">
            <p className="text-sm font-medium text-(--color-text)">Sender til {count} mottakere nå. Dette kan ikke angres.</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={PRIMARY} disabled={isPending} onClick={() => handleSend(startNewsletter)}>
                {isPending ? 'Sender …' : 'Ja, send nå'}
              </button>
              <button type="button" className={SECONDARY} disabled={isPending} onClick={() => setStep('tested')}>Avbryt</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={SECONDARY} disabled={isPending} onClick={handleTest}>
              {step === 'tested' ? 'Send ny test' : 'Send test til meg'}
            </button>
            {step === 'tested' && (
              <button type="button" className={PRIMARY} disabled={isPending || count === 0} onClick={() => setStep('confirm')}>
                Send til {count} mottakere
              </button>
            )}
          </div>
        )}
      </>
    )
  }

  return (
    <section aria-labelledby="newsletter-heading" className="mt-8 space-y-3 border-t border-(--color-border) pt-6">
      <h2 id="newsletter-heading" className="font-display text-lg font-semibold text-(--color-text)">Nyhetsbrev</h2>
      {body()}
      {message && (
        <p role="status" className={`text-sm font-medium ${message.tone === 'error' ? 'text-(--color-cta)' : 'text-(--color-success)'}`}>
          {message.text}
        </p>
      )}
    </section>
  )
}
