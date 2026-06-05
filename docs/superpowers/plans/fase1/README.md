# Fera Padel Fase 1 — Implementasjonsplan

**Dato:** 2026-06-05  
**Spec:** `docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md`  
**Status:** Klar for implementering

---

## Bølgeplan

| Bølge | Plan | Hva bygges | Avhenger av |
|-------|------|------------|-------------|
| 1 | PLAN-01 | Design tokens (Palett C Dorado) + Nav-komponent | — |
| 2 | PLAN-02 | Supabase-migrasjon + `/travels` listevisning | PLAN-01 |
| 3 | PLAN-03 | `/travels/[id]` turdetaljside | PLAN-01, PLAN-02 |
| 4a | PLAN-04 | `/travels/[id]/book` 3-stegs bookingflyt (UI) | PLAN-01, PLAN-02, PLAN-03 |
| 4b | PLAN-05 | API-routes + success/cancel-sider | PLAN-02 |

PLAN-04 og PLAN-05 kjøres **parallelt** i bølge 4.

---

## Filer som opprettes

### Bølge 1
- `app/globals.css` — oppdatert med Palett C Dorado tokens
- `components/travels/Nav.tsx` — sticky nav
- `app/travels/layout.tsx` — Nav inkludert

### Bølge 2
- `supabase/migrations/002_travels_fase1.sql` — trips, bookings, waitlist tabeller
- `components/travels/TripCard.tsx` — kortkomponent
- `components/travels/TripFilters.tsx` — client-side dropdown-filtrering
- `components/travels/TripListClient.tsx` — klient-wrapper for kortgrid
- `app/travels/page.tsx` — listevisning (erstatter placeholder)

### Bølge 3
- `app/travels/[id]/page.tsx` — detaljside
- `app/travels/[id]/not-found.tsx`
- `components/travels/detail/TripHero.tsx`
- `components/travels/detail/TripMetaBar.tsx`
- `components/travels/detail/TripProgram.tsx`
- `components/travels/detail/TripIncluded.tsx`
- `components/travels/detail/TripExtras.tsx`
- `components/travels/detail/TripCoaches.tsx`
- `components/travels/detail/TripPrices.tsx`
- `components/travels/detail/TripFaq.tsx`
- `components/travels/detail/WaitlistForm.tsx`

### Bølge 4a
- `lib/booking/schema.ts` — Zod-skjema
- `app/travels/[id]/book/layout.tsx`
- `app/travels/[id]/book/page.tsx`
- `components/booking/BookingShell.tsx`
- `components/booking/ProgressBar.tsx`
- `components/booking/Step1PersonInfo.tsx`
- `components/booking/Step2RoomExtras.tsx`
- `components/booking/Step3Payment.tsx`

### Bølge 4b
- `app/api/travels/checkout/route.ts` — Stripe Checkout Session
- `app/api/webhooks/stripe/route.ts` — fullfører stub
- `app/travels/[id]/book/success/page.tsx`
- `app/travels/[id]/book/cancel/page.tsx`

---

## Token-regler (håndheves av Verification i hvert plan)

```
ALDRI hardkode hex i komponentfiler.
ALLTID bruk CSS-token-klasser: text-[--color-gold], bg-[--color-cta] osv.
```

---

## Manuelle steg etter implementering

1. Fyll inn `.env.local` med Supabase + Stripe keys
2. Kjør: `npx supabase db push` (kjør 002_travels_fase1.sql)
3. Test webhook lokalt: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Legg til testdata i `trips`-tabellen via Supabase Studio

---

## Next.js 16-spesifikke hensyn

- **proxy.ts** ikke middleware.ts (allerede implementert i foundation)
- **`params` og `searchParams` er Promises** i page- og layout-komponenter — alltid `await params`
- Stripe `apiVersion`-streng: verifiser mot `node_modules/stripe/dist/` ved TypeScript-feil
