'use client'

import { useEffect, useRef, useState } from 'react'

type Testimonial = { quote: string; name: string; role: string }

const testimonials: Testimonial[] = [
  {
    quote:
      'FERA og Petter er fantastiske og pålitelige samarbeidspartnere på padelturer. De tilrettelegger for alle nivåer og leverer et produkt som ingen andre på markedet kan måle seg mot. Seriøs padel med gode trenere og nivåinndelte turneringer. Og så liker jeg at kveldene er satt av til sosialt og gode matopplevelser.',
    name: 'Anders Fältnas',
    role: 'Eier og senterleder, Sotra Padel',
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
          expanded ? '' : 'line-clamp-4'
        }`}
      >
        &quot;{t.quote}&quot;
      </p>

      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-(--color-dark) text-xs font-semibold mb-6 self-start underline"
        >
          {expanded ? 'Vis mindre' : 'Les hele'}
        </button>
      )}

      <div className="mt-auto">
        <p className="font-semibold text-(--color-text) text-sm">{t.name}</p>
        <p className="text-(--color-muted) text-xs">{t.role}</p>
      </div>
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="pt-24 pb-32 bg-(--color-sand-light)">
      <div className="max-w-[1450px] mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-3">Hva sier våre reisende</p>
          <h2 className="font-sans font-normal text-(--color-text) text-4xl sm:text-5xl">
            Over 100 fornøyde gjester
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
