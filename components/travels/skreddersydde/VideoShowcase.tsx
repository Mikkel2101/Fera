// «Mer enn bare padel» på tilpassede reiser, med videoen fra forsiden i en innrammet flate.
type Feature = { title: string; desc: string }

export default function VideoShowcase({ features }: { features: Feature[] }) {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 flex flex-col gap-10 lg:grid lg:grid-cols-[1fr_1fr] lg:gap-20 lg:items-center">
        {/* På mobil løses denne opp, så videoen kan ligge mellom ingressen og punktene */}
        <div className="contents lg:block">
          <div className="order-1">
            <p className="text-(--color-overline) text-sm uppercase tracking-[0.18em] font-medium mb-4">Hva vi leverer</p>
            <h2 className="font-sans font-normal text-(--color-text) text-5xl sm:text-6xl leading-[1.05] mb-6">
              Mer enn bare<br className="sm:hidden" /> <span className="font-display italic">padel</span>
            </h2>
            <p className="text-(--color-text) text-lg leading-relaxed max-w-xl lg:mb-10">
              FERA kombinerer profesjonell padel-coaching med gode opplevelser og genuin lokalkunnskap. Resultatet? En tur
              som vil bli husket og snakket om i årevis.
            </p>
          </div>

          <ol className="order-3 border-t border-(--color-border) max-w-xl">
            {features.map((f, i) => (
              <li key={f.title} className="flex gap-6 py-6 border-b border-(--color-border)">
                <span className="text-(--color-dark-mid) text-xl font-medium tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-(--color-text) font-semibold text-xl mb-1">{f.title}</h3>
                  <p className="text-(--color-subtle) text-base leading-relaxed">{f.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="order-2 lg:order-none relative rounded-[28px] overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[min(780px,85svh)] bg-(--color-community)">
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            poster="/Solrik%20padelglede%20i%20resortmilj%C3%B8%20FINAL%202%20MOBIL.png"
            className="absolute inset-0 w-full h-full object-cover"
            src="/fera-travels.mp4"
          />
        </div>
      </div>
    </section>
  )
}
