'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Testimonial } from '@/components/travels/Testimonials'

const INTERVAL_MS = 6500
const CIRCLE_SIZE = 40
const RADIUS = 17
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const quoteRef = useRef<HTMLParagraphElement>(null)
  const current = testimonials[index]

  useEffect(() => {
    const el = quoteRef.current
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [index])

  useEffect(() => {
    if (expanded || testimonials.length <= 1) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length)
      setCycle((c) => c + 1)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [expanded, testimonials.length])

  function prev() {
    setExpanded(false)
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
    setCycle((c) => c + 1)
  }

  function next() {
    setExpanded(false)
    setIndex((i) => (i + 1) % testimonials.length)
    setCycle((c) => c + 1)
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
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-(--color-dark) hover:bg-white transition-colors"
          >
            <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`} className="absolute inset-0 -rotate-90">
              <circle cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth="1.5" />
              <circle
                key={cycle}
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="var(--color-dark)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE}
                className="circle-fill"
                style={{ '--circle-circumference': CIRCUMFERENCE, animationDuration: `${INTERVAL_MS}ms` } as CSSProperties}
              />
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
