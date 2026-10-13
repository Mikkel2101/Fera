import type { NewsletterConfig } from './config'
import { renderNewsletter, type NewsletterArticle } from './render'
import { unsubscribeLinks } from './token'

export type EmailMessage = {
  to: string
  subject: string
  html: string
  text: string
  headers: Record<string, string>
}

// Én e-post per mottaker, fordi avmeldingslenken er personlig.
// List-Unsubscribe + List-Unsubscribe-Post gir one-click-avmelding (RFC 8058),
// som Gmail og Yahoo krever for masseutsendelser.
export function newsletterComposer(
  article: NewsletterArticle,
  config: NewsletterConfig,
  subjectPrefix = '',
): (email: string) => EmailMessage {
  return (email) => {
    const links = unsubscribeLinks(email, config.secret, config.siteUrl)
    const rendered = renderNewsletter(article, {
      siteUrl: config.siteUrl,
      unsubscribeUrl: links.page,
      senderInfo: config.senderInfo,
    })
    return {
      to: email,
      subject: `${subjectPrefix}${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
      headers: {
        'List-Unsubscribe': `<${links.oneClick}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }
  }
}
