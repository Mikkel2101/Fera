import type { Metadata } from 'next'
import LegalPage from '@/components/shared/LegalPage'

export const metadata: Metadata = { title: 'Personvernerklæring — Fera' }

export default function PrivacyPage() {
  return (
    <LegalPage title="Personvernerklæring" updated="3. oktober 2026">
      <section>
        <h2>Hvem er ansvarlig</h2>
        <p>
          Fera Padel er behandlingsansvarlig for personopplysningene som samles inn på denne nettsiden.
          Kontakt oss på <a href="mailto:post@ferabrand.com">post@ferabrand.com</a>.
        </p>
      </section>

      <section>
        <h2>Hvilke opplysninger vi lagrer</h2>
        <ul>
          <li>Kontoopplysninger: navn og e-post (fra Google hvis du logger inn med Google).</li>
          <li>Reservasjoner: telefon, padelnivå, romtype, navn på romkamerat og valgte tilvalg.</li>
          <li>Samtykker: om du har godtatt vilkår og personvern, og om du vil ha nyhetsbrev.</li>
        </ul>
      </section>

      <section>
        <h2>Hvorfor vi lagrer dem</h2>
        <ul>
          <li>For å håndtere reservasjonen din og kontakte deg om turen (avtale, GDPR art. 6 nr. 1 bokstav b).</li>
          <li>For å sende nyheter om nye turer — bare hvis du har krysset av for det (samtykke, art. 6 nr. 1 bokstav a). Du kan trekke samtykket når som helst.</li>
        </ul>
      </section>

      <section>
        <h2>Hvem vi deler med</h2>
        <p>
          Vi selger aldri opplysningene dine. Vi bruker disse leverandørene for å drive tjenesten:
          Supabase (database og innlogging), Vercel (drift av nettsiden), Resend (utsending av e-post)
          og Google (hvis du velger Google-innlogging).
        </p>
      </section>

      <section>
        <h2>Hvor lenge vi lagrer dem</h2>
        <p>
          Opplysningene lagres så lenge du har en konto hos oss, eller så lenge det er nødvendig for å
          gjennomføre turen og oppfylle lovpålagte krav. Du kan be om sletting når som helst.
        </p>
      </section>

      <section>
        <h2>Dine rettigheter</h2>
        <p>
          Du har rett til innsyn, retting og sletting, og til å trekke tilbake samtykker. Send en e-post til{' '}
          <a href="mailto:post@ferabrand.com">post@ferabrand.com</a>. Mener du at vi behandler opplysningene
          dine i strid med regelverket, kan du klage til <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer">Datatilsynet</a>.
        </p>
      </section>
    </LegalPage>
  )
}
