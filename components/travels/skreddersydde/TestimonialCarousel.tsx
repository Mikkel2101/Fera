'use client'

import { useEffect, useRef, useState } from 'react'
import type { Testimonial } from '@/components/travels/Testimonials'

export default function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const quoteRef = useRef<HTMLParagraphElement>(null)
  const current = testimonials[index]

  useEffect(() => {
    const el = quoteRef.current
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [index])

  function prev() {
    setExpanded(false)
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
  }

  function next() {
    setExpanded(false)
    setIndex((i) => (i + 1) % testimonials.length)
  }

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-(--color-overline) text-sm uppercase tracking-[0.18em] font-medium mb-8">Hva sier våre gjester</p>

      <span aria-hidden="true" className="font-display italic text-(--color-dark-mid) text-8xl leading-none h-12 mb-4">
        &ldquo;
      </span>

      <p
        ref={quoteRef}
        className={`font-sans font-normal text-(--color-text) text-xl sm:text-2xl lg:text-3xl leading-relaxed whitespace-pre-line ${
          expanded ? '' : 'line-clamp-4 min-h-[6.5em]'
        }`}
      >
        {current.quote}
      </p>

      {/* Knappen holder plassen sin også når den er skjult, så høyden ikke hopper mellom omtalene */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-hidden={!(overflowing || expanded)}
        tabIndex={overflowing || expanded ? 0 : -1}
        className={`text-(--color-dark) text-sm font-semibold mt-4 underline underline-offset-4 ${
          overflowing || expanded ? '' : 'invisible'
        }`}
      >
        {expanded ? 'Vis mindre' : 'Les hele'}
      </button>

      <div className="mt-8">
        <p className="font-semibold text-(--color-text) text-base">{current.name}</p>
        <p className="text-(--color-muted) text-sm">{current.role}</p>
      </div>

      {testimonials.length > 1 && (
        <div className="flex items-center gap-5 mt-10">
          <button
            type="button"
            onClick={prev}
            aria-label="Forrige tilbakemelding"
            className="w-10 h-10 rounded-full border border-(--color-border) flex items-center justify-center text-(--color-dark) hover:bg-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-(--color-subtle) text-sm tabular-nums" aria-live="polite">
            {String(index + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={next}
            aria-label="Neste tilbakemelding"
            className="w-10 h-10 rounded-full border border-(--color-border) flex items-center justify-center text-(--color-dark) hover:bg-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
