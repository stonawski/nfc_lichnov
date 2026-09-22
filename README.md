# NFC Lichnov

Moderní veřejný web a administrace fotbalového klubu NFC Lichnov.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Supabase
- Cloudflare R2 pro média

## Lokální spuštění

```bash
npm ci
cp .env.example .env
npm run dev
```

Do `.env` doplň veřejné hodnoty:

```env
VITE_SUPABASE_URL=https://TVUJ_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=TVUJ_ANON_NEBO_PUBLISHABLE_KEY
VITE_SITE_URL=https://TVA-PRODUKCNI-DOMENA.cz
```

`VITE_SITE_URL` může při lokálním vývoji zůstat prázdné. V produkci nastav finální HTTPS origin bez lomítka na konci. Používá se pro canonical URL, Open Graph metadata a generování sitemap.

**Do browser env nikdy nevkládej service-role key, Cloudflare secret ani jiné privátní přístupové údaje.**

## Build

```bash
npm run build
npm run preview
```

Build nejdřív spustí TypeScript kontrolu, potom Vite a nakonec vygeneruje produkční `robots.txt` a při nastaveném `VITE_SITE_URL` také `sitemap.xml`.

GitHub Actions spouští stejný build při pull requestech a po pushi do `main`.

## Veřejný web

Aktuálně obsahuje:

- homepage
- týmy a detail týmu
- zápasy a detail zápasu
- aktuality a detail článku
- galerie a detail galerie
- klub, historii, historické statistiky a sportovní areál
- kontakt
- vlastní 404 a globální error/offline stavy

Sportovní data se načítají ze Supabase. Ručně spravovaný obsah používá administraci pod `/admin`.

## Administrace

Dostupné moduly:

- Galerie
- Aktuality
- Hráči
- Realizační tým
- Historické statistiky

Přístup je chráněný Supabase Auth a serverovou kontrolou `can_edit_content()`. Média se nahrávají přes Edge Functions do Cloudflare R2.

## Databáze

Repo obsahuje databázové migrace potřebné pro funkce, které vznikly spolu s frontendem. Před produkčním nasazením zkontroluj a aplikuj všechny migrace ve složce `supabase/migrations`.

Historické klubové statistiky používají migraci:

```text
supabase/migrations/20260922083000_club_stats.sql
```

## Produkční spuštění

Kompletní kontrolní seznam je v:

```text
docs/LAUNCH_CHECKLIST.md
```

Obsahuje build, env, Supabase/RLS, R2, SEO, responsive QA, accessibility, doménu, SPA fallback i kontrolu po spuštění.

## Design

Základní paleta:

- primary green `#00923F`
- dark green `#14532D`
- deep green `#18352A`
- beige `#F3EFE6`
- warm off-white `#FAF8F3`

Veřejná část používá jednotný hero systém, persistentní navigaci/footer a datové bloky s loading/fade-in stavy.
