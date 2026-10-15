// Ikke i bruk nå: de opprinnelige seksjonene «Historien bak FERA» og «Møt grunnleggeren» fra Om oss,
// erstattet av OmOssForslag. Beholdt for gjenbruk av designet.
import Image from 'next/image'

export default function OmOssHistorieOriginal() {
  return (
    <>
      {/* Historien bak Fera */}
      <section className="py-20">
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-center">
            <div>
              <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-3">Historien bak FERA</p>
              <h2 className="font-sans font-bold text-(--color-text) text-4xl sm:text-5xl mb-6">Det er menneskene som gjør opplevelsen</h2>
              <div className="space-y-4 text-(--color-muted) leading-relaxed">
                <p>
                  For oss har padel alltid handlet om mer enn selve spillet. Det handler om kulturen rundt sporten, menneskene vi møter og alle de gode øyeblikkene som oppstår både på og utenfor banen.
                </p>
                <p>
                  Noe av det vi liker aller best, er å se mennesker ha det gøy sammen. Å se nye bekjentskaper bli til vennskap, latteren mellom kampene og fellesskapet som oppstår når man deler en interesse.
                </p>
                <p>
                  Det var nettopp dette som inspirerte oss til å skape FERA. Vi ønsket å kombinere padel og reising på en måte som gir rom for både gode sportslige opplevelser, nye mennesker og minner man tar med seg hjem.
                </p>
              </div>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
              <Image
                src="/Bilder%20fra%20tur/DSC00763.JPG"
                alt="Padelspillere som feirer sammen på banen"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Petter */}
      <section className="py-20">
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-center">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
              <Image
                src="/Bilder%20fra%20tur/DSC06786.JPG"
                alt="Petter Skimmeland"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
            <div>
              <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-3">Grunnlegger</p>
              <h2 className="font-sans font-bold text-(--color-text) text-4xl sm:text-5xl mb-6">Møt grunnleggeren av FERA</h2>
              <div className="space-y-4 text-(--color-muted) leading-relaxed">
                <p>
                  Bak FERA står Petter Skimmeland, som etter mange år som lærer vet hvor mye det betyr å legge til rette for at mennesker trives, føler seg inkludert og får gode opplevelser sammen.
                </p>
                <p>
                  Det var nettopp denne følelsen som traff ham da han nærmest tilfeldig arrangerte sin første padelreise i 2018. Å se mennesker smile fra øre til øre gjennom fem dager fylt med padel, sol, nye bekjentskaper, god mat og latter fra morgen til kveld ga virkelig mersmak.
                </p>
                <p>
                  Opplevelsen inspirerte Petter til å satse videre. På under ett år hadde han arrangert en rekke padelreiser og tatt med over 100 reisende på tur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
