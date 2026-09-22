# NFC Lichnov — finální technická dokumentace projektu

Tento dokument slouží jako technický handover a finální popis projektu NFC Lichnov. Shrnuje architekturu veřejného webu, administrace, backendu, databáze, práce s médii, bezpečnosti, výkonu, SEO, CI/CD a produkčního nasazení.

## 1. Přehled řešení

NFC Lichnov je moderní klubová webová platforma, která spojuje:

- veřejný web fotbalového klubu,
- sportovní data a výsledky,
- týmové stránky,
- aktuality a galerie,
- historické klubové statistiky,
- vlastní administrační rozhraní,
- autentizaci a autorizaci editorů,
- cloudové úložiště médií,
- SEO a produkční build pipeline.

Frontend je single-page application postavená v Reactu. Backendovou vrstvu zajišťuje Supabase a média jsou uložena v Cloudflare R2.

Zjednodušená architektura:

```text
Uživatel / prohlížeč
        │
        ▼
React SPA
Vite + TypeScript + Tailwind CSS
React Router + TanStack Query
        │
        ├──────────────► Cloudflare R2
        │                obrázky a galerie
        │
        ▼
Supabase
PostgreSQL + Auth + RLS + RPC
        │
        └──────────────► Supabase Edge Functions
                         upload / delete médií
```

## 2. Použité technologie

| Oblast | Technologie |
| --- | --- |
| Frontend | React 18 |
| Jazyk | TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM 6 |
| Server state a cache | TanStack React Query 5 |
| Backend | Supabase |
| Databáze | PostgreSQL přes Supabase |
| Authentication | Supabase Auth |
| Oprávnění | PostgreSQL RLS + `can_edit_content()` |
| Serverless backend | Supabase Edge Functions / Deno |
| Média | Cloudflare R2 |
| R2 API | AWS S3 SDK |
| Ikony | Lucide React |
| CI | GitHub Actions |
| SEO build | vlastní Node skript |

Aktuální verze knihoven jsou definované v `package.json`.

## 3. Frontend

Frontend je napsaný v Reactu s TypeScriptem. Aplikace startuje přes `src/main.tsx`.

Globálně jsou zapojené:

- `React.StrictMode`,
- `BrowserRouter`,
- `QueryClientProvider`,
- globální `AppErrorBoundary`,
- globální Tailwind/CSS styly.

TanStack Query má centrální cache a sjednocené loading/error stavy. Běžná serverová data nejsou řešena ručně přes ad-hoc `fetch` v komponentách.

## 4. Routing

Veřejné routy:

```text
/
/tymy
/tymy/:slug
/zapasy
/zapasy/:id
/aktuality
/aktuality/:slug
/galerie
/galerie/:slug
/klub
/klub/historie
/klub/statistiky
/klub/areal
/kontakt
```

Administrace:

```text
/admin
/admin/prihlaseni
/admin/galerie
/admin/galerie/:id
/admin/aktuality
/admin/aktuality/:id
/admin/hraci
/admin/hraci/:id
/admin/realizacni-tym
/admin/realizacni-tym/:id
/admin/statistiky
```

Neznámé veřejné URL používají vlastní 404 stránku.

## 5. SPA chování a persistentní shell

Aplikace je skutečná SPA. Při veřejné navigaci se nemountuje znovu celý web.

Persistentní zůstávají zejména:

- hlavní navigace,
- footer,
- React Query cache,
- sdílená hero vrstva.

Mění se pouze obsah konkrétní routy uvnitř React Router `Outlet`.

To omezuje vizuální přeskakování, zbytečné requesty a opakované vytváření stejných prvků.

## 6. Code splitting a přednačítání rout

Veřejné stránky i admin jsou rozdělené přes `React.lazy()`.

Návštěvník homepage proto nestahuje například:

- administraci,
- historické statistiky,
- detail galerie,
- editory obsahu.

Vybrané veřejné chunky se připravují:

- při hoveru nad interním odkazem,
- při focusu klávesnicí,
- při touch intentu,
- nejčastější veřejné sekce i během browser idle času.

Navigace díky tomu působí jako dlouho běžící aplikace, nikoliv jako sada samostatných dokumentů.

## 7. Stabilní loading layout

