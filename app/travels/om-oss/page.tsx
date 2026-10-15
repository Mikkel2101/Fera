import Link from 'next/link'
import Image from 'next/image'
import OmOssForslag from '@/components/travels/OmOssForslag'

const HERO_BG = 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=80'

export const metadata = {
  title: 'Om oss — FERA',
  description: 'Vi startet med en enkel idé: å kombinere det beste fra padel med det beste fra reising.',
}

const values = [
  { title: 'Profesjonell', desc: 'Alt er gjennomtenkt ned til minste detalj. Fra banebooking til restaurantvalg.' },
  { title: 'Varm', desc: 'Vi er ingen korporativ reisebyrå. Vi er padel-folk som elsker å skape gode opplevelser.' },
  { title: 'Lokal', desc: 'Vi kjenner Costa Blanca som vår egen bakgård. De beste stedene, de skjulte perlene.' },
  { title: 'Tilgjengelig', desc: 'Premium opplevelser til en pris som fungerer. Eksklusivt, men ikke utilnærmelig.' },
]

export default function OmOssPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[45svh] md:min-h-[50svh] flex items-center overflow-hidden bg-(--color-community)">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-(--color-overlay)/80" />
        <div className="relative w-full max-w-[1450px] mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="max-w-4xl">
            <p className="text-(--color-sand) text-xs tracking-widest uppercase font-sans mb-4">Om oss</p>
            <h1 className="font-sans font-bold text-white text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 lg:whitespace-nowrap">
              Mer enn bare padelreiser
            </h1>
            <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
              Teamet bak FERA elsker padel, reising og alt det fine som skjer når mennesker møtes. Det er denne lidenskapen som ligger bak våre nøye sammensatte padelreiser.
            </p>
          </div>
        </div>
      </section>

      {/* Historien bak FERA + grunnleggeren */}
      <OmOssForslag />

      {/* Sitat fra grunnleggeren */}
      <section className="relative min-h-[480px] md:min-h-[560px] flex items-center overflow-hidden bg-(--color-dark)">
        <Image
          src="/Bilder%20fra%20tur/DSC05300.JPG"
          alt="Petter Skimmeland"
          fill
          sizes="100vw"
          className="object-cover object-top"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-(--color-overlay-neutral)/90" />
        <div className="relative w-full max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl">
            <p className="font-sans text-2xl sm:text-3xl lg:text-4xl leading-relaxed text-white">
              «For meg handler FERA om mye mer enn padel. Det handler om menneskene og opplevelsene, både på og utenfor banen. Jeg gleder meg til å bli kjent med alle som blir med oss på tur, og skal gjøre mitt aller beste for at alle får lyst til å komme tilbake igjen og igjen.»
            </p>
            <p className="mt-6 text-white/70 text-sm">— Petter Skimmeland, grunnlegger av FERA</p>
          </div>
        </div>
      </section>

      {/* André — skjult, skal brukes igjen senere
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-ice-light)">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="order-2 lg:order-1">
              <p className="text-(--color-overline) text-xs uppercase tracking-widest font-medium mb-3">Partner & Coach</p>
              <h2 className="font-display italic font-bold text-(--color-text) text-3xl mb-2">André Schlyter</h2>
              <p className="text-(--color-muted) text-sm italic mb-6">Coach i verdensklasse</p>
              <div className="space-y-4 text-(--color-muted) leading-relaxed">
                <p>
                  André er en av Sveriges mest anerkjente padeltrenere, med bakgrunn fra toppnivå-coaching og en evne til å gjøre alle bedre – uansett nivå. I tillegg er han en meget god og merittert padelspiller selv, og kan skilte med både landskamper og noen kjente skalper i bagasjen.
                </p>
                <p>
                  Det som gjør André unik er hans evne til å se menneskene på banen. Det er aldri noen som går fra en økt med han uten et stort smil om munnen. Han slenger svenske gloser i hytt og pine, men alltid med et glimt i øyet.
                </p>
                <p>
                  André har også vært eier av — og drevet — padelsenter både i Sverige og Spania, og har derfor bred erfaring både på banen og bak kulissene i padelverdenen.
                </p>
                <p>
                  Kort fortalt er dette en mann du må oppleve. En utrolig god venn, en gledesspreder, nybakt pappa, og padeltrener i verdensklasse. Og en ekstremt viktig del av FERA-teamet.
                </p>
                <p className="text-(--color-text) font-medium">
                  Når du reiser med FERA, får du coaching fra en trener som kombinerer faglig dybde med smittsom entusiasme. Det er ikke bare trening – det er en opplevelse.
                </p>
              </div>
            </div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden relative order-1 lg:order-2">
              <Image
                src="/Andre_S.jpg"
                alt="André Schlyter — Coach"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>
      ── */}

      {/* Verdier — skjult, skal brukes igjen senere
      <section className="py-20 bg-(--color-sand-light)">
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-sans font-bold text-(--color-text) text-4xl sm:text-5xl mb-12 text-center">Våre verdier</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {values.map((v) => (
              <div key={v.title}>
                <span aria-hidden="true" className="mb-4 inline-block size-1.5 rounded-full bg-(--color-cta)" />
                <h3 className="font-sans font-bold text-(--color-text) text-xl mb-2">{v.title}</h3>
                <p className="text-(--color-muted) leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      ── */}

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-(--color-dark)">
        <div className="max-w-xl mx-auto">
          <h2 className="font-sans font-bold text-white text-4xl sm:text-5xl mb-4">La oss ta en prat</h2>
          <p className="text-white/70 mb-8">Har dere spørsmål, eller ønsker dere å planlegge en reise med FERA? Vi svarer innen 24 timer.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/travels/kontakt" className="inline-block bg-white text-(--color-dark) font-semibold text-sm px-8 py-4 rounded-full hover:bg-(--color-sand) transition-colors">
              Kontakt oss
            </Link>
            <Link href="/travels/skreddersydde-reiser#tilbud" className="inline-block border border-white/60 text-white font-semibold text-sm px-8 py-4 rounded-full hover:bg-white/10 transition-colors">
              Be om tilbud
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
