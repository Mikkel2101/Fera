import ContactForm from '@/components/shared/ContactForm'

export const metadata = {
  title: 'Kontakt oss — Fera',
  description: 'Har du spørsmål om reiser eller padel? Send oss en melding, så svarer vi innen 24 timer.',
}

export default function KontaktPage() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-(--color-dark) min-h-[70vh] flex items-center">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="font-sans font-bold text-white text-3xl sm:text-4xl mb-3 text-center">Kontakt oss</h1>
        <p className="text-white/60 text-center leading-relaxed mb-10">
          Har du spørsmål om reiser, padel eller noe annet? Send oss en melding, så svarer vi innen 24 timer.
        </p>
        <ContactForm
          type="kontakt"
          fields={[
            { name: 'navn', label: 'Ditt navn', required: true },
            { name: 'epost', label: 'E-post', type: 'email', required: true },
            { name: 'telefon', label: 'Telefon' },
          ]}
          messageLabel="Din melding"
          messagePlaceholder="Hva lurer du på?"
          submitLabel="Send melding →"
          successMessage="Takk for meldingen! Vi svarer innen 24 timer."
        />
      </div>
    </section>
  )
}