Projekt rozlišuje dvě fáze načítání:

1. načtení JavaScript chunku konkrétní routy,
2. načtení dat dané stránky.

Pro obě existují skeletony, které rezervují přibližně finální výšku stránky.

U datově náročných stránek se nezobrazuje polohotový layout. Detail týmu například čeká na:

- tým,
- zápasy,
- tabulku,
- hráče,
- realizační tým.

Až poté se hotová stránka zobrazí jemným fade-inem.

Stejný princip je použitý pro přehled zápasů a detail zápasu. Tím se eliminuje výrazné posouvání footeru a postupné naskakování velkých sekcí.

## 8. Hero systém

Veřejný web používá sdílenou fotografii hřiště:

```text
/hero-lichnov-field.webp
```

Hero obrázek je umístěný v persistentním `Layout`, takže během změny veřejné routy zůstává stejný DOM uzel namountovaný.

Jednotlivé stránky mění pouze:

- text,
- obsah,
- light/dark overlay.

Samotný obrázek se při navigaci nevytváří znovu.

Asset je také preloadovaný už z `index.html` a má vysokou fetch prioritu.

## 9. Design systém

Hlavní barevná paleta:

```text
Primary green     #00923F
Dark green        #14532D
Deep green        #18352A
Beige             #F3EFE6
Warm off-white    #FAF8F3
```

Hlavní vizuální principy:

- velká výrazná typografie,
- jednotný hero systém,
- teplé off-white a sand plochy,
- tmavě zelené kontrastní sekce,
- zaoblené karty,
- jemné stíny,
- sticky/floating navigace,
- responsive layout,
- data-driven fade-in bez posouvání celých background sekcí.

## 10. Datová vrstva

Veřejné Supabase dotazy jsou centralizované hlavně v:

```text
src/lib/data.ts
```

Datové typy jsou definované v:

```text
src/lib/types.ts
```

Frontend pracuje zejména s těmito tabulkami:

```text
teams
team_seasons
matches
standings
players
staff
news
galleries
gallery_images
match_players
```

Historické statistiky používají navíc:

```text
club_player_stats
club_seasons
club_stats_audit
club_stats_last_edit
```

## 11. Týmy

Týmová data obsahují například:

```text
id
name
short_name
slug
category
logo_url
active
sort_order
season
```

Slug je použit přímo v URL, například `/tymy/muzi`.

Detail týmu kombinuje:

- informace o týmu,
- poslední a příští zápas,
- program,
- tabulku,
- hráče,
- realizační tým.

## 12. Zápasy

Model zápasu podporuje mimo jiné:

- FAČR match ID,
- domácí a hostující tým,
- klubová loga,
- termín,
- sezonu,
- soutěž,
- kolo,
- stav,
- skóre,
- penalty,
- hřiště,
- manual override výsledku.

Veřejný web obsahuje přehled zápasů napříč kategoriemi i detail konkrétního utkání.

Detail zápasu může zobrazovat sestavu a timeline podle dostupných dat.

## 13. Tabulky

Standings obsahují například:

- pořadí,
- body,
- počet zápasů,
- výhry,
- remízy,
- prohry,
- vstřelené a obdržené góly,
- sezonu.

NFC Lichnov se v tabulkách vizuálně zvýrazňuje.

## 14. Hráči

Model hráče podporuje:

- tým,
- FAČR ID,
- jméno,
- datum narození,
- číslo dresu,
- pozici,
- fotografii,
- FAČR fotografii,
- bio,
- zápasy,
- góly,
- karty,
- aktivní stav,
- řazení.

Veřejné týmové stránky používají hráčský carousel a administrace umožňuje hráče spravovat.

## 15. Realizační tým

Člen realizačního týmu obsahuje například:

- tým,
- FAČR person ID,
- jméno,
- roli,
- fotografii,
- bio,
- aktivní stav,
- pořadí.

Administrace umožňuje editovat trenéry i další členy vedení.

## 16. Aktuality

Aktuality fungují jako vlastní CMS modul.

Článek podporuje:

```text
title
slug
excerpt
content
cover_image
category
team_id
featured
published
published_at
```

Veřejné routy:

```text
/aktuality
/aktuality/:slug
```

Admin umožňuje články vytvářet, editovat a publikovat.

