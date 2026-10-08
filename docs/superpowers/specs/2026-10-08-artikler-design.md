# Artikler i databasen med editor i /admin — design

**Dato:** 2026-10-08
**Status:** Til gjennomgang
**Branch:** `feature/artikler`

## Bakgrunn og mål

Petter og Alex skal drive turdelen og community i Fera uavhengig av Mikkel. Første steg er at de kan logge inn og publisere artikler på nettsiden uten utvikler.

I dag er artiklene hardkodet: metadata i `app/travels/inspirasjon/posts.ts` og brødtekst i `app/travels/inspirasjon/content/*.tsx` (tre artikler).

**Suksesskriterier**
- Petter og Alex kan logge inn på `/admin`, skrive en artikkel med bilder i en visuell editor, forhåndsvise og publisere — uten å røre kode.
- Publiserte artikler vises på `/travels/inspirasjon` og `/travels/inspirasjon/[slug]` umiddelbart.
- De tre eksisterende artiklene er flyttet til databasen uten tap av innhold eller URL-er.

Dette er delprosjekt 1 av 4. Neste: medlemsprofil/community, arrangementer (kun for innloggede medlemmer, Norge og Spania), nyhetsbrev. Hver får egen spec.

## Beslutninger

| Beslutning | Valg | Begrunnelse |
|---|---|---|
| Tilgang for Petter og Alex | Full admin (`app_metadata.role = 'admin'`) | De skal drive turdelen og community selvstendig |
| Redigeringsverktøy | Egen Tiptap-editor i `/admin` | Én innlogging og ett system for artikler, arrangementer og nyhetsbrev; editoren gjenbrukes til nyhetsbrev |
| Lagring | Supabase (tabell + Storage) | All logikk i Supabase så en fremtidig app kan bruke samme backend og RLS |
| Innholdsformat | Tiptap-JSON | Strukturert, kan konverteres til/fra HTML; åpner for «Importer fra Google Docs» senere (Drive-API eksporterer HTML) |

## Datamodell

Tabell `articles`:

| Kolonne | Type | Merknad |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `slug` | `text` unik, not null | Genereres fra tittel, kan redigeres. Format `^[a-z0-9]+(-[a-z0-9]+)*$` |
| `title` | `text` not null | 3–150 tegn |
| `excerpt` | `text` not null | Maks 300 tegn |
| `category` | `text` not null | Check: `Reiserapport`, `Coaching`, `Destinasjon`, `Tips`, `Nyheter` |
| `cover_image` | `text` | URL i Storage |
| `cover_image_alt` | `text` | Påkrevd når `cover_image` er satt (valideres i Zod) |
| `meta_description` | `text` | Maks 160 tegn; faller tilbake til `excerpt` |
| `content` | `jsonb` not null | Tiptap-dokument, default tomt dokument |
| `status` | `text` not null | Check: `draft` \| `published`, default `draft` |
| `published_at` | `timestamptz` | Settes ved første publisering, kan overstyres (tilbakedatering) |
| `author_id` | `uuid` → `auth.users` | Admin som opprettet artikkelen, `on delete set null` |
| `author_name` | `text` | Visningsnavn kopiert fra brukerprofilen ved opprettelse, så offentlige sider ikke trenger lesetilgang til `auth.users` |
| `created_at`, `updated_at` | `timestamptz` | `updated_at` via trigger |

Lesetid lagres ikke — den regnes ut fra `content` ved visning.

Indekser: `(status, published_at desc)` for listesiden. `slug` har unik indeks.

### RLS

- `select` for `anon` og `authenticated`: `status = 'published'`.
- `select`, `insert`, `update`, `delete` for admin: `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'` (samme mønster som `003_admin_rls.sql`).

### Storage

Offentlig bøtte `articles`. Lesing er åpen. Skriving, oppdatering og sletting krever admin-rolle via policy på `storage.objects`. Bøtta har filgrense 5 MB og `allowed_mime_types` = `image/jpeg`, `image/png`, `image/webp`. Filsti: `<article_id>/<uuid>.<ext>`.

## Flyt i /admin

- **`/admin/articles`**: liste med utkast og publiserte artikler (tittel, status, publiseringsdato, forfatter), og knappen «Ny artikkel».
- **`/admin/articles/new`**: oppretter et utkast og sender til redigering.
- **`/admin/articles/[id]`**: metadataskjema (tittel, slug, kategori, utdrag, forsidebilde + alt-tekst, meta-beskrivelse, publiseringsdato) og editor. Handlingene er «Lagre utkast», «Forhåndsvis», «Publiser», «Avpubliser» og «Slett» (slett krever bekreftelse).
- **Forhåndsvisning**: viser artikkelen med samme `ArticleBody` som den offentlige siden, inne i admin. Utkast eksponeres dermed aldri offentlig.
- «Artikler» legges inn i `AdminNav`.

