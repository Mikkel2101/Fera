# Artikkel → nyhetsbrev — design

**Dato:** 2026-10-09 · **Branch:** `feature/nyhetsbrev` · **Status:** venter på Mikkels svar på fire spørsmål (se nederst)

## Mål

En publisert artikkel kan sendes som nyhetsbrev til alle som har meldt seg på, fra artikkelsiden i admin. Flyten er testutsending til egen e-post → bekreftelse med antall mottakere → send. Den samme artikkelen kan ikke sendes to ganger ved et uhell. Hver e-post har lovlig avmelding (markedsføringsloven § 15) og one-click-avmelding (Gmail/Yahoo-krav).

**Suksess:** En admin sender en artikkel til 1–1000 mottakere uten å forlate artikkelsiden. Feil midt i utsendingen gir verken tapte eller doble e-poster. Avmelding fungerer også mens siden står bak COMING_SOON.

## Besluttet på forhånd (fra Mikkel)

- Mottakere er alle rader i `newsletter_subscribers` (inkludert `brands=['kolleksjon']`) pluss alle `public.users` med `newsletter_consent = true` (e-post fra `auth.users`). Det dedupliseres på lowercase e-post.
- Flyt: «Send som nyhetsbrev» → test til egen e-post → bekreft med antall → send.
- Loggtabell som hindrer dobbel utsending.
- E-post-HTML lages server-side fra Tiptap-JSON med inline-stiler, tabeller, Fera-farger, forsidebilde og «Les på nettsiden»-knapp. Hvitelisten fra `sanitizeDoc` gjenbrukes.
- Avmelding med HMAC-token, siden `/nyhetsbrev/avmeld` uten innlogging. Avmelding sletter fra `newsletter_subscribers` og setter `newsletter_consent=false`. `List-Unsubscribe` og `List-Unsubscribe-Post` legges i headerne.
- Resend-batch (maks 100 per kall), robust mot feil midt i utsendingen.

## Tilnærminger vurdert

1. **Egen utsending fra en server action med mottakerlogg i Supabase (valgt).** Mottakerlisten fryses i en tabell når utsendingen starter, og sendes i batcher på 100. Hver mottaker får status. Avbrutte utsendinger kan fortsettes uten duplikater. Avmelding, mottakerlogikk og låsing ligger i Postgres-funksjoner, i tråd med «all logikk i Supabase» før en eventuell app.
2. **Resend Broadcasts/Audiences.** Resend eier kontaktlisten og avmeldingen. Det er mindre kode, men kontaktene må synkroniseres, avmelding treffer ikke vår database uten webhooks, og briefen krever egen HMAC-avmelding. Forkastet.
3. **Kø (pg_cron, Vercel Queues eller Edge Function).** Overkill for dagens volum (1 mottaker i dag, trolig under 1000 det første året). Forkastet. Tilnærming 1 kan senere flyttes til en kø uten skjemaendring.

## Datamodell (migrasjon `026_newsletter.sql`)

```
newsletter_sends
  id uuid pk
  article_id uuid → articles(id) on delete set null, UNIQUE   ← én utsending per artikkel
  subject text
  sent_by uuid → auth.users(id) on delete set null
  status text: 'sending' | 'sent'
  recipient_count, sent_count, failed_count int
  locked_until timestamptz            ← hindrer to samtidige sendeløkker
  created_at, completed_at timestamptz

newsletter_deliveries
  send_id uuid → newsletter_sends on delete cascade
  email text (lowercase)
  status text: 'pending' | 'sent' | 'failed'
  resend_id text, error text, updated_at
  primary key (send_id, email)
```

RLS er på for begge tabellene. Admin kan lese (`is_admin()`). Ingen skrivepolicyer: alle skrivinger går via funksjonene under.

### Postgres-funksjoner (security definer, `search_path = ''`)

| Funksjon | Tilgang | Gjør |
|---|---|---|
| `newsletter_recipients()` → setof text | admin (sjekker `is_admin()`) | Unik lowercase e-post fra begge kildene |
| `start_newsletter_send(article_id)` → uuid | admin | Krever publisert artikkel. Oppretter send og fryser mottakerne i `newsletter_deliveries` i én transaksjon. Unik-brudd gir feilkoden `already_sent`. |
| `claim_newsletter_send(send_id)` → boolean | admin | Setter `locked_until = now() + 5 min` hvis utsendingen er ulåst og ikke ferdig |
| `record_newsletter_batch(send_id, sent jsonb, failed jsonb)` | admin | Merker leveranser, oppdaterer tellerne. Når ingen er `pending`, settes `status='sent'`, `completed_at` og låsen fjernes. |
| `release_newsletter_send(send_id)` | admin | Fjerner låsen (ved avbrudd eller tidsbudsjett) |
| `newsletter_unsubscribe(email)` | kun `service_role` | Sletter fra `newsletter_subscribers` og setter `newsletter_consent=false` for brukeren med den e-posten |

