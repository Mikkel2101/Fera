'use client'

import { useEffect, useRef, useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { nb } from 'date-fns/locale'

type Props = {
  label: string
  from: string
  to: string
  onChange: (from: string, to: string) => void
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function fromISO(value: string): Date | undefined {
  return value ? new Date(`${value}T00:00:00`) : undefined
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
}

// Egne Tailwind-klasser for hver del av kalenderen — matcher Fera-paletten og
// DM Sans, i stedet for bibliotekets standard-CSS (importeres ikke).
const calendarClassNames = {
  root: 'p-4 font-sans',
  months: 'flex flex-col',
  month_caption: 'relative flex items-center justify-center h-9 mb-2',
  caption_label: 'text-sm font-semibold text-(--color-text)',
  nav: 'contents',
  button_previous: 'absolute left-1 top-0 p-1.5 rounded-lg text-(--color-subtle) hover:bg-(--color-ice-light) hover:text-(--color-text) transition-colors disabled:opacity-30',
  button_next: 'absolute right-1 top-0 p-1.5 rounded-lg text-(--color-subtle) hover:bg-(--color-ice-light) hover:text-(--color-text) transition-colors disabled:opacity-30',
  chevron: 'w-4 h-4 fill-current',
  month_grid: 'w-full border-collapse',
  weekday: 'text-(--color-muted) text-[11px] font-medium uppercase w-9 h-7',
  day: 'p-0 text-center align-middle',
  day_button: 'w-9 h-9 rounded-full text-sm text-(--color-text) hover:bg-(--color-ice-light) transition-colors',
  today: '[&>button]:font-bold [&>button]:text-(--color-cta)',
  outside: 'text-(--color-muted)/40',
  disabled: 'text-(--color-muted)/30',
  hidden: 'invisible',
  range_start: 'bg-(--color-ice-light) rounded-l-full [&>button]:bg-(--color-cta) [&>button]:text-white [&>button]:hover:bg-(--color-dark-mid)',
  range_end: 'bg-(--color-ice-light) rounded-r-full [&>button]:bg-(--color-cta) [&>button]:text-white [&>button]:hover:bg-(--color-dark-mid)',
  range_middle: 'bg-(--color-ice-light)',
  selected: 'rounded-full [&>button]:bg-(--color-cta) [&>button]:text-white',
}

export default function DateRangePicker({ label, from, to, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const range: DateRange = { from: fromISO(from), to: fromISO(to) }

  function handleSelect(next: DateRange | undefined) {
    onChange(next?.from ? toISO(next.from) : '', next?.to ? toISO(next.to) : '')
    if (next?.from && next?.to) setOpen(false)
  }

  const display = range.from
    ? `${formatDay(range.from)}${range.to ? ` – ${formatDay(range.to)}` : ''}`
    : 'Velg datoer'

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-white/70 text-xs mb-1.5 uppercase tracking-widest">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-colors"
      >
        {display}
      </button>
      {open && (
        <div className="absolute z-20 mt-2 bg-white border border-(--color-border) rounded-2xl shadow-xl">
          <DayPicker
            mode="range"
            locale={nb}
            selected={range}
            onSelect={handleSelect}
            weekStartsOn={1}
            classNames={calendarClassNames}
          />
        </div>
      )}
    </div>
  )
}
