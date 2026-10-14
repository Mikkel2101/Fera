'use client'

import { useState } from 'react'

const BUTTON = 'grid size-9 place-items-center rounded-full border border-(--color-border) text-(--color-subtle) hover:text-(--color-text) hover:border-(--color-dark) transition-colors'

function IconLink() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07l-1.42 1.41" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.41-1.41" />
    </svg>
  )
}

function IconShare() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49" />
    </svg>
  )
}

export default function ArticleShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Utilgjengelig uten HTTPS/tillatelse — ingen fallback nødvendig for et linkeikon.
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href })
      } catch {
        // Avbrutt av bruker — ingen feilmelding nødvendig.
      }
    } else {
      copyLink()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button type="button" onClick={copyLink} className={BUTTON} aria-label="Kopier lenke">
          <IconLink />
        </button>
        {copied && (
          <span
            role="status"
            className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-(--color-dark) px-2 py-1 text-[11px] font-medium text-white"
          >
            Lenke kopiert
          </span>
        )}
      </div>
      <button type="button" onClick={share} className={BUTTON} aria-label="Del artikkel">
        <IconShare />
      </button>
    </div>
  )
}
