import { isAllowedImageSrc, storagePublicPrefix } from './content'

export type StrippedPaste = { html: string; removed: number }

// Bilder fra andre nettsider ville blitt fjernet stille av sanitizeDoc ved lagring.
// Vi fjerner dem allerede ved innliming, så redaktøren får beskjed med en gang.
export function stripExternalImages(html: string, prefix = storagePublicPrefix()): StrippedPaste {
  if (!/<img[\s>]/i.test(html)) return { html, removed: 0 }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const external = Array.from(doc.querySelectorAll('img'))
    .filter((img) => !isAllowedImageSrc(img.getAttribute('src'), prefix))
  if (external.length === 0) return { html, removed: 0 }

  external.forEach((img) => img.remove())
  return { html: doc.body.innerHTML, removed: external.length }
}

export function removedImagesMessage(count: number): string {
  return count === 1
    ? '1 bilde fra en annen nettside ble ikke tatt med — last det opp med Bilde-knappen.'
    : `${count} bilder fra andre nettsider ble ikke tatt med — last dem opp med Bilde-knappen.`
}
