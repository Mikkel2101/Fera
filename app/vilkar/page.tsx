import type { Metadata } from 'next'
import LegalPage from '@/components/shared/LegalPage'

export const metadata: Metadata = { title: 'Vilkår for reservasjon — Fera' }

export default function TermsPage() {
  return (
    <LegalPage title="Vilkår for reservasjon" updated="3. oktober 2026">
      <section>
        <h2>Reservasjonen er uforpliktende</h2>
        <p>
          Når du reserverer plass på en Fera-tur, holder vi av en plass til deg. Reservasjonen er gratis
          og uforpliktende — du betaler ingenting og har ikke forpliktet deg til å reise.
        </p>
      </section>

      <section>
        <h2>Veien videre til bindende påmelding</h2>
        <p>
          Vi tar kontakt med deg på e-post eller telefon med endelig pris, betalingsplan og fullstendige
          reisevilkår. Påmeldingen blir først bindende når du har fått disse og bekreftet at du vil delta.
        </p>
      </section>

      <section>
        <h2>Avbestilling og endringer</h2>
        <ul>
          <li>Du kan avbestille reservasjonen kostnadsfritt ved å skrive til <a href="mailto:post@ferabrand.com">post@ferabrand.com</a>.</li>
          <li>Ønsker du å endre romtype eller tilvalg, tar du kontakt med oss.</li>
          <li>Du kan ha én aktiv reservasjon per tur.</li>
        </ul>
      </section>

      <section>
        <h2>Når Fera kan kansellere en reservasjon</h2>
        <p>
          Vi kan kansellere reservasjonen hvis turen avlyses, eller hvis vi ikke får kontakt med deg innen
          rimelig tid. Du får alltid beskjed på e-post hvis det skjer.
        </p>
      </section>

      <section>
        <h2>Kontakt</h2>
        <p>Spørsmål om reservasjonen? Skriv til <a href="mailto:post@ferabrand.com">post@ferabrand.com</a>.</p>
      </section>
    </LegalPage>
  )
}
