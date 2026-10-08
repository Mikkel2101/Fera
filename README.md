# Fera Padel

Nettside for **FeraTravels** (padelreiser) og **FeraShop** (padelutstyr). Next.js 16, Tailwind v4, Supabase.

Regler for kode, design-tokens og hvem som eier hvilke mapper står i [AGENTS.md](AGENTS.md) — les den først.

## Kom i gang

Krever Node 24 og tilgang til repoet på GitHub.

```bash
git clone git@github.com:Mikkel2101/Fera.git   # hopp over hvis du allerede har repoet
cd Fera
npm install
cp .env.example .env.local                      # fyll inn verdiene du får fra Mikkel
npm run dev                                     # åpne http://localhost:3000
```

VSCode foreslår anbefalte utvidelser (Tailwind IntelliSense, ESLint) første gang du åpner mappa — trykk «Install».

## Slik jobber vi

`main` er beskyttet. Alle endringer går via egen branch og pull request.

```bash
git checkout main && git pull                   # start alltid fra oppdatert main
git checkout -b design/kort-beskrivelse         # f.eks. design/forside-hero
# … gjør endringer …
git add -A && git commit -m "design: kort beskrivelse av endringen"
git push -u origin design/kort-beskrivelse
```

Åpne PR-en på GitHub. Vercel lager automatisk en preview-lenke i PR-en, og Mikkel reviewer og merger.

**Tips:** små PR-er ofte gir færre konflikter enn én stor. Har `main` endret seg mens du jobber: `git pull origin main` i din branch.

## Kommandoer

| Kommando | Hva |
|---|---|
| `npm run dev` | Dev-server på localhost:3000 |
| `npm run build` | Produksjonsbygg (kjør før PR hvis du har endret mye) |
| `npm run lint` | ESLint |
| `npm run test` | Enhetstester (Vitest) |

## Design-tokens

Alle farger ligger som CSS-variabler i [`app/globals.css`](app/globals.css). Bruk `bg-(--color-dark)`, aldri hardkodede hex-verdier.
