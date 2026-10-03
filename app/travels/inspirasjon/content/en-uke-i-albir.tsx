import Link from 'next/link'
import { SHOP_ENABLED } from '@/lib/flags'

export default function EnUkeIAlbir() {
  return (
    <div className="prose-fera">

      <p className="lead">
        Klokken er halv seks om morgenen. Solen kryper over fjellene bak Albir og kaster et varmt, gyllent lys over de blå banene. Tre av deltakerne er allerede i gang med oppvarming. De andre er på vei. Ingen er sulne — men alle vet at frokost kan vente.
      </p>
      <p>
        Det er dag tre av syv. Vi er femten nordmenn på padeltur til Costa Blanca med Fera, og stemningen er en helt annen enn hjemme. Her finnes ingen unnskyldninger for å ikke spille. Det er bare padel, sol og folk som vil bli bedre.
      </p>

      <h2>Ankomst og første inntrykk</h2>
      <p>
        Vi landet på Alicante lufthavn torsdag ettermiddag. Bussoverføringen til Albir tok under en time — langs kysten gjennom Benidorm og opp mot de hvite husene langs strandpromenaden. De første kommentarene på bussen handlet ikke om hotellet. De handlet om banene vi passerte langs veien.
      </p>
      <p>
        Albir er en liten, rolig by sammenlignet med nabobyen Benidorm. Det er nøyaktig det som gjør den perfekt for en padeltur. Ingen distraksjoner. Bare baner, gode restauranter og 300 meter fra hotellet til havet.
      </p>
      <p>
        Padelsenteret vi brukte hele uken hadde åtte baner under åpen himmel og to innendørs. På det meste spilte vi seks kamper på én dag. Det høres krevende ut. Det er krevende. Men på en måte ingen av oss hadde forventet.
      </p>

      <h2>Coaching som faktisk gjør en forskjell</h2>
      <p>
        André Schlyter holder morgenøkten. Én time med teknikk og taktikk, fulgt av to timers strukturert spill med rotasjon. Det er ikke et kurs. Det er ikke «tips og triks». Det er skikkelig trening.
      </p>
      <p>
        Dag én: bandejaen min er en vits. Dag fire: jeg treffer den tre av fem ganger. Det er ikke magi — det er repetisjon, tilbakemelding og rette vaner innøvd under solskin. André ser ting ved spillet ditt som du ikke selv ser, og han formidler det på en måte som faktisk sitter.
      </p>
      <blockquote>
        «Jeg har spilt padel i to år og trodde jeg nærmet meg et platå. Etter fire dager med André skjønte jeg at jeg bare hadde begynt å forstå spillet.» — Kristian, deltaker fra Stavanger
      </blockquote>

      <h2>Livet mellom kampene</h2>
      <p>
        En padeltur er ikke bare padel. Det er frokosten ved bassenget hvor du analyserer gårsdagens kamper med folk du møtte for to dager siden. Det er tapas-restauranten på torget tirsdag kveld som anbefales av hotellet og lever opp til forventningene. Det er den spontane runden med doubles kl. 21 fordi ingen egentlig er klar for å stoppe.
      </p>
      <p>
        Gruppen vår bestod av folk i alderen 28–61. Noen kjente hverandre. De fleste gjorde ikke det. Innen dag to spilte det ingen rolle. Padel er en av de rareste og beste sosiale lim som finnes — du lærer folk raskt å kjenne når du jakter på den samme ballen.
      </p>

      <h2>Praktisk info for deg som vurderer en tur</h2>
      <ul>
        <li><strong>Reisetid fra Oslo:</strong> 3,5 timer til Alicante</li>
        <li><strong>Nivå:</strong> Alle nivåer er velkomne — coaching tilpasses gruppen</li>
        <li><strong>Inkludert:</strong> Hotell (halvpensjon), transport, baneleie og all coaching</li>
        <li><strong>Utstyr:</strong> Vi anbefaler å ta med egen racket{SHOP_ENABLED && <> — <Link href="/shop" className="text-(--color-cta) hover:underline">se vårt sortiment</Link></>}</li>
        <li><strong>Tidspunkt:</strong> Oktober–april er ideelt — 22–26 grader, ingen hete</li>
      </ul>

      <h2>Kommer du på neste tur?</h2>
      <p>
        Vi tar med et begrenset antall deltakere på hver tur — nettopp fordi vi vil at alle skal få tid med coachen og at gruppen skal bli sammensveiset. Plass går fort. Av de femten som var med denne gangen, har ni allerede meldt seg på neste tur.
      </p>
      <p>
        Det sier egentlig alt.
      </p>

    </div>
  )
}
