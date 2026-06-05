# Admin Panel — RLS + Verifikasjon

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin-panelet er strukturelt ferdig. Dette planen legger til manglende RLS-policies og verifiserer at hele panelet fungerer med riktig CSS og testdata.

**Architecture:** Supabase RLS skiller admin-tilgang fra public tilgang. Admin-skriving til trips krever `app_metadata.role = 'admin'` i JWT. Anon-klienten bruker auth-cookie satt av Supabase SSR.

**Tech Stack:** Next.js 16, Supabase (RLS/SQL), Tailwind v4

---

### Task 1: Opprett og kjør migration 003_admin_rls.sql

**Files:**
- Create: `supabase/migrations/003_admin_rls.sql`

- [ ] **Steg 1: Opprett migrasjonsfilen**

```sql
-- supabase/migrations/003_admin_rls.sql

-- trips: admin kan INSERT/UPDATE/DELETE (i tillegg til eksisterende public SELECT policy)
CREATE POLICY "admin_trips_write" ON trips
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- bookings: admin kan SELECT alle
CREATE POLICY "admin_bookings_read" ON bookings
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- waitlist: admin kan SELECT alle
CREATE POLICY "admin_waitlist_read" ON waitlist
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
```

- [ ] **Steg 2: Kjør migrasjonen via Supabase CLI**

```bash
npx supabase db push
```

Forventet: `Applied 1 migration`

- [ ] **Steg 3: Commit**

```bash
git add supabase/migrations/003_admin_rls.sql
git commit -m "feat: add admin RLS policies for trips write and bookings/waitlist read"
```

---

### Task 2: Verifiser admin-panel i nettleser

**Files:** ingen endringer

- [ ] **Steg 1: Åpne dashboard**

Gå til `http://localhost:3000/admin/dashboard`.
Forventet: stats-kort med 3 aktive turer, tabell med siste bookinger (tom).

- [ ] **Steg 2: Verifiser turlisten**

Gå til `http://localhost:3000/admin/trips`.
Forventet: alle 3 turer vises med navn, destinasjon, datoer, status-badge og Rediger/Slett.

- [ ] **Steg 3: Verifiser TripForm — rediger en tur**

Klikk "Rediger" på Costa Blanca Camp.
Forventet: TripForm laster med alle felt forhåndsutfylt (navn, datoer, priser, FAQ).
Endre `hotel`-feltet og lagre.
Forventet: redirect tilbake til `/admin/trips`, endringen er lagret.

- [ ] **Steg 4: Verifiser publiser-toggle**

Klikk "Avpublisert"-knappen på en tur.
Forventet: knappen skifter til "Publisert" uten reload-feil.

- [ ] **Steg 5: Verifiser bookinger og venteliste**

Gå til `/admin/bookings` og `/admin/waitlist`.
Forventet: tomme tabeller med "Ingen bookinger funnet" / "Ingen på venteliste." — ikke feilmeldinger.