Pokud nejsou publikované žádné články, veřejný web používá navržený empty state místo prázdné plochy.

## 17. Galerie

Galerie jsou rozdělené do:

```text
galleries
gallery_images
```

Galerie podporuje:

- název,
- slug,
- popis,
- titulní obrázek,
- datum události,
- published stav,
- řazení.

Jednotlivé fotografie mají:

- gallery ID,
- image URL,
- caption,
- sort order.

Veřejná galerie obsahuje přehled alb, detail alba a lightbox s keyboard ovládáním.

## 18. Historické statistiky

Historická část je samostatný datový subsystém.

Obsahuje historické hráčské totals a sezonní historii klubu.

Hráčský záznam uchovává zejména:

- jméno,
- historický počet zápasů,
- historický počet gólů,
- zdrojové pořadí,
- volitelné propojení na FAČR hráče,
- aktivní stav,
- `needs_review`,
- `updated_at`.

Sezonní historie obsahuje například:

- sezonu,
- počet zápasů,
- bilanci,
- skóre,
- body,
- soutěž,
- umístění,
- případný postup/sestup,
- následující soutěž.

Migrace:

```text
supabase/migrations/20260922083000_club_stats.sql
```

## 19. Propojení historických statistik se současnými hráči

Historická data se propojují se současnými hráči primárně přes:

```text
facr_player_id
```

Při prvotním propojení existuje konzervativní fallback podle jména.

Důležitá vlastnost:

**historické zápasy a góly se nikdy automaticky nepřičítají z aktuálních hodnot v tabulce `players`.**

Nový kvalifikovaný hráč může být vložen s:

```text
matches = 0
goals = 0
active = true
needs_review = true
```

Takový záznam není veřejně zobrazovaný, dokud jej editor nezkontroluje.

Synchronizace je dostupná přes databázovou funkci:

```text
sync_club_player_stats_current()
```

## 20. Audit historických statistik

Historické statistiky mají auditní vrstvu.

Používají se tabulky:

```text
club_stats_audit
club_stats_last_edit
```

Audit může ukládat:

- typ entity,
- klíč entity,
- akci,
- čas změny,
- Supabase user ID,
- e-mail editora,
- JSON před změnou,
- JSON po změně.

Seed/migration zápisy bez přihlášeného uživatele se do editor audit trailu nezapisují.

## 21. Backend — Supabase

Supabase v projektu plní několik rolí:

### PostgreSQL

Je zdrojem pravdy pro sportovní i klubová data.

### Auth

Administrátoři se přihlašují přes Supabase Auth.

Frontend session:

- persistuje,
- automaticky obnovuje token,
- umí detekovat session z URL.

### RPC

Používají se databázové funkce jako:

```text
can_edit_content()
sync_club_player_stats_current()
```

### Edge Functions

Server-side logika pro Cloudflare R2 běží v Supabase Edge Functions.

## 22. Autorizace administrace

Pouhé přihlášení nestačí.

`AdminGuard` ověřuje:

1. aktivní Supabase session,
2. výsledek `can_edit_content()`.

Teprve hodnota `true` zpřístupní administraci.

Tím je oddělené:

- authenticated,
- authorized editor.

Stejný permission check používají i media Edge Functions.

## 23. Row Level Security

Historické statistiky používají PostgreSQL RLS.

Veřejnost má read přístup k veřejným statistickým datům.

Zápis vyžaduje autentizovaného uživatele a:

```sql
can_edit_content()
```

Auditní tabulky nejsou veřejně čitelné.

## 24. Cloudflare R2

Média nejsou ukládána jako binární data v PostgreSQL.

Používá se Cloudflare R2 Object Storage.

Scope adresáře:

```text
galleries/
players/
news/
staff/
club/
```

Upload flow:

```text
Admin
  ↓
Supabase Edge Function
  ↓
ověření JWT
  ↓
can_edit_content()
  ↓
presigned R2 URL
  ↓
browser nahraje soubor přímo do R2
```

Soubor tedy neteče přes Supabase databázi.

## 25. Media Edge Functions

Repo obsahuje:

```text
supabase/functions/media-upload-url
supabase/functions/gallery-upload-url
supabase/functions/media-delete
```

Upload podporuje:

