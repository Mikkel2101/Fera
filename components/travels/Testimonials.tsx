'use client'

import { useEffect, useRef, useState } from 'react'

export type Testimonial = { quote: string; name: string; role: string }

export const testimonials: Testimonial[] = [
  {
    quote:
      'FERA og Petter er fantastiske og pålitelige samarbeidspartnere på padelturer. De tilrettelegger for alle nivåer og leverer et produkt som ingen andre på markedet kan måle seg mot. Seriøs padel med gode trenere og nivåinndelte turneringer. Og så liker jeg at kveldene er satt av til sosialt og gode matopplevelser.',
    name: 'Anders Fältnas',
    role: 'Sotra Padel',
  },
  {
    quote:
      'Feratravels er perfekt for de som vil ha en gjennomført tur fra topp til tå! Petter er en omsorgsfull arrangør, som sikrer kvalitet på trenere, stemning og et helhetlig reisetilbud! Årlig tradisjon for gjengen i HPK! Anbefales på det sterkeste.',
    name: 'Cecilie Storm',
    role: 'Haugaland padelklubb',
  },
  {
    quote:
      'Vi reiste en kompisgjeng på tur for å spille padel og trene i varmen, og fikk noen helt fantastiske dager! Alt var lagt perfekt til rette – fra flott bosted og profesjonell coaching til spennende kamper mot lokale spillere på høyt nivå.\n\nPetter og André var helt supre verter og sørget for en opplevelse som overgikk forventningene våre. Vi sitter igjen med gode minner, masse padelglede og dager vi sent vil glemme!\n\nAnbefales på det sterkeste til alle som ønsker en sosial, aktiv og minnerik tur!',
    name: 'Martin Østberg',
    role: 'Gruppe fra Harstad/Bergen',
  },
]

function TestimonialCard({ t }: { t: Testimonial }) {
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const quoteRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = quoteRef.current
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [])

  return (
    <div className="bg-white rounded-2xl p-8 border border-(--color-border) flex flex-col">
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-(--color-gold)">
            <path d="M8 1l1.854 3.757L14 5.457l-3 2.923.708 4.13L8 10.427l-3.708 2.083L5 8.38 2 5.457l4.146-.7L8 1z" />
          </svg>
        ))}
      </div>

      <p
        ref={quoteRef}
        className={`text-(--color-text) text-sm leading-relaxed mb-2 italic whitespace-pre-line ${
          expanded ? '' : 'line-clamp-4 min-h-[6.5em]'
        }`}
      >
        &quot;{t.quote}&quot;
      </p>

      {/* Knappen holder plassen sin også når den er skjult, så alle kort er like høye før expand */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-hidden={!(overflowing || expanded)}
        tabIndex={overflowing || expanded ? 0 : -1}
        className={`text-(--color-dark) text-xs font-semibold mb-6 self-start underline ${
          overflowing || expanded ? '' : 'invisible'
        }`}
      >
        {expanded ? 'Vis mindre' : 'Les hele'}
      </button>

      <div className="mt-auto">
        <p className="font-semibold text-(--color-text) text-sm">{t.name}</p>
        <p className="text-(--color-muted) text-xs">{t.role}</p>
      </div>
    </div>
  )
}

const arrowClass =
  'w-10 h-10 rounded-full border-0 sm:border sm:border-(--color-border) flex items-center justify-center text-(--color-dark) hover:bg-white transition-colors'

export default function Testimonials() {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <section className="pt-24 pb-32 overflow-hidden bg-(--color-sand-light)">
      <div className="max-w-[1450px] mx-auto px-4">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-(--color-overline) text-sm uppercase tracking-widest font-medium mb-2">Hva sier våre reisende</p>
            <h2 className="font-sans font-normal text-(--color-text) text-5xl sm:text-6xl">
              Over 100 fornøyde gjester
            </h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => scroll(-1)} aria-label="Forrige omtaler" className={arrowClass}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label="Neste omtaler" className={arrowClass}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
        <div
          ref={scrollerRef}
          className="flex items-start gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ marginRight: 'calc(-50vw + 50%)' }}
        >
          {testimonials.map((t) => (
            <div key={t.name} className="flex w-[85vw] shrink-0 snap-start sm:w-[460px] lg:w-[520px] [&>*]:w-full">
              <TestimonialCard t={t} />
            </div>
          ))}
          <div className="w-4 shrink-0 sm:w-6 lg:w-8" />
        </div>
      </div>
    </section>
  )
}
