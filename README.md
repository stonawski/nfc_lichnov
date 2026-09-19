# NFC Lichnov frontend

První moderní React/Vite frontend pro NFC Lichnov. Projekt je připravený pro existující Supabase backend a **neobsahuje žádné migrace ani zásahy do databázového schématu**.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Supabase JS

## Spuštění

1. Rozbal projekt a otevři složku v terminálu.
2. Nainstaluj závislosti:

```bash
npm install
```

3. Zkopíruj `.env.example` na `.env`:

```bash
cp .env.example .env
```

Na Windows můžeš soubor jednoduše duplikovat a přejmenovat.

4. Do `.env` vlož veřejné údaje ze Supabase projektu:

```env
VITE_SUPABASE_URL=https://TVUJ_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=TVUJ_ANON_NEBO_PUBLISHABLE_KEY
```

**Nikdy sem nevkládej service role key ani FACR token.**

5. Spusť frontend:

```bash
npm run dev
```

Vite vypíše lokální adresu, typicky `http://localhost:5173`.

## Co už je napojené

- `teams`
- `team_seasons`
- `matches`
- `standings`
- `players`
- `staff`
- `news`

Homepage obsahuje dynamický carousel týmů, aktuality, nejbližší zápasy, náhled tabulky a týmy. Týmová stránka načítá zápasy, tabulku, hráče a realizační tým.

## Co je zatím záměrně placeholder

- `galleries` / `gallery_images` — strukturu jejich přesných sloupců ještě ověříme před napojením.
- obsah stránek Klub / Kontakt
- admin UI
- oficiální fotografie hřiště/klubu

## Design

Paleta:

- primary green `#00923F`
- dark green `#14532D`
- deep green `#18352A`
- beige `#F3EFE6`
- warm off-white `#FAF8F3`

Navigace a vizuální rytmus jsou stavěné jako moderní produktový web, nikoliv klasická fotbalová šablona.