- JPEG,
- PNG,
- WebP,
- AVIF.

Maximální velikost jednoho souboru je 12 MB.

Presigned upload URL má platnost 300 sekund.

Názvy souborů a resource segmenty se sanitizují a object key obsahuje UUID.

## 26. Bezpečnost médií

Citlivé R2 hodnoty jsou pouze na serveru:

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
R2_PUBLIC_URL
```

Frontend je nikdy nedostává.

Delete endpoint kontroluje scope a resource prefix, takže editor nemůže přes endpoint libovolně mazat objekty mimo konkrétní resource.

## 27. Administrace

Dostupné moduly:

- Dashboard,
- Galerie,
- Aktuality,
- Hráči,
- Realizační tým,
- Historické statistiky.

Admin routy jsou lazy-loaded a nejsou součástí prvního veřejného bundle.

Administrace používá Supabase Auth, `can_edit_content()`, mutation loading stavy a potvrzení destruktivních operací.

## 28. Server state a cache

Projekt používá TanStack Query.

Výhody:

- cache,
- loading/error stavy,
- refetch,
- sdílení dat mezi komponentami,
- omezení duplicitních requestů.

Globálně je nastavený `staleTime` a vypnutý automatický refetch při focusu okna.

## 29. Loading, error a empty stavy

Projekt rozlišuje:

```text
loading
error
empty
```

Backendová chyba tedy nevypadá jako prázdný seznam.

Existují:

- `LoadingState`,
- full-page datový skeleton,
- `ErrorState` s retry akcí,
- navržené empty states.

Po načtení se data-driven bloky zobrazují jemným opacity fade-inem.

## 30. Globální error handling a offline stav

Projekt obsahuje globální:

```text
AppErrorBoundary
```

Neočekávaná React chyba tak nevede pouze k bílé obrazovce.

Existuje také:

```text
NetworkStatus
```

který informuje uživatele o offline stavu.

## 31. Accessibility

Finalizační vrstva obsahuje:

- skip link na hlavní obsah,
- focus management po SPA navigaci,
- `aria-expanded`,
- `aria-controls`,
- `aria-live`,
- `role=status`,
- tabulkovou sémantiku,
- keyboard scrolling hráčského carouselu,
- focus lightboxu,
- Escape pro menu a lightbox,
- větší touch targety,
- podporu `prefers-reduced-motion`,
- mobilní scroll lock při otevřeném menu.

## 32. SEO

Projekt má vlastní komponentu `Seo`.

Dynamicky nastavuje:

- title,
- meta description,
- robots,
- canonical URL,
- Open Graph,
- Twitter Card,
- `og:url`,
- `og:image`.

Statické hlavní routy mají vlastní metadata.

Dynamické detailové stránky generují metadata z konkrétního:

- týmu,
- zápasu,
- článku,
- galerie.

## 33. Sitemap a robots

Po produkčním buildu běží:

```text
scripts/generate-static-seo.mjs
```

Ten generuje:

```text
robots.txt
```

a při nastaveném `VITE_SITE_URL` také:

```text
sitemap.xml
```

Admin je z indexace blokovaný.

404 a administrace používají `noindex`.

## 34. SEO omezení SPA

Aplikace je client-side SPA, nikoliv SSR.

Dynamická metadata jsou nastavena po spuštění JavaScriptu.

Google umí JavaScript běžně zpracovat, ale některé social preview crawlery nemusí.

Pokud produkční prostředí ukáže, že rich preview dynamických detailů nefunguje, další možný krok je:

- prerender,
- SSR,
- edge-generated metadata.

## 35. Performance

Performance optimalizace zahrnují:

- route code splitting,
- admin code splitting,
- vendor splitting,
- persistentní layout,
- persistentní hero asset,
- preload hlavního hero obrázku,
- idle/intent warming rout,
- React Query cache,
- lazy/decode nastavení běžných obrázků,
- stabilní skeleton layout.

Vite odděluje zejména:

```text
React
React Router
TanStack Query
Supabase
Lucide
ostatní vendor knihovny
```

Tím se zlepšuje dlouhodobá browser cache při dalších deployích.

## 36. Build

Lokální development:

```bash
npm ci
npm run dev
```

Production build:

```bash
npm run build
```

Build provede:

```text
TypeScript typecheck
↓
Vite production build
↓
SEO file generation
```

Preview produkčního buildu:

```bash
npm run preview
```

## 37. CI

GitHub Actions při pull requestech a pushi do `main` provádí:

- `npm ci`,
- production dependency audit,
- TypeScript + Vite build,
- kontrolu vygenerovaného `robots.txt`,
- kontrolu `sitemap.xml`.

CI používá bezpečnou testovací hodnotu `VITE_SITE_URL=https://example.invalid`, aby otestovalo i produkční větev sitemap generátoru.

