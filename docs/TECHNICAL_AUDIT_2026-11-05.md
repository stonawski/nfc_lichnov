# NFC Lichnov — technický audit a stabilizační opravy

**Datum:** 5. 11. 2026  
**Auditovaný základ:** `main` na commitu `eefc28a1`  
**Opravy:** větev `chatgpt/technical-audit-stability`, PR #32  
**Status:** statický audit kódu + automatické testy v GitHub Actions. **Nejde o kompletní produkční E2E audit**; hranice ověření jsou výslovně uvedené níže.

## 1. Rozsah a metoda

- Prohlédnuta struktura repozitáře (113 verzovaných souborů, z toho 67 ve `src/`) a relevantní implementace veřejných stránek, CMS, routingu, Supabase přístupu, media uploadu, RLS migrací, SEO a CI.
- Zkoumány konkrétní závislosti při načítání, chybové stavy, paralelní čtení stejného obsahu, správa médií a autorizace.
- Měřena velikost build artefaktů z **výstupů GitHub Actions CI před a po změnách**. Nejde o měření runtime, sítě uživatelů ani Core Web Vitals.
- Přidány regresní testy bez nových externích balíčků; po opravách spuštěn TypeScript + produkční Vite build v CI.
- Produkční URL z briefu nebyla dostupná z použitého webového nástroje; v této relaci není přístup k autentizovanému CMS, živé Supabase, R2 ani ke vzdálenému prohlížeči s DevTools. **Tyto části se nesmí označit za otestované.**

## 2. Konkrétně prokázané problémy a opravy

| Závažnost | Oblast / příčina | Provedená náprava | Soubory |
| --- | --- | --- | --- |
| Vysoká | Detail zápasu podmínil render celé stránky dokončením dotazů na sestavu **a** časovou osu. | Hero se zobrazí hned po získání zápasu; sestava a průběh mají samostatné skeletony, chybu a retry. | `src/pages/MatchDetailPage.tsx` |
| Vysoká | Homepage pro jeden střídaný snímek načítala kompletní `gallery_images`. | Samostatný dotaz načítá maximálně 72 nejnovějších snímků; titulní fotografie alb zůstávají záložním zdrojem. | `src/lib/data.ts`, `src/pages/HomePage.tsx` |
| Vysoká | `fetchGalleryImages` očekával vše v jedné odpovědi, přestože PostgREST může počet řádků omezovat. | Stabilní seřazení (včetně ID), načítání po 500 záznamech, kontrola chyb a ochrana před neomezeným cyklem. | `src/lib/data.ts`, `src/lib/collectPages.ts` |
| Střední | Funkce pro týmy a sezony se opakovaně volaly souběžně mimo cache TanStack Query. | Deduplicace pouze **současně probíhajících** stejných dotazů; výsledek se po dokončení neuchovává, invalidace CMS zůstává funkční. | `src/lib/data.ts`, `src/lib/shareConcurrentRead.ts` |
| Střední | Selhání požadavků se na vybraných místech tvářilo jako prázdný obsah. | Rozlišení chybového/empty stavu a retry pro homepage, aktuality, galerii a týmy. | `src/pages/HomePage.tsx`, `src/pages/NewsPage.tsx`, `src/pages/GalleryPage.tsx`, `src/pages/TeamPage.tsx` |
| Střední | Nekonečně visící PostgREST request by mohl ponechat skeleton bez konce. | Datový REST transport má deadline 25 s a propaguje externí abort; nepokrývá Auth, Edge Functions ani velké uploady. | `src/lib/requestFetch.ts`, `src/lib/supabase.ts` |
| Střední | Výjimečně odmítnutý Auth promise mohl ponechat `AdminGuard` na spinneru či přihlašovací formulář v busy stavu. | Ošetření `catch`, `finally` a opakování kontroly oprávnění. | `src/admin/AdminGuard.tsx`, `src/pages/admin/AdminLoginPage.tsx` |
| Nízká | Dvojité spuštění nahrávání ještě před React state aktualizací mohlo založit stejný upload dvakrát. | Synchronní `busyRef` guard vedle existujícího UI stavu. | `src/admin/MediaUploader.tsx` |
| Nízká | Selhání spekulativního importu routy mohlo vytvořit neošetřený promise rejection. | `catch` a možnost nového pokusu při další uživatelské interakci. | `src/components/PublicRouteWarmup.tsx` |

**Zachováno:** React 18, React Router 6, TypeScript, Supabase, R2, původní routy, vizuální identita, animace, CMS CRUD kontrakty i stávající databázové schéma. V produkčních datech ani SQL migracích se nic neměnilo.

## 3. Ověřené výsledky CI

