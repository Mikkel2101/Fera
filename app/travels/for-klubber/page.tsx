import Image from 'next/image'
import ContactForm from '@/components/shared/ContactForm'

export const metadata = {
  title: 'For klubber & trenere — Fera',
  description: 'Ta med gruppen på padel-eventyr. Vi skreddersyr hele reisen for deg og gruppen din.',
}

const steps = [
  { num: '01', title: 'Send forespørsel', desc: 'Fortell oss om gruppen — antall, nivå, ønsket tidspunkt og destinasjon.' },
  { num: '02', title: 'Vi setter opp et opplegg', desc: 'Innen 24 timer kommer vi med et skreddersydd tilbud uten skjulte kostnader.' },
  { num: '03', title: 'Dere møter opp', desc: 'Alt er ordnet. Hotell, baner, coaching og sosiale opplevelser — vi fikser resten.' },
]

export default function ForKlubberPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-(--color-community) px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1526888935184-a82d2a4b7e67?w=1600&q=80"
            alt="Padel gruppe"
            fill
            sizes="100vw"
            className="object-cover opacity-20"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-(--color-community)/80 to-(--color-community)" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-(--color-sand) text-xs tracking-widest uppercase font-sans mb-4">
            For klubber & trenere
          </p>
          <h1 className="font-display text-white text-4xl md:text-6xl font-bold leading-tight mb-6">
            Ta med gruppen på{' '}
            <em className="italic text-(--color-sand)">padel-eventyr</em>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Enten du er trener, klubbleder eller initiativtaker – vi skreddersyr hele reisen for deg og gruppen din. Du trenger bare å sende en forespørsel.
          </p>
          <a
            href="#forespørsel"
            className="inline-block bg-white text-(--color-dark) font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-(--color-sand) transition-colors"
          >
            Send forespørsel →
          </a>
        </div>
      </section>

      {/* Hvorfor Fera */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-3">Hvorfor Fera</p>
          <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl mb-6">Opplevelser som samler</h2>
          <p className="text-(--color-muted) text-lg leading-relaxed">
            Vi har arrangert turer for klubber fra hele Norge. Resultatet er alltid det samme: grupper som kommer hjem bedre, sterkere og mer samkjørt enn før.
          </p>
        </div>
      </section>

      {/* Slik fungerer det */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-(--color-ice-light)">
        <div className="max-w-4xl mx-auto">
          <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-3 text-center">Slik fungerer det</p>
          <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl mb-12 text-center">Tre enkle steg fra idé til opplevelse</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <span className="font-display font-bold text-5xl text-(--color-dark) block mb-4 opacity-20">{step.num}</span>
                <h3 className="font-display font-bold text-(--color-text) text-lg mb-2">{step.title}</h3>
                <p className="text-(--color-muted) text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pris */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center border border-(--color-border) rounded-2xl p-10">
          <h2 className="font-display font-bold text-(--color-text) text-2xl mb-4">Pris etter avtale</h2>
          <p className="text-(--color-muted) leading-relaxed mb-6">
            Alle gruppeturer skreddersys etter gruppens ønsker og behov. Send en forespørsel, så setter vi opp et uforpliktende opplegg basert på antall deltakere, destinasjon og ønsket standard.
          </p>
          <a href="#forespørsel" className="inline-block bg-(--color-cta) text-white font-semibold text-sm px-7 py-3 rounded-full hover:opacity-90 transition-opacity">
            Be om tilbud →
          </a>
        </div>
      </section>

      {/* Skjema */}
      <section id="forespørsel" className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-dark)">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display italic font-bold text-white text-3xl sm:text-4xl mb-3 text-center">Send en forespørsel</h2>
          <p className="text-white/60 text-center mb-10">Vi tar kontakt innen 24 timer med et uforpliktende tilbud.</p>
          <ContactForm
            type="klubber"
            fields={[
              { name: 'navn', label: 'Ditt navn', required: true },
              { name: 'klubb', label: 'Klubb/organisasjon', required: true },
              { name: 'epost', label: 'E-post', type: 'email', required: true },
              { name: 'telefon', label: 'Telefon' },
              { name: 'antall', label: 'Estimert antall' },
              { name: 'tidspunkt', label: 'Ønsket tidspunkt', placeholder: 'F.eks. Høst 2026, Vinter 2027' },
            ]}
            messagePlaceholder="Nivå, spesielle ønsker, antall dager, destinasjon du drømmer om..."
            messageLabel="Fortell oss om gruppen og ønskene"
          />
        </div>
      </section>
    </>
  )
}
