# Artikkel → nyhetsbrev Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En publisert artikkel kan sendes som nyhetsbrev fra admin (test → bekreft → send), med lovlig avmelding og uten doble utsendinger.

**Architecture:** Mottakerliste, låsing og avmelding ligger i Postgres-funksjoner (migrasjon 026). En ren sendeløkke (`lib/newsletter/send.ts`) sender i Resend-batcher på 100 med idempotensnøkler og logger status per mottaker, så utsendinger kan fortsettes etter feil. E-post-HTML lages fra Tiptap-JSON av rene funksjoner. Avmelding skjer med HMAC-signert lenke på en side som slipper gjennom COMING_SOON.

**Tech Stack:** Next.js 16 (App Router, server actions), Supabase (Postgres-funksjoner, RLS), Resend v6 batch-API, Vitest (jsdom).

**Spec:** `docs/superpowers/specs/2026-10-09-nyhetsbrev-design.md`

> Planen ble skrevet og utført i samme økt av samme agent (native). Den endelige koden ligger i filene som er nevnt per oppgave; planen beskriver grensesnitt, tester og rekkefølge.

## Global Constraints

- Alle brukervendte tekster på norsk.
- Tailwind: `bg-(--color-x)`, aldri hex i komponenter. E-post-HTML bruker `lib/newsletter/theme.ts`, som speiler tokens.
- `params` og `searchParams` er Promises i Next 16.
- Migrasjoner kjøres av Mikkel i Supabase SQL Editor (postgres-rollen). Ikke `apply_migration`. `CREATE POLICY IF NOT EXISTS` er ugyldig.
- Nye offentlige ruter som må virke under COMING_SOON slippes gjennom øverst i `proxy()`.
- Resend-batch: maks 100 e-poster per kall.
- Avsender er standard `Fera Padel <nyhetsbrev@ferabrand.com>`, svaradresse `post@ferabrand.com`. Alt kan overstyres med env.
- Commit-format `<type>: <beskrivelse>` + `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Store og små bokstaver i e-post** (`Ola@X.no` i én kilde, `ola@x.no` i den andre). Det skal bli én mottaker, og avmelding skal treffe begge. Pinnet i Task 2 (token) og i SQL (`lower()` overalt, Task 1-verifisering).
2. **Ugyldig eller avkortet avmeldingslenke** (e-postklienter bryter lange lenker). Siden skal vise «Lenken er ugyldig» med kontaktadresse, ikke krasje. Pinnet i Task 7 (`unsubscribe`-tester).
3. **Lenkeskannere som åpner avmeldingslenken** (Outlook/Defender). GET skal ikke melde av. Pinnet i Task 7: siden melder bare av via form-POST.
4. **Resend nede midt i utsendingen.** Allerede sendte skal ikke få e-posten igjen, resten skal kunne fortsettes. Pinnet i Task 4 (avbrutt batch, stabil idempotensnøkkel).
5. **Admin dobbeltklikker eller to admins sender samtidig.** Bare én utsending skal starte. Pinnet i SQL (unik `article_id`, `claim`) og i Task 4 (`locked`).

---

### Task 1: Migrasjon 026 og DB-typer

**Files:**
- Create: `supabase/migrations/026_newsletter.sql`
- Modify: `lib/supabase/types.ts` (Tables + Functions)

**Interfaces:**
- Produces: RPC-ene `newsletter_recipient_count() → int`, `start_newsletter_send(p_article_id uuid) → uuid`, `claim_newsletter_send(p_send_id) → boolean`, `record_newsletter_batch(p_send_id, p_results jsonb)`, `release_newsletter_send(p_send_id)`, `newsletter_unsubscribe(p_email)` og tabellene `newsletter_sends` og `newsletter_deliveries`.

- [ ] **Step 1: Skriv migrasjonen** med tabeller, RLS (admin leser), funksjonene over med `security definer set search_path = ''` og `is_admin()`-sjekk, `revoke … from public, anon` / `grant … to authenticated` for admin-funksjoner og `grant … to service_role` for `newsletter_unsubscribe`.
- [ ] **Step 2: Legg tabellene og funksjonene inn i `Database`-typen** i `lib/supabase/types.ts` (håndskrevet, samme stil som `team_members`).
- [ ] **Step 3: `npx tsc --noEmit`** → ingen feil.
- [ ] **Step 4: Verifiseringsspørringer for Mikkel** (i PR-en): `select public.newsletter_recipient_count();` som admin, og `select count(*) from public.newsletter_sends;`.
- [ ] **Step 5: Commit** `feat: migrasjon 026 for nyhetsbrev (utsendingslogg og avmelding)`

### Task 2: Konfig og avmeldingstoken

**Files:**
- Create: `lib/newsletter/config.ts`, `lib/newsletter/token.ts`
- Test: `__tests__/newsletter-token.test.ts`

**Interfaces:**
- Produces:
  - `newsletterConfig(env?) → NewsletterConfig { from, replyTo, senderInfo, siteUrl, secret }` (kaster uten hemmelighet på minst 32 tegn)
  - `readUnsubscribeSecret(env?) → string | null`, `CONTACT_EMAIL`
  - `signEmail(email, secret) → string`, `encodeEmail`, `decodeEmail`, `verifyUnsubscribe(e, t, secret) → string | null`, `unsubscribeLinks(email, secret, siteUrl) → { page, oneClick }`

- [ ] **Step 1: Skriv testene** (rundtur lenke → verify, store og små bokstaver gir samme token, manipulert token, feil e-post, feil hemmelighet, manglende felter, søppel-base64, tom hemmelighet kaster, konfig-standardverdier og overstyring, hemmelighet for kort kaster, `siteUrl` uten avsluttende skråstrek).
- [ ] **Step 2: Kjør** `npx vitest run __tests__/newsletter-token.test.ts` → FAIL (modul finnes ikke).
- [ ] **Step 3: Implementer** `config.ts` og `token.ts` (HMAC-SHA256 base64url, `timingSafeEqual`, e-post base64url i `e`).
- [ ] **Step 4: Kjør testene** → PASS.
- [ ] **Step 5: Commit** `feat: signerte avmeldingslenker for nyhetsbrev`

### Task 3: E-post-HTML fra artikkel

**Files:**
- Create: `lib/newsletter/theme.ts`, `lib/newsletter/render.ts`, `lib/newsletter/compose.ts`
- Test: `__tests__/newsletter-render.test.ts`

**Interfaces:**
- Consumes: `isAllowedImageSrc`, `isSafeHref`, `storagePublicPrefix` (lib/articles/content), `formatArticleDate`, `unsubscribeLinks`, `NewsletterConfig`
- Produces:
  - `renderNewsletter(article: NewsletterArticle, options: { siteUrl, unsubscribeUrl, senderInfo, imagePrefix? }) → { subject, html, text }`
  - `articleUrl(siteUrl, slug)`, `escapeHtml`
  - `newsletterComposer(article, config, subjectPrefix?) → (email) => EmailMessage` med `List-Unsubscribe` og `List-Unsubscribe-Post`
  - `type EmailMessage = { to, subject, html, text, headers: Record<string,string> }` (definert i `compose.ts`)

- [ ] **Step 1: Skriv testene.** Render: emne = tittel, tittel og ingress escapes, intern lenke gjøres absolutt, `javascript:`-lenke fjernes men teksten beholdes, eksternt bilde fjernes og eget beholdes, forsidebilde, «Les på nettsiden» peker til artikkel-URL, avmeldingslenke og avsenderinfo er med, ren tekst har lister, lenke-URL-er og avmelding. Theme: hver farge finnes som token i `app/globals.css`. Compose: headere og gyldig token for mottakeren, testprefiks i emnet.
- [ ] **Step 2: Kjør** → FAIL.
- [ ] **Step 3: Implementer** `theme.ts`, `render.ts` (tabell-layout, inline-stiler) og `compose.ts`.
- [ ] **Step 4: Kjør** → PASS.
- [ ] **Step 5: Commit** `feat: e-post-HTML for nyhetsbrev fra artikkelinnhold`

### Task 4: Sendeløkke

**Files:**
- Create: `lib/newsletter/send.ts`
- Test: `__tests__/newsletter-send.test.ts`

**Interfaces:**
- Consumes: `EmailMessage` (Task 3)
- Produces:
  - `type SendStore = { claim(id): Promise<boolean>; nextPending(id, limit): Promise<string[]>; record(id, results: DeliveryResult[]): Promise<void>; release(id): Promise<void> }`
  - `type MailResult = { id: string | null; error: string | null }`
  - `type BatchMailer = (messages: EmailMessage[], idempotencyKey: string) => Promise<{ ok: true; results: MailResult[] } | { ok: false; error: string }>`
  - `type DeliveryResult = { email; status: 'sent' | 'failed'; resend_id: string | null; error: string | null }`
  - `type RunResult = { status: 'done' | 'locked' | 'interrupted' | 'time_budget'; sent: number; failed: number; error?: string }`
  - `runNewsletterSend(sendId, { store, mailer, compose, now?, sleep? }) → Promise<RunResult>`
  - `batchIdempotencyKey(sendId, emails)`, `toPositionalResults(count, ids, errors)`, `BATCH_SIZE = 100`, `TIME_BUDGET_MS = 240_000`

- [ ] **Step 1: Skriv testene** (250 mottakere gir 3 kall med 100/100/50, feil per adresse gir `failed`, API-feil i batch 2 gir `interrupted` med resten fortsatt pending og låsen frigitt, claim false gir `locked` uten utsending, stabil og ulik idempotensnøkkel, tidsbudsjett gir `time_budget` og frigir låsen, `record` som kaster frigir låsen og kaster videre, `toPositionalResults` fordeler id-er rundt feil-indekser).
- [ ] **Step 2: Kjør** → FAIL.
- [ ] **Step 3: Implementer** `send.ts`.
- [ ] **Step 4: Kjør** → PASS.
- [ ] **Step 5: Commit** `feat: robust sendeløkke for nyhetsbrev med idempotente batcher`

### Task 5: Supabase- og Resend-adaptere, status og server actions

**Files:**
- Create: `lib/newsletter/runtime.ts`, `lib/newsletter/status.ts`, `lib/newsletter/queries.ts`, `lib/actions/newsletter.ts`
- Test: `__tests__/newsletter-status.test.ts`, `__tests__/newsletter-actions.test.ts`

**Interfaces:**
- Consumes: alt fra Task 1–4, `requireAdmin`, `getArticleForAdmin`, `ActionResult`
- Produces:
  - `supabaseSendStore(supabase) → SendStore`, `resendBatchMailer(apiKey, config) → BatchMailer`
  - `type NewsletterStatus = { kind: 'not_sent'; recipientCount } | { kind: 'sending' | 'sent'; recipientCount, sentCount, failedCount, completedAt, isLocked }`
  - `toNewsletterStatus(row, now)`, `getNewsletterStatus(articleId) → Promise<NewsletterStatus | null>`
  - Server actions: `sendNewsletterTest(articleId) → ActionResult<{ to }>`, `startNewsletter(articleId)` og `resumeNewsletter(articleId) → ActionResult<SendSummary>`, `type SendSummary = { status, sent, failed }`

- [ ] **Step 1: Skriv testene** (status-mapping: låst/ulåst/ferdig; actions: manglende hemmelighet gir feilmelding uten RPC, `already_sent` gir norsk melding, upublisert artikkel avvises før RPC).
- [ ] **Step 2: Kjør** → FAIL.
- [ ] **Step 3: Implementer.**
- [ ] **Step 4: Kjør** → PASS.
- [ ] **Step 5: Commit** `feat: server actions for test- og utsending av nyhetsbrev`

### Task 6: Admin-panel på artikkelsiden

**Files:**
- Create: `components/admin/NewsletterPanel.tsx`
- Modify: `components/admin/ArticleForm.tsx` (slot `newsletterPanel?: ReactNode` i aside, `router.refresh()` etter avpublisering), `app/admin/(protected)/articles/[id]/page.tsx` (henter status, `maxDuration = 300`)

**Interfaces:**
- Consumes: `NewsletterStatus`, actions fra Task 5
- Produces: `<NewsletterPanel articleId isPublished status />`

- [ ] **Step 1: Implementer panelet** (tilstander fra specen: ikke tilgjengelig / publiser først / test → bekreft → send / fortsett / sendt).
- [ ] **Step 2: Koble panelet inn** i siden og skjemaet.
- [ ] **Step 3: `npx tsc --noEmit` + `npx eslint`** → rent.
- [ ] **Step 4: Commit** `feat: nyhetsbrev-panel på artikkelsiden i admin`

### Task 7: Avmelding (side, one-click og proxy)

**Files:**
- Create: `lib/newsletter/unsubscribe.ts`, `lib/routing/coming-soon.ts`, `app/nyhetsbrev/avmeld/page.tsx`, `app/api/nyhetsbrev/avmeld/route.ts`
- Modify: `proxy.ts` (bruk `isOpenDuringComingSoon`), `lib/routing/shop-gate.ts` (`/nyhetsbrev` i `ROOT_APP_PATHS`), `.env.example`, `app/personvern/page.tsx` (én setning om avmelding)
- Test: `__tests__/newsletter-unsubscribe.test.ts`, `__tests__/coming-soon.test.ts`, `__tests__/shop-gate.test.ts`

**Interfaces:**
- Produces: `unsubscribe(e, t, deps?) → Promise<'ok' | 'invalid' | 'error'>`, `isOpenDuringComingSoon(pathname, host) → boolean`

- [ ] **Step 1: Skriv testene** (gyldig token gir `remove` med lowercase e-post og `ok`; ugyldig gir `invalid` uten `remove`; manglende hemmelighet gir `error`; `remove` som feiler gir `error`; one-click-ruten svarer 200/400/500; coming-soon slipper gjennom `/nyhetsbrev/avmeld`, `/api/nyhetsbrev/avmeld`, `/admin`, `/api/webhooks/stripe`, statiske filer og `admin.`-vert, men ikke `/travels`, `/api/newsletter` eller `/nyhetsbrevfoo`; `isRootAppPath('/nyhetsbrev/avmeld')`).
- [ ] **Step 2: Kjør** → FAIL.
- [ ] **Step 3: Implementer.** Siden melder aldri av på GET.
- [ ] **Step 4: Kjør hele testsuiten, `tsc`, `eslint` og `npm run build`** → grønt (bortsett fra de 3 kjente `github-dispatch`-feilene).
- [ ] **Step 5: Commit** `feat: avmelding fra nyhetsbrev med one-click og COMING_SOON-unntak`

### Task 8: PR

- [ ] Push `feature/nyhetsbrev`, opprett PR med spørsmålene til Mikkel øverst, oppsettsteg (migrasjon 026, `NEWSLETTER_UNSUBSCRIBE_SECRET` i Vercel) og testplan. **Ikke merge** før Mikkel har svart og kjørt migrasjonen.
