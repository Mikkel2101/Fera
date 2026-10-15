import TilbudForm from '@/components/travels/skreddersydde/TilbudForm'
import VideoShowcase from '@/components/travels/skreddersydde/VideoShowcase'
import TestimonialCarousel from '@/components/travels/skreddersydde/TestimonialCarousel'
import { testimonials } from '@/components/travels/Testimonials'

export const metadata = {
  title: 'Tilpassede reiser — FERA',
  description: 'Padelreiser tilpasset for padelsentre, klubber, bedrifter og mindre grupper. Vi setter sammen hele opplegget og tar kontakt innen 24 timer.',
}

const features = [
  { title: 'Padel & coaching', desc: 'Få coaching i verdensklasse, nivåtilpasset trening og spill, og organiserte turneringer mot lokale spillere.' },
  { title: 'Team-bygging', desc: 'Turneringer, lagkonkurranser og aktiviteter som bygger teamkultur og samhold.' },
  { title: 'Lokale smaker og opplevelser', desc: 'Vi tar dere med til nøye utvalgte restauranter i vakre omgivelser - steder turister sjelden finner selv.' },
]

export default function SkreddersyddeReiserPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50svh] md:min-h-[55svh] flex items-center overflow-hidden bg-(--color-community)">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-(--color-overlay)/80" />
        <div className="relative w-full max-w-[1450px] mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-(--color-sand) text-xs tracking-widest uppercase font-sans mb-4">
              Tilpassede reiser
            </p>
            <h1 className="font-sans font-bold text-white text-5xl sm:text-6xl leading-tight mb-6">
              Den neste padelopplevelsen starter her
            </h1>
            <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
              Enten dere er et padelsenter, en klubb, en bedrift eller en vennegjeng, tilbyr vi profesjonelle padelreiser med coaching og oppelvelser.
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
      <VideoShowcase features={features} />

      {/* Tilbakemeldinger */}
      <section className="py-24 md:py-32 bg-(--color-sand-light)">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* Skjema */}
      <section id="tilbud" className="py-20 bg-(--color-dark)">
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
          <div className="lg:pt-10">
            <p className="text-(--color-sand) text-xs uppercase tracking-widest font-medium mb-3">Neste steg</p>
            <h2 className="font-sans font-bold text-white text-5xl sm:text-6xl mb-4">La oss planlegge reisen deres</h2>
            <p className="text-white text-lg leading-relaxed">
              Fortell oss om padelsenteret, klubben, bedriften eller gjengen deres, så setter vi sammen et tilbud tilpasset nivå, budsjett og ønsker – med transparent pris og svar innen 24 timer.
            </p>
          </div>
          <div className="max-w-xl mx-auto w-full">
            <TilbudForm />
          </div>
        </div>
      </section>
    </>
  )
}
