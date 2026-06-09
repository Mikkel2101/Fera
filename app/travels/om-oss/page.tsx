import Link from 'next/link'

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
          <p className="text-(--color-gold) text-xs tracking-widest uppercase font-sans mb-4">Om oss</p>
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
            <div className="aspect-[3/4] bg-(--color-ice) rounded-2xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-(--color-dark-mid) to-(--color-dark)">
                <span className="text-white/20 text-xs uppercase tracking-widest">Petter Skimmeland</span>
              </div>
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

      {/* Verdier */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-ice-light)">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display italic font-bold text-(--color-text) text-3xl sm:text-4xl mb-12 text-center">Våre verdier</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-8 border border-(--color-border)">
                <h3 className="font-display font-bold text-(--color-cta) text-xl mb-3">{v.title}</h3>
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
