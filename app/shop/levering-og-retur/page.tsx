import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Levering, retur og garanti — Fera Shop',
  description: 'Informasjon om levering, størrelsesbytte, retur og garanti for produkter kjøpt i Fera Shop.',
}

export default function LeveringOgReturPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-(--color-muted) hover:text-(--color-text) transition-colors mb-8"
      >
        ← Tilbake til butikken
      </Link>

      <h1 className="font-display text-4xl font-bold text-(--color-text) mb-4">
        Levering, retur og garanti
      </h1>
      <p className="text-(--color-muted) text-lg mb-12">
        Fera Padel AS er selger. Produktene leveres av vår partner Padelpoint fra Spania.
        Vi speiler Padelpoints offisielle betingelser.
      </p>

      {/* Levering */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-(--color-text) mb-4">
          Levering
        </h2>
        <div className="bg-white border border-(--color-border) rounded-2xl p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-(--color-ice-light) rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-(--color-muted) mb-1">Leveringstid</p>
              <p className="text-(--color-text) font-semibold">3–5 virkedager</p>
              <p className="text-sm text-(--color-muted)">Fra Spania til Norge med UPS</p>
            </div>
            <div className="bg-(--color-ice-light) rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-(--color-muted) mb-1">Frakt</p>
              <p className="text-(--color-text) font-semibold">€ 20</p>
              <p className="text-sm text-(--color-muted)">Gratis på ordrer over € 200</p>
            </div>
          </div>
          <p className="text-sm text-(--color-text) leading-relaxed">
            Du mottar sporingsinformasjon på e-post når pakken er sendt. For tunge varer som
            baller kan det påløpe ekstra fraktkostnader — disse vises automatisk i kassen.
          </p>
          <div className="bg-(--color-sand)/40 rounded-xl p-4 text-sm text-(--color-subtle)">
            <strong className="text-(--color-text)">Merk:</strong> Varer sendes fra Spania og
            er gjenstand for norsk toll og merverdiavgift. UPS kontakter mottaker for betaling
            av eventuelle avgifter ved levering.
          </div>
        </div>
      </section>

      {/* Retur */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-(--color-text) mb-4">
          Retur
        </h2>
        <div className="bg-white border border-(--color-border) rounded-2xl p-6 flex flex-col gap-5">

          <div className="flex items-start gap-3 p-4 bg-(--color-ice-light) rounded-xl">
            <span className="text-xl mt-0.5">📅</span>
            <div>
              <p className="font-semibold text-(--color-text)">30 dager returrett</p>
              <p className="text-sm text-(--color-muted)">Fra den dagen du mottar produktet.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm text-(--color-text) leading-relaxed">
            <p>
              <strong>Kontakt oss alltid FØR du sender noe.</strong> Send en e-post til{' '}
              <a href="mailto:post@ferabrand.com" className="text-(--color-cta) underline">
                post@ferabrand.com
              </a>{' '}
              med ordrenummer og årsak, så hjelper vi deg videre.
            </p>

            <div>
              <p className="font-medium mb-2">Betingelser for retur:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 text-(--color-muted)">
                <li>Produktet må være <strong>ubrukt og uåpnet</strong>, med originale segl og merkelapper intakte</li>
                <li>Produkter uten intakt originalsegl vil bli avvist</li>
                <li>Undertøy, innleggssåler og spray aksepteres <strong>ikke</strong> i retur av hygienehensyn</li>
                <li>Klær og produkter som allerede er brukt eller er ufullstendige aksepteres ikke</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-2">Slik returnerer du:</p>
              <ol className="list-decimal list-inside flex flex-col gap-1.5 text-(--color-muted)">
                <li>Send e-post til <a href="mailto:post@ferabrand.com" className="text-(--color-cta) underline">post@ferabrand.com</a> med ordrenummer og årsak</li>
                <li>Vent på bekreftelse fra oss før du sender pakken</li>
                <li>Send pakken (valgfri fraktmetode) på <strong>din kostnad</strong> til:</li>
              </ol>
              <div className="mt-3 ml-6 p-4 bg-(--color-surface) border border-(--color-border) rounded-xl text-sm font-mono text-(--color-text)">
                Padelpoint Europa SL<br />
                Avda. Villajoyosa 77, Nave Citroen<br />
                La Nucía 03530 Alicante<br />
                Spain
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">Refusjon:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 text-(--color-muted)">
                <li>Refusjon behandles innen <strong>14 virkedager</strong> etter at vi har bekreftet mottak</li>
                <li>Beløpet refunderes via samme betalingsmetode som ble brukt</li>
                <li>Ved full retur: produktbeløpet refunderes (ikke original frakt)</li>
                <li>Ved delvis retur: se detaljer ved bestillingstidspunktet</li>
                <li>Du kan alternativt velge gavekort til bruk i fremtidige kjøp</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Størrelsesbytte */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-(--color-text) mb-4">
          Størrelsesbytte
        </h2>
        <div className="bg-white border border-(--color-border) rounded-2xl p-6 flex flex-col gap-3 text-sm text-(--color-text) leading-relaxed">
          <p>
            Ønsker du å bytte til en annen størrelse? Kontakt oss på{' '}
            <a href="mailto:post@ferabrand.com" className="text-(--color-cta) underline">
              post@ferabrand.com
            </a>{' '}
            før du sender noe.
          </p>
          <ul className="list-disc list-inside flex flex-col gap-1.5 text-(--color-muted)">
            <li>Produktet må sendes i original, ubrukt stand med alle merkelapper</li>
            <li>Du betaler frakt til Padelpoint i Spania</li>
            <li>Padelpoint betaler frakten for det nye produktet til deg</li>
            <li>Det kan påløpe fraktkostnader for bytteforsendelsen avhengig av land</li>
          </ul>
        </div>
      </section>

      {/* Garanti */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-(--color-text) mb-4">
          Garanti
        </h2>
        <div className="bg-white border border-(--color-border) rounded-2xl p-6 flex flex-col gap-4">

          <div className="flex items-start gap-3 p-4 bg-(--color-ice-light) rounded-xl">
            <span className="text-xl mt-0.5">🛡️</span>
            <div>
              <p className="font-semibold text-(--color-text)">2 års garanti</p>
              <p className="text-sm text-(--color-muted)">Fra kjøpsdato på kvittering.</p>
            </div>
          </div>

          <div className="text-sm text-(--color-text) leading-relaxed flex flex-col gap-3">
            <p>
              I henhold til gjeldende forbrukerlovgivning er alle produkter garantert i
              <strong> 2 år fra kjøpsdato</strong>. I løpet av de første 6 månedene antas
              eventuelle feil å være fabrikasjonsfeil. Etter 6 måneder må kunden dokumentere
              at feilen stammer fra fabrikasjon.
            </p>

            <div>
              <p className="font-medium mb-2">For å aktivere garantien, send følgende til <a href="mailto:post@ferabrand.com" className="text-(--color-cta) underline">post@ferabrand.com</a>:</p>
              <ul className="list-disc list-inside flex flex-col gap-1.5 text-(--color-muted)">
                <li>Ordrenummer</li>
                <li>Beskrivelse av feilen</li>
                <li>
                  Bilder av det defekte produktet — for racketer:{' '}
                  <strong>alle 4 sider + nærbilde av skaden</strong>
                </li>
                <li>Ordrebekreftelse som kjøpsbevis</li>
              </ul>
            </div>

            <p className="text-(--color-muted)">
              Garantikrav behandles via Padelpoints supportportal. Vi kan ikke behandle krav
              uten tilstrekkelig bilddokumentasjon.
            </p>
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section className="bg-(--color-dark) text-white rounded-2xl p-8 text-center">
        <h2 className="font-display text-2xl font-semibold mb-3">Trenger du hjelp?</h2>
        <p className="text-white/70 mb-2">
          Vi svarer normalt innen 24 timer på hverdager.
        </p>
        <p className="text-white/50 text-sm mb-6">
          Start alltid med en e-post til oss — ikke send pakker uten forhåndsgodkjenning.
        </p>
        <a
          href="mailto:post@ferabrand.com"
          className="inline-block bg-white text-(--color-dark) font-semibold px-8 py-3 rounded-full hover:bg-(--color-sand) transition-colors"
        >
          post@ferabrand.com
        </a>
      </section>
    </div>
  )
}
