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
      <section className="bg-gradient-to-b from-(--color-dark) to-(--color-dark-mid) px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
        <div className="max-w-3xl mx-auto">
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
          <form action="mailto:post@feratravels.com" method="get" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-xs mb-1.5 uppercase tracking-widest">Ditt navn *</label>
                <input required name="navn" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/50" />
              </div>
              <div>
                <label className="block text-white/70 text-xs mb-1.5 uppercase tracking-widest">Bedrift/gruppe *</label>
                <input required name="bedrift" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/50" />
              </div>
              <div>
                <label className="block text-white/70 text-xs mb-1.5 uppercase tracking-widest">E-post *</label>
                <input required type="email" name="epost" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/50" />
              </div>
              <div>
                <label className="block text-white/70 text-xs mb-1.5 uppercase tracking-widest">Telefon</label>
                <input name="telefon" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/50" />
              </div>
            </div>
            <div>
              <label className="block text-white/70 text-xs mb-1.5 uppercase tracking-widest">Estimert antall deltakere</label>
              <input name="antall" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/50" />
            </div>
            <div>
              <label className="block text-white/70 text-xs mb-1.5 uppercase tracking-widest">Fortell oss om ønskene</label>
              <textarea rows={4} name="melding" placeholder="Antall dager, destinasjon, ønsket aktivitetsmix, budsjettramme, spesielle ønsker..." className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/50 resize-none" />
            </div>
            <button type="submit" className="w-full bg-white text-(--color-dark) font-semibold py-3.5 rounded-full hover:bg-(--color-sand) transition-colors text-sm">
              Send forespørsel →
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
