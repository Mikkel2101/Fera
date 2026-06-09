import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Om oss — Fera',
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
      <section className="bg-gradient-to-b from-(--color-dark) to-(--color-dark-mid) px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-white/50 text-xs tracking-widest uppercase font-sans mb-4">Om oss</p>
          <h1 className="font-display text-white text-4xl md:text-6xl font-bold leading-tight mb-6">
            Bak{' '}
            <em className="italic text-(--color-sand)">Fera Travels</em>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Vi startet med en enkel idé: å kombinere det beste fra padel med det beste fra reising. Resultatet? Profesjonelle padelreiser som folk aldri glemmer.
          </p>
        </div>
      </section>

      {/* Petter */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden relative">
              <Image
                src="/Petter_Skimmeland.jpg"
                alt="Petter Skimmeland"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top"
              />
            </div>
            <div>
              <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-3">Grunnlegger</p>
              <h2 className="font-display italic font-bold text-(--color-text) text-3xl mb-6">Petter Skimmeland</h2>
              <div className="space-y-4 text-(--color-muted) leading-relaxed">
                <p>
                  Heisann! Jeg er Petter, og jeg er den som startet Fera Travels. Etter å ha jobbet mange år som lærer har jeg selv lært hvor mye det betyr å legge til rette for at folk skal trives, føle seg inkludert og få gode opplevelser sammen.
                </p>
                <p>
                  Den følelsen traff meg skikkelig da jeg noe tilfeldig arrangerte min første padelreise, og gav virkelig mersmak. Lite kunne måle seg med å se folk smile fra øre til øre fem dager i strekk med padel, sol, nye bekjentskap, god mat, god drikke, og latter fra morgen til kveld i fine omgivelser.
                </p>
                <p>
                  Derfor fant jeg ut at — dette må jeg jo gjøre mer av — og satte i gang. Lite visste jeg da at jeg skulle kunne skilte med såpass mange turer gjennomført og over 100 reisende på under et år.
                </p>
                <p>
                  For meg handler Fera Travels om mye mer enn padel. Det handler om menneskene og opplevelsene både på og utenfor banen. Jeg gleder meg til å bli kjent med alle som kommer hit på tur, og skal strekke meg langt for at dere skal få lyst å komme tilbake igjen og igjen — og enda en gang ;)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* André */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-ice-light)">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="order-2 lg:order-1">
              <p className="text-(--color-gold) text-xs uppercase tracking-widest font-medium mb-3">Partner & Coach</p>
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
                  Når du reiser med Fera, får du coaching fra en trener som kombinerer faglig dybde med smittsom entusiasme. Det er ikke bare trening – det er en opplevelse.
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

      {/* Verdier */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-ice-light)">
        <div className="max-w-5xl mx-auto">
          {/* Dekorativ skillelinje */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-16 bg-(--color-gold) opacity-40" />
            <div className="w-1.5 h-1.5 rounded-full bg-(--color-gold)" />
            <div className="h-px w-16 bg-(--color-gold) opacity-40" />
          </div>
          <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl mb-12 text-center">Våre verdier</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-8 border border-(--color-border) border-t-2 border-t-(--color-gold)">
                <h3 className="font-display font-bold text-(--color-text) text-xl mb-3">{v.title}</h3>
                <p className="text-(--color-muted) leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display italic font-bold text-(--color-text) text-3xl mb-4">Bli med på en tur</h2>
          <p className="text-(--color-muted) mb-8">Vi gleder oss til å bli kjent med deg og gruppen din.</p>
          <Link href="/travels" className="inline-block bg-(--color-cta) text-white font-semibold text-sm px-8 py-4 rounded-full hover:opacity-90 transition-opacity">
            Se kommende turer →
          </Link>
        </div>
      </section>
    </>
  )
}
