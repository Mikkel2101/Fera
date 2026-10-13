import Image from 'next/image'
import CommunitySignup from '@/components/home/CommunitySignup'

export default function CommunitySignupSection() {
  return (
    <section className="overflow-hidden">
      <div className="grid min-h-[600px] grid-cols-1 lg:grid-cols-5">
        <div className="relative min-h-[320px] lg:col-span-3 lg:min-h-0">
          <Image
            src="/Padelracket%20i%20gyldent%20kveldslys.png"
            alt="Padelracket i gyldent kveldslys"
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-transparent to-(--color-overlay)/20" />
        </div>

        <div className="flex flex-col justify-center bg-(--color-community) px-8 py-14 sm:px-10 lg:col-span-2 lg:px-12 lg:py-16">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-white">Fera Travel</p>
          <h2 className="mb-6 font-sans text-4xl font-normal leading-tight text-white sm:text-5xl">
            Bli med i<br />FERA Community
          </h2>
          <p className="mb-8 font-sans text-base leading-relaxed text-white">
            Få reiseinspirasjon, datoer for kommende turer og små glimt fra livet på Costa Blanca rett i innboksen.
          </p>
          <CommunitySignup />
        </div>
      </div>
    </section>
  )
}