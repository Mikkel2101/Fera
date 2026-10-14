'use client'

import { useEffect, useRef, useState, type TouchEvent, type CSSProperties } from 'react'

type FeatureItem = { title: string; detail: string }

const INTERVAL_MS = 4500
const CIRCLE_SIZE = 56
const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function IconChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 6-6 6 6 6" />
    </svg>
  )
}

export default function HeroFeatureLoop({ items }: { items: FeatureItem[] }) {
  const [index, setIndex] = useState(0)
  const [cycle, setCycle] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length)
      setCycle((c) => c + 1)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [items.length])

  function goTo(next: number) {
    setIndex((next + items.length) % items.length)
    setCycle((c) => c + 1)
  }

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 32) return
    goTo(delta < 0 ? index + 1 : index - 1)
  }

  const item = items[index]

  return (
    <div className="mt-16 max-w-3xl border-t border-white/25 pt-6" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex items-center justify-between gap-4">
        <div key={index} className="min-h-[52px] animate-[fadeInUp_0.4s_ease-out_both]" role="status" aria-live="polite">
          <p className="text-white font-semibold text-lg uppercase tracking-wide">{item.title}</p>
          <p className="text-white/75 text-sm">{item.detail}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Vis forrige fordel"
            className="grid size-9 place-items-center rounded-full text-white/70 transition-colors hover:text-white"
          >
            <IconChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Vis neste fordel"
            className="relative grid place-items-center rounded-full text-white"
            style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
          >
            <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`} className="absolute inset-0 -rotate-90">
              <circle cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <circle
                key={cycle}
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE}
                className="circle-fill"
                style={{ '--circle-circumference': CIRCUMFERENCE, animationDuration: `${INTERVAL_MS}ms` } as CSSProperties}
              />
            </svg>
            <IconChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}
