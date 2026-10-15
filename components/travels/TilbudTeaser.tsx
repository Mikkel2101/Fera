import Image from 'next/image'
import Link from 'next/link'

const steps = [
  { title: 'Fortell oss om gruppen', desc: 'Antall, nivå og når dere ønsker å reise.' },
  { title: 'Motta et forslag', desc: 'Et gjennomarbeidet forslag med transparent pris.' },
  { title: 'Bekreft og reis', desc: 'Dere bekrefter, vi tar hånd om hver detalj.' },
]

export default function TilbudTeaser() {
  return (
    <section className="py-20 md:py-28 bg-(--color-community)">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-[0.7fr_1.3fr] xl:grid-cols-[0.9fr_1.1fr] gap-10 xl:gap-20 xl:items-center">
        <div className="relative hidden md:block rounded-2xl overflow-hidden xl:aspect-[4/5]">
          <Image
            src="/Bilder%20fra%20tur/DSC00767.JPG"
            alt="Padelspillere feirer på banen i kveldssol med Benidorm i bakgrunnen"
            fill
            sizes="(max-width: 1280px) 35vw, 45vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-(--color-sand) text-xs uppercase tracking-widest font-medium mb-4">
            Tilpassede reiser
          </p>
          <h2 className="font-sans font-normal text-white text-4xl sm:text-5xl leading-tight mb-6">
            En reise tilpasset dere
          </h2>
          <p className="text-white/75 text-lg leading-relaxed max-w-xl mb-10">
            Samle klubben, kollegaene eller vennegjengen. Dere velger tidspunktet, og vi skaper en reise fylt av
            padelglede, samhold og minner for livet.
          </p>

          <ol className="border-t border-white/15 mb-10 max-w-xl">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-6 py-6 border-b border-white/15">
                <span className="text-(--color-sand) text-xl font-medium tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-white font-semibold text-xl mb-1">{s.title}</h3>
                  <p className="text-white/65 text-base leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <Link
              href="/travels/skreddersydde-reiser#tilbud"
              className="inline-block self-start bg-white text-(--color-dark) font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-(--color-sand) transition-colors"
            >
              Be om tilbud →
            </Link>
            <p className="text-white/60 text-sm">Uforpliktende, med svar innen 24 timer.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