Zdroj: GitHub Actions, baseline `main` run [#38621732785](https://github.com/stonawski/nfc_lichnov/actions/runs/38621732785), po úpravě PR run [#42032677778](https://github.com/stonawski/nfc_lichnov/actions/runs/42032677778).

| Metrika sestavení | Před | Po | Interpretace |
| --- | ---: | ---: | --- |
| Hlavní JS chunk (gzip) | 29,80 kB | 30,53 kB | +0,73 kB za novou stabilizační logiku |
| Celkem JS chunks (gzip, součet) | 269,44 kB | 270,26 kB | +0,82 kB; součet všech chunků, **ne** první návštěva |
| CSS (gzip) | 19,28 kB | 19,28 kB | beze změny |
| TypeScript + Vite build | PASS | PASS | statické typy a sestavení |
| Automatické regresní testy | nebyly | **12/12 PASS** | timeout/abort, deduplikace, stránkování |
| CI SEO kontroly | PASS | PASS | vygenerované `robots.txt` / `sitemap.xml` |

**Co nemáme naměřené:** LCP, INP, CLS, FCP a TTFB z reálného browseru, počty skutečných síťových požadavků před/po, CPU/long tasks či mobilní výkon. Tyto hodnoty nelze z velikosti build souborů poctivě dopočítat. Výkonový přínos je u identifikovaných dotazů logický (např. homepage max. 72 foto metadat), nikoli potvrzený RUM/Lighthouse měřením.

## 4. Bezpečnost — zjištění a zbývající ověření

- **Statická kontrola:** CMS používá `AdminGuard` s Auth session + `can_edit_content()`; media Edge Functions před presign/delete provádějí `getUser()` a stejný permission check; `news_media` migrace má RLS. Nejde o důkaz správného *nasazení* těchto pravidel do živého Supabase.
- **Npm audit produkčních závislostí:** ve druhé fázi PR byl React Router upgradován na `react-router-dom@7.18.5` včetně lockfile. Ověřovací CI #246 prošlo TypeScriptem, sestavením a `npm audit --omit=dev` s **0 nálezy**. Přesto nebyla v živém prohlížeči potvrzena funkčnost všech navigačních scénářů; tuto kontrolu zachovej před nasazením. `safeReturnPath` nadále odmítá nebezpečné `from` adresy.
- **R2:** povolené typy médií a deklarovaná maximální velikost jsou kontrolované při vystavování presigned URL. **Bez skutečného testu R2 nemáme potvrzené omezení velikosti nahraného těla PUT**; presigned PutObject sám o sobě nemusí serverově vynucovat předem deklarovaný `fileSize`.
- **Neověřeno:** živá RLS pravidla nad všemi původními tabulkami, role neautorizovaného uživatele, konfigurace CORS, logy Edge Functions, skutečné ukládání a mazání obsahu, session refresh a odhlášení na reálném účtu.
- V rámci auditu nejsou přidávána DB oprávnění, nové SQL migrace, service-role klíče ani přímé změny veřejných dat.

## 5. Zbývající rizika, limity a doporučení

1. **Galerie / rostoucí archiv:** přehled alb stále potřebuje seznam všech fotek kvůli náhledům a lightboxu; nyní je kompletní a stránkovaný, ale pro desetitisíce fotek může být počáteční download stále drahý. Další krok je **samostatná serverová projekce náhledů a agregovaných počtů** + lazy album detail, až bude dostupná testovací databáze.
2. **Historické statistiky:** `fetchPublicClubStats()` při chybě DB používá lokální klubový archiv. Jde o stávající záměrný fallback, který ale může zakrýt výpadek databáze; bez ověření produkční migrace jsme ho **neměnili**, aby nezmizely již používané statistiky.
3. **Souběžné zápasové požadavky:** část homepage stále načítá výsledky a nadcházející zápasy odděleně. Deduplicita týmů a sezon byla zlepšena; další sjednocení sportovních dotazů vyžaduje měření odpovědí a zátěže databáze.
4. **Media upload:** kontrola dvojitého spuštění byla opravena. Skutečný R2 upload 100MB videa, retry po selhání, osiřelé soubory a případné limity CORS musí projít staging testem.
5. **SPA / SEO:** přímé otevření hlubokých rout závisí na Cloudflare fallbacku. Skutečný HTTP refresh a sociální sdílení dynamických článků nejsou statickým build testem pokryty.
6. **Vizuální QA:** mobil 320/375/430 px, tablet, desktop, klávesnice, lightbox, pomalé 3G, offline a reduced motion je nutné ověřit v prohlížeči. Nejsou dostupné screenshoty *po* změnách.
7. **Produkční runtime:** pro ověření požadavků uživatele změřit Lighthouse mobil/desktop a DevTools Performance/Network s throttle (Fast/Slow 3G a CPU x4), také reálné chybové stavy Supabase a React Profiler u největších carouselů.

## 6. Praktický QA plán (dosud **neprovedeno**)

- Anonymní návštěva: `/`, `/tymy`, `/tymy/muzi`, `/zapasy`, jeden známý `/zapasy/:id`, `/aktuality`, známý článek, `/galerie`, jedno album, `/klub/historie`, `/klub/statistiky`, `/kontakt`. Každou routu otevřít napřímo a obnovit.
- V DevTools nastavit Slow 3G, CPU throttling, potom vypnout/zapnout síť; ověřit, že datový timeout po nejvýše 25 s vede k retry, nikoli nekonečnému skeletonu.
- Ověřit rychlou navigaci mezi stránkami, focus/scroll, posuny layoutu, lazy image načítání a správný formát zápasů.
- CMS na **testovacím** účtu: neoprávněný přístup, login/logout, draft, publish, galerie, hráč, realizační tým, historická statistika. Nepoužívat reálné produkční záznamy pro destruktivní test.
- R2 na stagingu: krátké MP4/WebM a WebP, záměrně neplatný typ, upload fail/timeout, mazání pouze objektů daného resource.
- V Supabase SQL Editoru (read-only/staging) zkontrolovat `pg_stat_statements`/EXPLAIN a RLS policy granty pro potřebné tabulky. Rizikové migrace až po záloze.

## 7. Závěr

PR opravuje konkrétní reprodukovatelné problémy v řídicích podmínkách loading/error, objemu stahovaných metadat homepage, stránkování dat, řízení timeoutů a zpracování chyb CMS, bez přepisování designu a architektury. CI prokazuje sestavitelnost a 12 testů, **nikoli garantovanou bezchybnost všech produkčních scénářů**. Merge až po review a kontrolní fázi v prostředí s reálnými daty.

## 8. Doplnění druhé fáze auditu (5. 11. 2026)

**Co se změnilo po první stabilizační fázi:**

- **React Router:** deklarativní React Router DOM byl aktualizován na verzi **7.18.5** bez změny URL schématu. Ověřovací CI #246 úspěšně sestavilo React 18 / Vite aplikaci; produkční audit závislostí vrací **0 zranitelností**. Regresní testy na reálné prohlížení rout zůstávají povinným staging krokem.
- **Veřejné galerie:** navržená databázová funkce `public.public_gallery_summaries()` vrací pouze přesné počty a nejvýše čtyři URL náhledů na publikované album. Celé metadata konkrétního alba se načtou až při jeho otevření. Vzhled multi-image karet, filtry, počet fotek, lightbox a album URL zůstávají zachované. Supabase RLS se nevypíná; funkce je `security invoker`.
- **Kompatibilita migrace:** pokud Supabase funkce zatím neexistuje (PGRST202 / 42883), frontend použije původní plné načítání fotografií. Optimalizační přínos na produkci nastane až **po bezpečném nasazení** `supabase/migrations/20261105130000_public_gallery_summaries.sql` přes Supabase UI. Migration pouze vytváří čtecí SQL funkci a upravuje granty na tuto funkci; nemění obsah tabulek ani indexy.
- **Admin galerie:** počty všech fotografií a zobrazení galerie se načítají po stránkách; výchozí PostgREST limit tak nemůže potichu uříznout přesahy nad 1000 záznamů.
- **CMS:** Auth kontrola přístupu, přihlášení a získání podpisu pro upload nyní mají omezené čekání 20–25 sekund. Velký samotný R2 PUT upload **záměrně nemá tento krátký timeout**, aby nedocházelo k přerušování videí na pomalých sítích.
- **Testy:** první sada 12 automatických testů zůstává zachovaná; přidaná druhá sada pokrývá generický časový limit pro CMS. Celkové počty a výsledky kontroluj z nejnovějšího CI běhu PR #32.

**Syntetická srovnávací data:** výchozí `main` CI (říjen 2026) má součet všech JS chunků **269,44 kB gzip**. Kandidát s galeriemi a React Router v7 z běhu CI #246 měl **276,43 kB gzip**; rozdíl odráží zejména nové závislosti a runtime logiku, nikoli čas načítání na síti. Hlavní chunk v CI #246 činil **30,79 kB gzip**. Pro finální commit se mohou velikosti nepatrně lišit. Lighthouse/Core Web Vitals a reálné DB payloady pořád nebyly změřeny.

**Bezpečnostní poznámky:** presigned R2 PUT ověřuje oprávnění před podpisem a deklarovanou velikost, ale velikost *skutečně odeslaného* těla bez serverového HEAD nebo podepsaného požadavku s garantovanou Content-Length dosud nebyla prokázána jako vynucená. Nenasazuj neotestované změny podpisů; ověř R2 podmínky na stagingu. Úspěšný build nenahrazuje živý login, RLS ani vizuální QA.

**Povinná ruční kontrola před mergem:** přihlášení a odhlášení přes Supabase, galerie více než 1000 fotek, detail alba a lightbox, přímý refresh hluboké URL, další publikace v CMS, video upload a omezení nepovoleného uživatele. Žádná část tohoto ručního kroku zde není označována za provedenou.
