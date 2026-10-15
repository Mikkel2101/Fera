// Ikke i bruk nå: kort-varianten av «Mer enn bare padel» fra tilpassede reiser,
// erstattet av VideoShowcase. Beholdt for gjenbruk av designet.
type Feature = { title: string; desc: string }

export default function FeatureCards({ features }: { features: Feature[] }) {
  return (
    <section className="py-20">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
        <div>
          <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-3">Hva vi leverer</p>
          <h2 className="font-sans font-bold text-(--color-text) text-4xl sm:text-5xl mb-4">Mer enn bare padel</h2>
          <p className="text-(--color-text) text-lg leading-relaxed">
            FERA kombinerer profesjonell padel-coaching med gode opplevelser og genuin lokalkunnskap. Resultatet? En tur som vil bli husket og snakket om i årevis.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-(--color-sand-light) lg:hover:bg-(--color-dark) rounded-2xl p-8 transition-colors duration-300"
            >
              <h3 className="flex items-center gap-3 font-sans font-bold text-(--color-text) lg:group-hover:text-white text-2xl mb-3 transition-colors duration-300">
                <span className="w-[7px] h-[7px] rounded-full bg-(--color-dark-mid) lg:group-hover:bg-(--color-sand) transition-colors duration-300" />
                {f.title}
              </h3>
              <p className="text-(--color-subtle) lg:group-hover:text-white text-base leading-relaxed transition-colors duration-300">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
