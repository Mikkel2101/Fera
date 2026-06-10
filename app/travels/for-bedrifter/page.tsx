import Image from 'next/image'
import ContactForm from '@/components/shared/ContactForm'

export const metadata = {
  title: 'Grupper & bedriftsturer — Fera',
  description: 'Vi arrangerer alt fra årstur til lederkonferanse med padel i sentrum. Skreddersydd for din gruppe.',
}

const features = [
  { title: 'Padel & coaching', desc: 'Profesjonelle trenere, organiserte turneringer og coaching tilpasset gruppens nivå.' },
  { title: 'Team-bygging', desc: 'Mexicano-turneringer, lagkonkurranser og aktiviteter som bygger teamkultur og samhold.' },
  { title: 'Gastronomiske opplevelser', desc: 'Utvalgte restauranter og vinsmakinger med lokalkjennskap. Mat og drikke i verdensklasse.' },
  { title: 'Lokalkunnskap', desc: 'Vi kjenner destinasjonene godt og velger opplevelser de fleste turister aldri finner på egenhånd.' },
]

const activities = [
  { title: 'Gokart', desc: 'Adrenalin og konkurranseinstinkt – perfekt start på en kveld.' },
  { title: 'Fjellturer', desc: 'Spektakulær natur og utsikt. Tilpasset tempo og varighet.' },
  { title: 'Vinsmaking', desc: 'Lokale vinhus og gourmet-opplevelser tilpasset gruppens smak.' },
  { title: 'Båtturer', desc: 'Dagstur til sjøs med snorkling, bading og middag om bord.' },
  { title: 'Golf', desc: 'Tilgang til vakre baner langs Costa Blanca og Marbella.' },
  { title: 'Og mye mer…', desc: 'Vi skreddersyr hvert eneste element basert på hva akkurat din gruppe ønsker.' },
]

export default function ForBedrifterPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-(--color-dark) px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1600&q=80"
            alt="Bedriftstur padel"
            fill
            sizes="100vw"
            className="object-cover opacity-15"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-(--color-dark)/80 to-(--color-dark)" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-white/50 text-xs tracking-widest uppercase font-sans mb-4">
            For grupper & bedrifter
          </p>
          <h1 className="font-display text-white text-4xl md:text-6xl font-bold leading-tight mb-6">
            Grupper & bedriftsturer{' '}
            <em className="italic text-(--color-sand)">skreddersydd</em>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Vi arrangerer alt fra årstur til lederkonferanse med padel i sentrum. Med vår lokalkunnskap og brede nettverk skaper vi opplevelser som slår alt dere har gjort tidligere.
          </p>
          <a
            href="#tilbud"
            className="inline-block bg-white text-(--color-dark) font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-(--color-sand) transition-colors"
          >
            Be om tilbud →
          </a>
        </div>
      </section>

      {/* Hva vi leverer */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-3 text-center">Hva vi leverer</p>
          <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl mb-4 text-center">Mer enn bare padel</h2>
          <p className="text-(--color-muted) text-center max-w-2xl mx-auto mb-12">
            Fera kombinerer profesjonell padel-coaching med eksklusive opplevelser og genuin lokalkunnskap. Resultatet? En tur gruppen snakker om i årevis.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="border border-(--color-border) rounded-2xl p-6">
                <h3 className="font-display font-bold text-(--color-text) text-lg mb-2">{f.title}</h3>
                <p className="text-(--color-muted) text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aktiviteter utover banen */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-ice-light)">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl mb-4 text-center">Aktiviteter utover banen</h2>
          <p className="text-(--color-muted) text-center max-w-xl mx-auto mb-12">
            Med vår lokalkunnskap og brede nettverk setter vi sammen opplevelser som passer gruppen perfekt.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((a) => (
              <div key={a.title} className="bg-white rounded-xl p-5 border border-(--color-border)">
                <h3 className="font-display font-bold text-(--color-text) mb-1">{a.title}</h3>
                <p className="text-(--color-muted) text-sm leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pris */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center border border-(--color-border) rounded-2xl p-10">
          <h2 className="font-display font-bold text-(--color-text) text-2xl mb-4">Pris etter avtale</h2>
          <p className="text-(--color-muted) leading-relaxed mb-3">
            Alle bedrifts- og gruppeturer skreddersys i sin helhet. Pris avhenger av antall, destinasjon, varighet, aktivitetsmix og standard. Vi gir deg et transparent, detaljert tilbud uten skjulte kostnader.
          </p>
          <p className="text-(--color-muted) text-sm italic mb-6">
            Har dere krav til antall overnattingsnetter, minimum aktivitetsnivå eller budsjettramme? Fortell oss i meldingen så setter vi opp et skreddersydd opplegg.
          </p>
          <a href="#tilbud" className="inline-block bg-(--color-cta) text-white font-semibold text-sm px-7 py-3 rounded-full hover:opacity-90 transition-opacity">
            Be om tilbud →
          </a>
        </div>
      </section>

      {/* Skjema */}
      <section id="tilbud" className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-dark)">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display italic font-bold text-white text-3xl sm:text-4xl mb-3 text-center">Be om tilbud</h2>
          <p className="text-white/60 text-center mb-10">Vi skreddersyr turen etter deres ønsker og tar kontakt innen 24 timer.</p>
          <ContactForm
            type="bedrifter"
            fields={[
              { name: 'navn', label: 'Ditt navn', required: true },
              { name: 'bedrift', label: 'Bedrift/gruppe', required: true },
              { name: 'epost', label: 'E-post', type: 'email', required: true },
              { name: 'telefon', label: 'Telefon' },
              { name: 'antall', label: 'Estimert antall deltakere', fullWidth: true },
            ]}
            messagePlaceholder="Antall dager, destinasjon, ønsket aktivitetsmix, budsjettramme, spesielle ønsker..."
            messageLabel="Fortell oss om ønskene"
            submitLabel="Be om tilbud →"
            successMessage="Takk for forespørselen! Vi sender et skreddersydd tilbud innen 24 timer."
          />
        </div>
      </section>
    </>
  )
}