### Editor

Tiptap med et fast sett elementer: overskrift (H2, H3), avsnitt, fet, kursiv, punktliste, nummerert liste, lenke, bilde (med alt-tekst) og sitat. Ingen rå HTML og ingen innliming av stiler (lim inn som ren struktur).

Bildeopplasting fra editoren og forsidebildefeltet: bildet komprimeres i nettleseren (maks 2000 px bredde, WebP) og lastes opp direkte til Supabase Storage med brukerens sesjon. RLS-policyen håndhever admin.

## Offentlige sider

- `app/travels/inspirasjon/page.tsx` og `[slug]/page.tsx` leser fra `lib/articles/queries.ts` i stedet for `posts.ts`.
- `generateMetadata` bruker `meta_description ?? excerpt` og `cover_image`.
- Ukjent slug eller utkast gir `notFound()`.
- Forsiden (blogg-teaser) og `app/sitemap.ts` henter publiserte artikler fra databasen.
- Datoformat: `published_at` vises som «20. mai 2026» (`nb-NO`).

## Komponenter og filer

| Fil | Ansvar |
|---|---|
| `supabase/migrations/023_articles.sql` | Tabell, indekser, trigger, RLS, Storage-bøtte og policies, seed av tre eksisterende artikler |
| `lib/articles/schema.ts` | Zod-skjema for artikkelmetadata; `slugify()`, `readingTimeMinutes()`, `isSafeHref()`. Rene funksjoner |
| `lib/articles/queries.ts` | `getPublishedArticles()`, `getArticleBySlug()` (server) |
| `lib/actions/articles.ts` | Server Actions: `createArticle`, `saveArticle`, `publishArticle`, `unpublishArticle`, `deleteArticle`. `requireAdmin()` + `revalidatePath` |
| `components/admin/ArticleEditor.tsx` | Tiptap-editor (client) |
| `components/admin/ArticleForm.tsx` | Metadatafelter + handlinger (client) |
| `components/admin/ImageUpload.tsx` | Komprimering + opplasting til Storage (client) |
| `components/articles/ArticleBody.tsx` | Tiptap-JSON → React via Tiptaps statiske renderer (server); ingen `dangerouslySetInnerHTML` |
| `app/admin/(protected)/articles/{page,new/page,[id]/page}.tsx` | Admin-sider |

`posts.ts` og `content/*.tsx` slettes etter at seeden er verifisert i Preview.

## Sikkerhet

- Adminrollen sjekkes i admin-layouten, i hver Server Action (`requireAdmin()`) og i RLS. Databasen er siste skanse.
- Lenker: kun `http:`, `https:` og `mailto:` (`isSafeHref`). Valideres ved lagring (ugyldige lenkemarker fjernes) og ved visning (renderen dropper lenken, beholder teksten).
- Renderen ignorerer ukjente nodetyper i stedet for å krasje.
- Bilde-URL-er i innhold må peke til prosjektets Supabase Storage. Andre kilder droppes ved visning.
- Server Actions validerer all input med Zod før skriving.

## Feilhåndtering

- Valideringsfeil og duplikat-slug (Postgres `23505`) vises som norske feilmeldinger ved feltet.
- Når lagring feiler, blir innholdet stående i editoren og en feilmelding vises. Ingenting forkastes.
- Når bildeopplasting feiler, vises en feilmelding og det blir ikke satt inn noe ødelagt bilde.
- Feil i Server Actions logges på serveren med kontekst (artikkel-id, operasjon). Klienten får en generell melding.

## Testing

- **Enhetstester (Vitest, skrives først):** `slugify` (æøå → ae/o/a, mellomrom, spesialtegn), `readingTimeMinutes`, `isSafeHref`, Zod-skjema (grenser, alt-tekst påkrevd med bilde).
- **Render-test:** `ArticleBody` dropper `javascript:`-lenker og ukjente noder, og rendrer kjente noder riktig.
- **RLS-verifisering mot Supabase:** anonym bruker ser bare publiserte artikler og får ikke `insert`/`update`, og heller ikke opplasting til bøtta.
- **Manuell test i Preview:** skriv artikkel, last opp bilde, forhåndsvis, publiser, se den på `/travels/inspirasjon`, avpubliser og verifiser 404.

## Utrulling

1. Migrasjon 023 kjøres i Supabase prod (av Mikkel).
2. Petter og Alex får `role = 'admin'` i `app_metadata` (via SQL eller Supabase Dashboard). De må ha brukerkonto først.
3. Merge til main. Siden er fortsatt bak `COMING_SOON` i Production, så verifisering skjer i Preview.

## Utenfor scope

Planlagt publisering frem i tid, versjonshistorikk, kommentarer, flere forfattere per artikkel, tagger, Google Docs-import (mulig senere, formatet støtter det) og flerspråklig innhold.
