---
plan: "01-tokens-nav"
title: "Design tokens (Palett C Dorado) + Nav-komponent"
wave: 1
depends_on: []
files_modified:
  - app/globals.css
  - app/travels/layout.tsx
  - components/travels/Nav.tsx
autonomous: true
phase: "Fera Padel Fase 1"
spec: "docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md"
---

## Objective

Oppdater design tokens til Palett C (Dorado — espresso/gull/amber) og bygg sticky
Nav-komponent med FERA \ PADEL-logo og Eventer-dropdown. Alle farger som CSS-tokens
— ingen hardkodede hex-verdier i komponentfiler.

## must_haves

- `globals.css` eksponerer alle Palett C-tokens under `@theme`
- Ingen komponent bruker hardkodet hex — kun token-navn
- Nav er sticky, hvit bakgrunn, vises på alle `/travels/*`-routes
- "FERA" er `font-display` bold, `\ PADEL` er `color-gold` regular
- Eventer-dropdown lister 4 segmenter

---

## Task 1.1 — Oppdater globals.css med Palett C Dorado

<read_first>
- app/globals.css (nåværende tokens — skal byttes ut)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §2 (fullstendig tokenliste)
</read_first>

<action>
Erstatt @theme-blokken i app/globals.css med Palett C Dorado. Behold `@import "tailwindcss"`,
`* { box-sizing: border-box; }` og body-regelen, men oppdater body til å bruke nye tokens.

Nye tokens som skal inn:

Bakgrunner:
  --color-bg:        #FFFCF5
  --color-surface:   #FFFFFF
  --color-sand:      #F5F0E8

Hero / mørk seksjon:
  --color-dark:      #1C1410
  --color-dark-mid:  #3D2A1C
  --color-dark-card: #2C1A0E

Tekst:
  --color-text:      #1C1410
  --color-muted:     #B0A090
  --color-subtle:    #7A6A5A

Merkevare:
  --color-gold:      #C49A3C
  --color-cta:       #E8752A
  --color-success:   #5D9E6A

Border:
  --color-border:    #EDE5D8

Fonter (uendret):
  --font-display: var(--font-playfair)
  --font-sans:    var(--font-dm-sans)

Oppdater body-klassen: bg-[--color-bg] text-[--color-text] font-sans
</action>

<acceptance_criteria>
- globals.css inneholder `--color-gold: #C49A3C`
- globals.css inneholder `--color-cta: #E8752A`
- globals.css inneholder `--color-dark: #1C1410`
- globals.css inneholder `--color-dark-card: #2C1A0E`
- globals.css inneholder IKKE `--color-primary`, `--color-accent`, `--color-light`
  (gamle Palett A-tokens er fjernet)
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 1.2 — Opprett components/travels/Nav.tsx

<read_first>
- app/globals.css (token-navn — bruk disse, ikke hex)
- docs/superpowers/specs/2026-06-05-fera-padel-fase1-design.md §4 (Nav-spec)
- app/layout.tsx (font-variable-navn: --font-playfair, --font-dm-sans)
- node_modules/next/dist/docs/ (Next.js 16 Link og Image API)
</read_first>

<action>
Opprett components/travels/Nav.tsx som Client Component (`'use client'`).

Struktur (desktop):
  [FERA \ PADEL]    Shop  Eventer ▾  Inspirasjon         Profil  🛒

- `<nav>` med: sticky top-0, z-50, bg-white/95 backdrop-blur, border-b border-[--color-border]
- Logo-lenke til `/travels`:
    "FERA" — font-display, font-bold, text-[--color-text]
    " \ PADEL" — font-display, font-normal, text-[--color-gold]
- Nav-lenker: text-[--color-subtle], text-[13px], DM Sans
- Eventer-dropdown (hover/click):
    Bedrifter · Klubber & trenere · Lag & vennegjenger · Skoler & foreninger
    Dropdown: absolute, bg-white, border border-[--color-border], shadow-md, rounded-lg
- "Se turer"-pill-knapp: bg-[--color-cta] text-white, px-4 py-2, rounded-full
- Mobil: hamburger-ikon (☰/✕) toggle, full-width meny

Bruk Next.js 16 Link for alle interne lenker.
Bruk useState for dropdown og mobil-meny toggle.
Ingen hardkodet hex — kun CSS-token-klasser.
</action>

<acceptance_criteria>
- components/travels/Nav.tsx eksisterer
- Inneholder `'use client'`
- Inneholder `text-[--color-gold]` (logo PADEL-del)
- Inneholder `bg-[--color-cta]` (Se turer-knapp)
- Inneholder `border-[--color-border]`
- Ingen `#` hex-farger direkte i komponent-JSX eller className
- `npx tsc --noEmit` exit 0
</acceptance_criteria>

---

## Task 1.3 — Inkluder Nav i app/travels/layout.tsx

<read_first>
- app/travels/layout.tsx (nåværende innhold — bare wrapper)
- components/travels/Nav.tsx (nettopp opprettet)
- node_modules/next/dist/docs/ (Next.js 16 Layout-API)
</read_first>

<action>
Oppdater app/travels/layout.tsx slik at Nav-komponenten rendres øverst på alle
/travels/*-sider. Behold eksisterende Metadata-eksport uendret.

Layout-struktur:
  <Nav />
  <main>{children}</main>
</action>

<acceptance_criteria>
- app/travels/layout.tsx importerer Nav fra components/travels/Nav
- Layout-body har `<Nav />` over `{children}`
- `npx tsc --noEmit` exit 0
- `npm run build` exit 0 (ingen TypeScript-feil i Nav)
</acceptance_criteria>

---

## Verification

```bash
npx tsc --noEmit
npm run build
grep -r "#[0-9A-Fa-f]\{3,6\}" components/travels/Nav.tsx && echo "FAIL: hex i komponent" || echo "OK: ingen hardkodede hex"
grep "color-gold" app/globals.css
grep "color-cta" app/globals.css
grep "color-dark-card" app/globals.css
```