## 38. Dependency security

CI spouští:

```bash
npm audit --omit=dev --audit-level=high
```

High/critical production vulnerability tedy build zastaví.

Moderate nálezy jsou před produkčním nasazením kontrolované ručně, aby se kvůli nim nedělal nebezpečný automatický breaking upgrade.

Return-path navigace je navíc zatvrzená proti protocol-relative a backslash variantám.

## 39. Environment variables — frontend

Frontend používá:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SITE_URL=
```

`VITE_SITE_URL` se v produkci používá pro canonical URL a sitemap.

Do browser env nikdy nepatří:

- Supabase service-role key,
- R2 secret,
- privátní cloud credentials.

## 40. Environment variables — Edge Functions

Media backend používá server-side:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
R2_PUBLIC_URL
```

Tyto hodnoty jsou dostupné pouze Edge Functions.

## 41. Struktura projektu

```text
src/
├── components/
├── pages/
├── pages/admin/
├── admin/
└── lib/

supabase/
├── migrations/
└── functions/

scripts/
.github/workflows/
docs/
public/
```

Klíčové soubory:

```text
src/main.tsx
src/App.tsx
src/components/Layout.tsx
src/lib/data.ts
src/lib/types.ts
src/lib/supabase.ts
src/lib/clubStatsData.ts
supabase/migrations/20260922083000_club_stats.sql
scripts/generate-static-seo.mjs
.github/workflows/ci.yml
docs/LAUNCH_CHECKLIST.md
```

## 42. Co není kompletně definované v repozitáři

Repo obsahuje frontend, administraci, media Edge Functions a nově přidanou migraci historických statistik.

Není však kompletním dumpem celého původního Supabase projektu.

Původní vytvoření některých existujících sportovních tabulek, například `teams`, `matches`, `players` nebo `standings`, není v tomto repu reprezentované migracemi.

Stejně tak zde není celý externí/automatický FAČR importer.

Pro úplnou reprodukovatelnost backendu od nuly by bylo vhodné do budoucna exportovat kompletní Supabase schema/migrations.

## 43. Produkční checklist

Finální checklist je uložen v:

```text
docs/LAUNCH_CHECKLIST.md
```

Před ostrým spuštěním je potřeba zejména:

1. nastavit produkční doménu a `VITE_SITE_URL`,
2. zajistit HTTPS,
3. nastavit SPA fallback na `index.html`,
4. ověřit production Supabase env,
5. aplikovat potřebné migrace,
6. otestovat Auth a RLS,
7. ověřit R2 secrets, public URL a CORS,
8. udělat produkční upload/delete test médií,
9. zkontrolovat historické řádky s `needs_review`,
10. otestovat mobilní zařízení a hlavní prohlížeče,
11. vyřešit přesměrování starého webu,
12. submitnout sitemap do Google Search Console.

## 44. Finální stav

Projekt NFC Lichnov je z pohledu aplikační architektury kompletní klubová platforma:

```text
React SPA
+
sportovní datový frontend
+
CMS
+
administrace
+
Supabase backend
+
PostgreSQL
+
Auth/RLS
+
historické statistiky
+
Cloudflare R2
+
Supabase Edge Functions
+
SEO
+
accessibility
+
performance optimalizace
+
CI
```

Veřejná část je navržena jako kontinuálně běžící aplikace s persistentní navigací, footerem a hero assetem. Datové stránky používají stabilní loading layout a cache. Administrace umožňuje dlouhodobou správu klubového obsahu bez zásahu do zdrojového kódu.

Zbývající práce je primárně produkční konfigurace, kontrola infrastruktury a finální obsahové QA, nikoliv vývoj hlavní funkcionality.
