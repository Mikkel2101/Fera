'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const faqs = [
  {
    q: 'Hva er inkludert i prisen?',
    a: 'Alle Fera-turer inkluderer hotell med frokost, baneleie, coaching, lokal transport og minst én felles middag. Se den spesifikke turens detaljside for nøyaktig innhold.',
  },
  {
    q: 'Hvor mange er på en tur?',
    a: 'Vi har maksimum 20 deltakere per tur. Det sikrer at alle får god oppfølging på banen og at gruppen er håndterbar sosialt. Mange turer er enda mindre.',
  },
  {
    q: 'Hva med fly?',
    a: 'Fly er ikke inkludert i prisen og bookes av deg selv. Vi sender reiseinformasjon med anbefalte fly og ankomst-/avreisestider når du har bekreftet plassen din.',
  },
  {
    q: 'Hva skjer hvis det er dårlig vær?',
    a: 'Banene på Costa Blanca og Gran Canaria er i all overveiende grad utendørs, men vi har alltid innendørsalternativer tilgjengelig. Dårlig vær er sjeldent et problem på våre destinasjoner.',
  },
  {
    q: 'Hvordan reserverer jeg plass?',
    a: 'Du reserverer plass med en Fera-konto direkte på turen — det koster ingenting og er uforpliktende. Vi holder av plassen din og tar kontakt med betalingsinformasjon før påmeldingen blir bindende.',
  },
  {
    q: 'Hva er avbestillingsreglene?',
    a: 'En reservasjon kan avbestilles kostnadsfritt — send oss en e-post. Avbestillingsreglene for bindende påmelding får du sammen med betalingsinformasjonen. Vi anbefaler reiseforsikring.',
  },
  {
    q: 'Kan dere skreddersy tur for vår klubb eller bedrift?',
    a: 'Absolutt! Vi arrangerer private gruppeturer for alt fra 8 til 30 deltakere. Ta kontakt via for-klubber- eller for-bedrifter-sidene for et uforpliktende tilbud.',
  },
  {
    q: 'Kan vi få spesiell mat (allergier, preferanser)?',
    a: 'Ja. Oppgi eventuell matallergier eller preferanser i bookingskjemaet, så sørger vi for at det er tatt hensyn til på restaurantene og eventuelle felles måltider.',
  },
  {
    q: 'Hvilket nivå passer turene for?',
    a: 'Turene er åpne for alle nivåer fra nybegynner til avansert. Vi organiserer coaching og spill i jevnbyrdige grupper slik at alle utvikler seg og koser seg.',
  },
  {
    q: 'Kan jeg reise alene?',
    a: 'Ja, mange av våre gjester reiser alene. Turene er sosialt lagt opp og du møter fort andre padel-entusiaster. Vi hjelper med romfordeling hvis ønskelig.',
  },
  {
    q: 'Hva er inkludert av trening?',
    a: 'Alle turer inkluderer minimum én coaching-økt per dag. Innholdet varierer mellom teknikk, taktikk og turnering. Detaljert program legges ut på turens side.',
  },
  {
    q: 'Når er siste frist for å melde seg på?',
    a: 'Vi anbefaler å melde seg på så tidlig som mulig da turene fylles raskt. Siste frist er normalt 3 uker før avreise, men vi tar kontakt hvis en tur er nær full.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-(--color-border) rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-(--color-ice-light) transition-colors"
      >
        <span className="font-medium text-(--color-text) text-sm sm:text-base">{q}</span>
        <span className={`text-(--color-muted) text-lg ml-4 transition-transform flex-shrink-0 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-(--color-muted) text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FaqPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-(--color-community) px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1600&q=80"
            alt="Padel coaching"
            fill
            sizes="100vw"
            className="object-cover opacity-15"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-(--color-community)/80 to-(--color-community)" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-white/50 text-xs tracking-widest uppercase font-sans mb-4">Spørsmål</p>
          <h1 className="font-display text-white text-4xl md:text-6xl font-bold leading-tight mb-6">
            Vanlige{' '}
            <em className="italic text-(--color-sand)">spørsmål</em>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Alt du lurer på om våre padelreiser. Finner du ikke svaret? Ta kontakt!
          </p>
        </div>
      </section>

      {/* FAQ-liste */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-(--color-muted) mb-4">Fant du ikke svaret?</p>
          <a
            href="mailto:post@feratravels.com"
            className="inline-block bg-(--color-cta) text-white font-semibold text-sm px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
          >
            Kontakt oss →
          </a>
        </div>
      </section>
    </>
  )
}
