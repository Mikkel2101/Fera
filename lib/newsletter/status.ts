export type NewsletterStatus =
  | { kind: 'not_sent'; recipientCount: number }
  | {
      kind: 'sending' | 'sent'
      recipientCount: number
      sentCount: number
      failedCount: number
      completedAt: string | null
      // false mens status er 'sending' betyr at utsendingen ble avbrutt og kan fortsettes
      isLocked: boolean
    }

export type NewsletterSendRow = {
  status: string
  recipient_count: number
  sent_count: number
  failed_count: number
  locked_until: string | null
  completed_at: string | null
}

export function toNewsletterStatus(
  row: NewsletterSendRow | null,
  recipientCount: number,
  now: number = Date.now(),
): NewsletterStatus {
  if (!row) return { kind: 'not_sent', recipientCount }
  return {
    kind: row.status === 'sent' ? 'sent' : 'sending',
    recipientCount: row.recipient_count,
    sentCount: row.sent_count,
    failedCount: row.failed_count,
    completedAt: row.completed_at,
    isLocked: row.locked_until !== null && Date.parse(row.locked_until) > now,
  }
}