`newsletter_unsubscribe` kan ikke kalles av anon eller innloggede brukere. Appen verifiserer HMAC-tokenet og kaller funksjonen med service role.

## Komponenter

```
lib/newsletter/
  token.ts       signer og verifiser avmeldingstoken (HMAC-SHA256, base64url), bygg avmeldings-URL-er
  render.ts      Tiptap-JSON → e-post-HTML og ren tekst (rene funksjoner)
  theme.ts       fargekonstanter for e-post (speiler tokens i globals.css; e-postklienter støtter ikke CSS-variabler)
  config.ts      avsender, svaradresse, bunntekst og base-URL fra env, med standardverdier
  send.ts        sendeløkka: claim → hent 100 pending → Resend batch → record → gjenta (server-only)
lib/actions/newsletter.ts   server actions: sendNewsletterTest, startNewsletter, resumeNewsletter, unsubscribe
lib/routing/coming-soon.ts  ren funksjon for hvilke stier som slipper gjennom COMING_SOON (testbar)
app/nyhetsbrev/avmeld/page.tsx         bekreftelsesside (GET viser knapp, POST via server action melder av)
app/api/nyhetsbrev/avmeld/route.ts     one-click POST (RFC 8058) fra e-postklienter
components/admin/NewsletterPanel.tsx   panel på artikkelsiden i admin
```

### Sendeløkka (`send.ts`)

1. `claim_newsletter_send` returnerer false hvis utsendingen allerede er låst eller ferdig. Da avbrytes det med meldingen «Utsendingen pågår allerede».
2. Hent opptil 100 `pending`, sortert på e-post, så batchen blir deterministisk.
3. Bygg én e-post per mottaker (personlig avmeldingslenke) og send med `resend.batch.send(payload, { idempotencyKey, batchValidation: 'permissive' })`. Nøkkelen er `newsletter/<send_id>/<sha256 av e-postene>`. Krasjer prosessen etter at Resend har akseptert, men før databasen er oppdatert, gir neste forsøk samme batch og samme nøkkel, og Resend sender ikke på nytt (nøkler gjelder i 24 timer).
4. Feil per adresse fra Resend → `failed`. Feil på hele kallet (nettverk, 5xx, rate limit) → mottakerne forblir `pending`, løkka stopper, låsen frigis, og admin ser «Utsendingen ble avbrutt — X av N sendt [Fortsett]».
5. Tidsbudsjett på 240 s (siden har `maxDuration = 300`). Rekker løkka ikke alt, frigis låsen, og admin trykker «Fortsett».
6. 600 ms pause mellom batcher (Resends rate limit er 2 kall/s på standardplanen).

### E-postinnhold

- Emne = artikkeltittel. Preheader = ingress (skjult tekst).
- Layout: 600 px-tabell med hvit bakgrunn. Toppen har «FERA PADEL» i serif. Deretter forsidebilde (bredde 100 %, alt-tekst), kategori, tittel, forfatter · dato, brødtekst og knappen «Les på nettsiden», laget som en tabellcelle med bakgrunnsfarge (fungerer i Outlook).
- Brødtekst: paragraph, heading (h2/h3), lister, blockquote (venstrekant), image (bare hvitelistede Storage-URL-er, som i `sanitizeDoc`), hardBreak, bold/italic/link. Interne lenker (`/travels`) gjøres absolutte. All tekst HTML-escapes.
- Bunntekst: «Du får denne e-posten fordi du har meldt deg på nyhetsbrevet fra Fera Padel.», «Meld deg av»-lenke og avsenderidentifikasjon fra `NEWSLETTER_SENDER_INFO`.
- Ren tekst-versjon følger med (bedre levering og tilgjengelighet).
- Headere: `List-Unsubscribe: <https://…/api/nyhetsbrev/avmeld?e=…&t=…>` og `List-Unsubscribe-Post: List-Unsubscribe=One-Click`.
- Testutsending: emnet får prefikset «[Test] », går bare til innlogget admins e-post og logges ikke i `newsletter_sends`.

### Avmelding

