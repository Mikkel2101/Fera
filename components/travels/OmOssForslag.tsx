// «Historien bak FERA» og «Møt Petter» på Om oss.
import Image from 'next/image'

const facts = [
  { value: '2018', label: 'Første padelreise' },
  { value: '100+', label: 'Reisende på tur' },
  { value: 'Alle nivåer', label: 'Fra nybegynner til viderekommen' },
]

export default function OmOssForslag() {
  return (
    <>
      {/* Historien: typografisk, uten bilde */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-(--color-overline) text-sm uppercase tracking-[0.18em] font-medium mb-4">Historien bak FERA</p>
          <h2 className="font-sans font-normal text-(--color-text) text-5xl sm:text-6xl lg:text-7xl leading-[1.05] max-w-5xl mb-14">
            Det er menneskene som gjør <span className="font-display italic">opplevelsen</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 text-(--color-subtle) text-lg leading-relaxed">
            <p>
              For oss har padel alltid handlet om mer enn selve spillet. Det handler om kulturen rundt sporten, menneskene vi
              møter og alle de gode øyeblikkene som oppstår både på og utenfor banen. Noe av det vi liker aller best, er å se
              mennesker ha det gøy sammen.
            </p>
            <p>
              Å se nye bekjentskaper bli til vennskap, latteren mellom kampene og fellesskapet som oppstår når man deler en
              interesse. Det var nettopp dette som inspirerte oss til å skape FERA, en reise med rom for gode sportslige
              opplevelser, nye mennesker og minner man tar med seg hjem.
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-10 border-t border-(--color-border)">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-sans text-(--color-dark-mid) text-4xl sm:text-5xl mb-2">{f.value}</dd>
                <dd className="text-(--color-subtle) text-base">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Grunnleggeren: ett stående portrett på sand */}
      <section className="py-20 md:py-28 bg-(--color-sand-light)">
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-20 items-center">
          <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] max-w-md md:max-w-none">
            <Image
              src="/Bilder%20fra%20tur/DSC06786.JPG"
              alt="Petter Skimmeland"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-center"
            />
          </div>
          <div>
            <p className="text-(--color-overline) text-sm uppercase tracking-[0.18em] font-medium mb-4">Grunnlegger</p>
            <h2 className="font-sans font-normal text-(--color-text) text-5xl sm:text-6xl leading-[1.05] mb-8">
              Møt Petter
            </h2>
            <div className="space-y-4 text-(--color-subtle) text-lg leading-relaxed max-w-2xl">
              <p>
                Bak FERA står Petter Skimmeland, som etter mange år som lærer vet hvor mye det betyr å legge til rette for at
                mennesker trives, føler seg inkludert og får gode opplevelser sammen.
              </p>
              <p>
                Det var nettopp denne følelsen som traff ham da han nærmest tilfeldig arrangerte sin første padelreise i 2018.
                Å se mennesker smile fra øre til øre gjennom fem dager fylt med padel, sol, nye bekjentskaper, god mat og latter
                fra morgen til kveld ga virkelig mersmak.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
