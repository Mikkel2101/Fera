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
    setExpanded(false)
    const el = quoteRef.current
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [index])

  function prev() {
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
  }

  function next() {
    setIndex((i) => (i + 1) % testimonials.length)
  }

  return (
    <div className="flex flex-col gap-10">
      <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium">Hva sier våre gjester</p>

      <div>
        <p
          ref={quoteRef}
          className={`font-sans text-(--color-text) text-xl sm:text-2xl leading-relaxed italic mb-2 whitespace-pre-line ${
            expanded ? '' : 'line-clamp-5'
          }`}
        >
          &quot;{current.quote}&quot;
        </p>

        {(overflowing || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-(--color-dark) text-xs font-semibold mb-4 underline underline-offset-4"
          >
            {expanded ? 'Vis mindre' : 'Les hele'}
          </button>
        )}

        <p className="font-semibold text-(--color-text) text-sm mt-2">{current.name}</p>
        <p className="text-(--color-muted) text-xs">{current.role}</p>
      </div>

      {testimonials.length > 1 && (
        <div className="flex items-center gap-3">
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
