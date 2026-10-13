import TilbudForm from '@/components/travels/skreddersydde/TilbudForm'

export const metadata = {
  title: 'Skreddersydde reiser — Fera',
  description: 'Padelreiser skreddersydd for padelsentre, klubber, bedrifter og mindre grupper. Vi setter sammen hele opplegget og tar kontakt innen 24 timer.',
}

const features = [
  { title: 'Padel & coaching', desc: 'Få coaching i verdensklasse, nivåtilpasset trening og spill, og organiserte turneringer mot lokale spillere.' },
  { title: 'Team-bygging', desc: 'Turneringer, lagkonkurranser og aktiviteter som bygger teamkultur og samhold.' },
  { title: 'Gastronomiske opplevelser', desc: 'Nøye utvalgte restauranter og gode matopplevelser i vakre omgivelser.' },
  { title: 'Lokalkunnskap', desc: 'Vi kjenner destinasjonene godt og velger opplevelser de fleste turister aldri finner på egenhånd.' },
]

export default function SkreddersyddeReiserPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[calc(88svh-4rem)] md:min-h-[calc(92svh-4rem)] flex items-center overflow-hidden bg-(--color-community)">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-(--color-overlay)/80" />
        <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-(--color-sand) text-xs tracking-widest uppercase font-sans mb-4">
              Tilpassede reiser
            </p>
            <h1 className="font-sans font-bold text-white text-4xl md:text-6xl leading-tight mb-6">
              Den neste padelopplevelsen <span className="font-display italic">starter her</span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
              Enten dere er et padelsenter, en klubb, en bedrift eller en vennegjeng, tilbyr vi profesjonelle padelreiser med coaching, overnatting og opplevelser – med mulighet for tilpasninger etter deres behov.
            </p>
            <a
              href="#tilbud"
              className="inline-block bg-white text-(--color-dark) font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-(--color-sand) transition-colors"
            >
              Be om tilbud →
            </a>
          </div>
        </div>
      </section>

      {/* Hva vi leverer */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-3 text-center">Hva vi leverer</p>
          <h2 className="font-sans font-bold text-(--color-text) text-4xl sm:text-5xl mb-4 text-center">Mer enn bare padel</h2>
          <p className="text-(--color-muted) text-center max-w-2xl mx-auto mb-12">
            FERA kombinerer profesjonell padel-coaching med gode opplevelser og genuin lokalkunnskap. Resultatet? En tur som vil bli husket og snakket om i årevis.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="border border-(--color-border) rounded-2xl p-6">
                <h3 className="font-sans font-bold text-(--color-text) text-xl mb-2">{f.title}</h3>
                <p className="text-(--color-muted) text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skjema */}
      <section id="tilbud" className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-dark)">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-sans font-bold text-white text-3xl sm:text-4xl mb-3 text-center">Be om tilbud</h2>
          <p className="text-white/60 text-center leading-relaxed mb-10">
            Pris avhenger av antall, destinasjon, varighet og aktiviteter. Vi gir deg et transparent tilbud uten skjulte kostnader.
          </p>
          <TilbudForm />
        </div>
      </section>
    </>
  )
}