- Token = HMAC-SHA256(lowercase e-post, `NEWSLETTER_UNSUBSCRIBE_SECRET`) i base64url. Lenken har `e` (base64url av e-posten) og `t`. Verifisering bruker `timingSafeEqual`.
- `GET /nyhetsbrev/avmeld` viser «Meld av <e-post>?» med en knapp. Det meldes ikke av på GET, fordi sikkerhetsskannere i e-postklienter åpner lenker automatisk.
- Knappen kjører en server action → `newsletter_unsubscribe` → «Du er meldt av.»
- `POST /api/nyhetsbrev/avmeld?e=…&t=…` er one-click (RFC 8058) og svarer 200 uten innhold.
- Ugyldig eller manglende token gir «Lenken er ugyldig eller utløpt» og en kontaktadresse. Det avsløres ikke om e-posten finnes.
- Avmelding er idempotent: en adresse som ikke finnes gir likevel «Du er meldt av».
- `proxy.ts`: `/nyhetsbrev` og `/api/nyhetsbrev` slippes gjennom COMING_SOON, og `/nyhetsbrev` legges i `ROOT_APP_PATHS`, ellers omskrives den til `/travels/nyhetsbrev`.

### Admin-panel (artikkelsiden)

| Tilstand | Viser |
|---|---|
| Utkast | «Publiser artikkelen før den kan sendes som nyhetsbrev.» |
| Publisert, ikke sendt | «Send som nyhetsbrev» → steg 1: «Send test til <min e-post>» → steg 2 (etter test): «Send til N mottakere», bekreftelse «Dette kan ikke angres» → send |
| Sending pågår eller avbrutt | «X av N sendt.» + «Fortsett utsending» |
| Sendt | «Sendt <dato> til N mottakere» (+ «M feilet» om relevant) |

Panelet sier at nyhetsbrevet bruker *sist lagrede* versjon. Er N = 0, er send-knappen deaktivert.

## Feilhåndtering

- Manglende `RESEND_API_KEY` eller `NEWSLETTER_UNSUBSCRIBE_SECRET` gir en tydelig feilmelding i admin, og ingenting sendes.
- `already_sent` gir «Denne artikkelen er allerede sendt som nyhetsbrev.»
- Alle server actions bruker `requireAdmin()`. SQL-funksjonene sjekker `is_admin()` i tillegg (dybdeforsvar).
- Feil logges med `[newsletter]`-prefiks og send-id, aldri med hele mottakerlisten.

## Testing

- `token`: signer og verifiser, manipulert token eller e-post avvises, store og små bokstaver gir samme token, manglende hemmelighet kaster.
- `render`: escaping, lenker gjøres absolutte og usikre fjernes, eksterne bilder fjernes, avmeldingslenke og knapp er med, ren tekst-versjon.
- `send`: batcher på 100, feil per adresse gir `failed`, API-feil lar mottakere stå `pending` og stopper, idempotensnøkkelen er stabil for samme batch, tidsbudsjett, avbryter når claim feiler.
- `coming-soon`: `/nyhetsbrev/avmeld` og `/api/nyhetsbrev/avmeld` slipper gjennom, og `/travels` gjør det ikke.
- Avmeldingsruten: gyldig token → RPC kalles. Ugyldig → 400 uten RPC.
- SQL verifiseres manuelt i SQL Editor etter migrasjonen (testspørringer i planen).

## Utenfor scope

Dobbel opt-in, segmentering per liste, åpnings- og klikkstatistikk, planlagt utsending, egne nyhetsbrev uten artikkel og bounce-webhooks.

## Åpne spørsmål til Mikkel (standardvalg er implementert, alt kan endres via env)

1. **Avsender:** standard er `Fera Padel <nyhetsbrev@ferabrand.com>` med svaradresse `post@ferabrand.com` (`NEWSLETTER_FROM`, `NEWSLETTER_REPLY_TO`). ferabrand.com er verifisert i Resend (DKIM, SPF og DMARC er sjekket i DNS). ferapadel.com er *ikke* satt opp i Resend.
2. **Avsenderidentifikasjon i bunnteksten:** standard er «Fera Padel · ferapadel.com · post@ferabrand.com», uten org.nr. (`NEWSLETTER_SENDER_INFO`). Hva skal stå før Fera AS er stiftet?
3. **Dobbel opt-in** for `newsletter_subscribers`: ikke implementert. Anbefales før listen vokser, som eget prosjekt.
4. **Ikke-publiserte artikler:** kan ikke sendes (håndheves i `start_newsletter_send`).
