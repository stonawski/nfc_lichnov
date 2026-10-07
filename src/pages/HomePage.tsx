import { useQuery } from "@tanstack/react-query";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowRight, ArrowUpRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { ClubLogo } from "../components/ClubLogo";
import { DataFade } from "../components/DataFade";
import { HeroFieldBackdrop } from "../components/HeroFieldBackdrop";
import { EmptyState, LoadingState } from "../components/LoadingState";
import { HomeMatchBoard } from "../components/HomeMatchBoard";
import { PlayerStripCarousel } from "../components/PlayerStripCarousel";
import { SectionHeading } from "../components/SectionHeading";
import { StandingsTable } from "../components/StandingsTable";
import {
  fetchDisplayPlayersByTeam,
  fetchGalleries,
  fetchHomepageMatchSummaries,
  fetchPublishedNews,
  fetchStandingsByTeam,
  fetchTeams,
  fetchUpcomingMatches,
} from "../lib/data";
import { formatDate } from "../lib/format";
import type { TeamMatchSummary } from "../lib/types";

export function HomePage() {
  const teamsQuery = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
    retry: false,
  });
  const matchesQuery = useQuery({
    queryKey: ["home-match-summaries"],
    queryFn: fetchHomepageMatchSummaries,
    retry: false,
  });
  const newsQuery = useQuery({
    queryKey: ["news", "home"],
    queryFn: () => fetchPublishedNews(4),
    retry: false,
  });
  const upcomingQuery = useQuery({
    queryKey: ["matches", "upcoming"],
    queryFn: fetchUpcomingMatches,
    retry: false,
  });
  const galleriesQuery = useQuery({
    queryKey: ["galleries", "home"],
    queryFn: fetchGalleries,
    retry: false,
  });

  const men = teamsQuery.data?.find((team) => team.slug === "muzi");
  const standingsQuery = useQuery({
    queryKey: ["standings", men?.id],
    queryFn: () => fetchStandingsByTeam(men!.id),
    enabled: Boolean(men?.id),
    retry: false,
  });
  const menPlayersQuery = useQuery({
    queryKey: ["players", men?.id, "home-strip"],
    queryFn: () => fetchDisplayPlayersByTeam(men!),
    enabled: Boolean(men?.id),
    retry: false,
  });

  const news = newsQuery.data ?? [];
  const galleries = galleriesQuery.data ?? [];
  const galleryPreview = galleries.slice(0, 2);
  const upcomingMatches = upcomingQuery.data ?? [];
  const upcomingSummaries: TeamMatchSummary[] = upcomingMatches.flatMap((match) =>
    match.team
      ? [{ team: match.team, match, kind: "upcoming" as const }]
      : [],
  );
  const standings = standingsQuery.data ?? [];
  const lichnovIndex = standings.findIndex((row) =>
    /lichnov/i.test(row.team_name || row.club_name || ""),
  );
  const standingsPreview =
    lichnovIndex >= 0
      ? standings.slice(
          Math.max(0, lichnovIndex - 2),
          Math.min(standings.length, lichnovIndex + 3),
        )
      : standings.slice(0, 5);

  return (
    <main>
      <section className="home-homepage-hero site-hero-frame relative -mt-[84px] overflow-hidden px-4 pb-12 pt-[116px] sm:-mt-[88px] sm:px-5 sm:pb-16 sm:pt-[132px] md:px-8 md:pt-[140px] lg:pb-20">
        <HeroFieldBackdrop />

        <div className="relative mx-auto max-w-[1240px]">
          <div className="home-homepage-hero-intro max-w-[780px] py-5 sm:py-8">
            <h1 className="home-homepage-hero-title text-[clamp(3.25rem,7vw,6.7rem)] font-black leading-[0.86] tracking-[-0.075em]">
              <span className="block text-brand-900">Fotbal v</span>
              <span className="block text-brand-500">Lichnově.</span>
            </h1>

            <p className="home-homepage-hero-copy mt-6 max-w-[620px] text-base leading-7 text-ink-500 sm:text-lg sm:leading-8">
              Poslední výsledky a nejbližší zápasy všech kategorií na jednom místě.
            </p>
          </div>

          <div className="home-homepage-match-area mt-3">
            {matchesQuery.isLoading || upcomingQuery.isLoading ? (
              <LoadingState rows={5} />
            ) : matchesQuery.isError || upcomingQuery.isError ? (
              <EmptyState
                title="Data se nepodařilo načíst"
                text="Zkontroluj Supabase připojení a veřejná RLS oprávnění."
              />
            ) : (
              <DataFade>
                <HomeMatchBoard
                  results={matchesQuery.data ?? []}
                  upcoming={upcomingSummaries}
                />
              </DataFade>
            )}
          </div>

          <div className="home-homepage-hero-footer mt-9">
            <div
              className="h-px w-full bg-gradient-to-r from-brand-900/30 via-brand-900/10 to-transparent"
              aria-hidden="true"
            />

            <div className="home-homepage-hero-actions mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/zapasy"
                  className="inline-flex items-center gap-2 rounded-[16px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(24,53,42,.16)] transition-colors hover:bg-brand-700"
                >
                  Zobrazit zápasy <ArrowRight size={16} />
                </Link>
                <Link
                  to="/tymy"
                  className="inline-flex items-center gap-2 rounded-[16px] bg-white/80 px-5 py-3 text-sm font-semibold text-brand-900 ring-1 ring-sand-200 transition-colors hover:bg-white"
                >
                  Naše týmy
                </Link>
              </div>

              {!teamsQuery.isLoading && (
                <DataFade className="grid min-w-[270px] grid-cols-2 divide-x divide-sand-200">
                  <div className="pr-5">
                    <div className="text-xl font-black tracking-[-0.04em] text-brand-900">
                      {teamsQuery.data?.length ?? 0}
                    </div>
                    <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.13em] text-ink-500">
                      aktivních týmů
                    </div>
                  </div>
                  <div className="pl-5">
                    <div className="text-xl font-black tracking-[-0.04em] text-brand-900">
                      {men?.season || "—"}
                    </div>
                    <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.13em] text-ink-500">
                      aktuální sezóna
                    </div>
                  </div>
                </DataFade>
              )}
            </div>
          </div>
        </div>
      </section>

      

      <section className="relative overflow-hidden bg-sand-100 px-5 py-20 md:px-8 md:py-28">
        <div className="relative mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="Klubový deník"
            title="Aktuálně z Lichnova"
            text="Novinky z hřiště, kabiny i života klubu."
          />

          {newsQuery.isLoading ? (
            <LoadingState rows={3} />
          ) : news.length ? (
            <DataFade className="stagger-children grid gap-7 lg:grid-cols-[1.45fr_.75fr]">
              <Link
                to={`/aktuality/${news[0].slug}`}
                className="group relative min-h-[470px] overflow-hidden rounded-[38px] bg-brand-900 p-7 text-white shadow-soft sm:p-9"
              >
                {news[0].cover_image ? (
                  <img
                    src={news[0].cover_image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-48 transition duration-700 group-hover:scale-[1.025]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(0,146,63,.42),transparent_32%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/45 to-brand-900/5" />

                <div className="relative flex h-full min-h-[405px] flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 backdrop-blur">
                      {news[0].category || "Aktualita"}
                    </span>
                    <ArrowUpRight
                      size={20}
                      className="text-white/55 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-white/55">
                      {formatDate(news[0].published_at)}
                    </div>
                    <h3 className="mt-3 max-w-2xl text-3xl font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
                      {news[0].title}
                    </h3>
                    {news[0].excerpt && (
                      <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
                        {news[0].excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </Link>

              <div>
                {news.slice(1, 4).map((article) => (
                  <Link
                    key={article.id}
                    to={`/aktuality/${article.slug}`}
                    className="group grid grid-cols-[1fr_auto] gap-5 border-b border-brand-900/10 py-6 first:pt-5"
                  >
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-500">
                        {article.category || "Aktualita"}
                      </div>
                      <h3 className="mt-2 text-xl font-extrabold leading-tight tracking-[-0.035em] text-brand-900 transition group-hover:text-brand-700">
                        {article.title}
                      </h3>
                      <p className="mt-3 text-xs text-ink-500">
                        {formatDate(article.published_at)}
                      </p>
                    </div>

                    <div className="grid h-10 w-10 place-items-center self-center rounded-2xl bg-white/70 text-brand-900 ring-1 ring-white transition group-hover:bg-brand-500 group-hover:text-white">
                      <ArrowUpRight size={17} />
                    </div>
                  </Link>
                ))}

              </div>
            </DataFade>
          ) : (
            <DataFade>
              <EmptyState
              title="Aktuality zatím nejsou publikované"
              text="Jakmile v administraci zveřejníš první článek, objeví se automaticky tady."
              />
            </DataFade>
          )}
        </div>
      </section>

      {teamsQuery.isLoading || (men && menPlayersQuery.isLoading) ? (
        <section className="min-h-[360px] bg-white px-5 py-10 md:px-8">
          <div className="mx-auto max-w-[1240px]">
            <LoadingState rows={3} />
          </div>
        </section>
      ) : men && menPlayersQuery.data?.length ? (
        <DataFade>
          <PlayerStripCarousel
            team={men}
            players={menPlayersQuery.data}
            flush
          />
        </DataFade>
      ) : null}

      <section className="bg-sand-100 px-5 pb-16 pt-14 md:px-8 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-[1240px] overflow-hidden rounded-[42px] bg-brand-900 px-6 py-9 text-white sm:px-8 md:px-10 md:py-12">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                A tým
              </div>
              <h2 className="mt-4 text-4xl font-extrabold leading-[.98] tracking-[-0.055em] md:text-5xl">
                Tabulka bez hledání.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/60 sm:text-base">
                Aktuální pozice mužů na první pohled. NFC Lichnov zvýrazňujeme,
                aby ses v tabulce zorientoval během vteřiny.
              </p>
              <Link
                to="/tymy/muzi"
                className="mt-7 inline-flex items-center gap-2 rounded-[15px] bg-white px-4 py-2.5 text-sm font-bold text-brand-900 transition hover:-translate-y-0.5"
              >
                Detail A týmu <ArrowRight size={15} />
              </Link>
            </div>

            <div className="rounded-[30px] bg-[#fbfaf6] p-2 text-ink-900 sm:p-3">
              {standingsQuery.isLoading ? (
                <LoadingState rows={5} />
              ) : standingsPreview.length ? (
                <DataFade>
                  <StandingsTable rows={standingsPreview} compact />
                </DataFade>
              ) : (
                <EmptyState
                  title="Tabulka není dostupná"
                  text="Pokud soutěž poskytuje tabulku, zobrazí se zde po synchronizaci."
                />
              )}
            </div>
          </div>
        </div>
      </section>

      

      
      <FanshopShowcase />

<section className="border-y border-sand-200/70 bg-sand-100 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px] overflow-hidden rounded-[42px] bg-brand-900 p-7 text-white sm:p-10 md:p-14">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                Život klubu
              </div>
              <h2 className="mt-4 max-w-xl text-4xl font-extrabold leading-[.98] tracking-[-0.055em] md:text-6xl">
                Fotbal nejsou jen výsledky.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-6 text-white/65 sm:text-base">
                Zápasy, turnaje, tréninky, mládež i chvíle mimo hřiště. Poslední
                galerie ukazují klub tak, jak skutečně žije.
              </p>

              <Link
                to="/galerie"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-brand-900 transition hover:-translate-y-0.5"
              >
                Všechny galerie <ArrowRight size={16} />
              </Link>
            </div>

            {galleriesQuery.isLoading ? (
              <div className="rounded-[30px] bg-white/[0.06] p-3">
                <LoadingState rows={2} />
              </div>
            ) : galleryPreview.length ? (
              <DataFade className="grid grid-cols-2 gap-3">
                {galleryPreview.map((gallery, index) => (
                  <Link
                    key={gallery.id}
                    to={`/galerie/${gallery.slug || gallery.id}`}
                    className={`group relative aspect-[4/3] overflow-hidden rounded-[28px] border border-white/10 bg-[#10291f] ${
                      index === 1 ? "mt-8" : ""
                    }`}
                  >
                    <img
                      src={gallery.cover_image || "/hero-lichnov-field.webp"}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/18 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50">
                        {formatDate(gallery.event_date || gallery.created_at)}
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm font-extrabold leading-tight text-white sm:text-base">
                        {gallery.title}
                      </div>
                    </div>
                  </Link>
                ))}
              </DataFade>
            ) : (
              <DataFade className="overflow-hidden rounded-[30px] border border-white/10">
                <img
                  src="/hero-lichnov-field.webp"
                  alt=""
                  aria-hidden="true"
                  className="aspect-[16/8] h-full w-full object-cover opacity-70"
                />
              </DataFade>
            )}
          </div>
        </div>
      </section>

      


      <section className="bg-white px-5 pb-14 pt-20 md:px-8 md:pb-16 md:pt-24">
        <div className="mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="NFC Lichnov"
            title="Klub je víc než sestava."
          />

          <div className="grid overflow-hidden rounded-[28px] border border-sand-200 bg-[#fbfaf6] sm:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-sand-200">
            {[
              ["O klubu", "/klub"],
              ["Historie", "/klub/historie"],
              ["Statistiky", "/klub/statistiky"],
              ["Sportovní areál", "/klub/areal"],
              ["Kontakt", "/kontakt"],
            ].map(([label, to]) => (
              <Link
                key={label}
                to={to}
                className="group flex items-center justify-between border-b border-sand-200 px-5 py-6 text-2xl font-extrabold tracking-[-0.04em] text-brand-900 transition hover:bg-white last:border-b-0 md:px-6 md:py-9 lg:border-b-0"
              >
                {label}
                <ArrowUpRight
                  size={20}
                  className="text-ink-500 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-500"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}


const FANSHOP_PRODUCTS = [
  {
    id: 4355,
    title: "Tepláková mikina",
    price: "780 Kč",
    image: "https://cdn.kastomi.com/files/4355-preview.png",
    href: "https://nfclichnov.kastomi.com/4355-teplakova-souprava-mikina",
  },
  {
    id: 4356,
    title: "Tréninkové kalhoty",
    price: "650 Kč",
    image: "https://cdn.kastomi.com/files/4356-preview.png",
    href: "https://nfclichnov.kastomi.com/4356-teplakova-souprava-teplaky",
  },
  {
    id: 3974,
    title: "Větrovka NFC Lichnov",
    price: "579 Kč",
    image: "https://cdn.kastomi.com/files/3974-preview.png",
    href: "https://nfclichnov.kastomi.com/3974-vetrovka-nfc-lichnov",
  },
  {
    id: 3985,
    title: "Polotričko s proužky",
    price: "464 Kč",
    image: "https://cdn.kastomi.com/files/3985-preview.png",
    href: "https://nfclichnov.kastomi.com/3985-polotricko-s-prouzky",
  },
  {
    id: 3912,
    title: "Tričko s malým logem",
    price: "294 Kč",
    image: "https://cdn.kastomi.com/files/3912-preview.png",
    href: "https://nfclichnov.kastomi.com/3912-tricko-s-malym-logem",
  },
  {
    id: 3979,
    title: "Rolovací batoh NFC Lichnov",
    price: "304 Kč",
    image: "https://cdn.kastomi.com/files/3979-preview.png",
    href: "https://nfclichnov.kastomi.com/3979-rolovaci-batoh-nfc-lichnov",
  },
  {
    id: 3894,
    title: "Pletená zimní šála",
    price: "295 Kč",
    image: "https://cdn.kastomi.com/files/3894-preview.png",
    href: "https://nfclichnov.kastomi.com/3894-pletena-zimni-sala",
  },
] as const;

function FanshopShowcase() {
  const railRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const rail = railRef.current;
    if (!rail) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: rail.scrollLeft,
      moved: false,
    };
    rail.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || event.pointerType !== "mouse") return;
    const rail = railRef.current;
    if (!rail) return;

    const delta = event.clientX - dragRef.current.startX;
    if (Math.abs(delta) > 5) dragRef.current.moved = true;
    rail.scrollLeft = dragRef.current.scrollLeft - delta;
  };

  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    dragRef.current.active = false;

    const rail = railRef.current;
    if (rail?.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className="relative overflow-hidden border-y border-brand-900/[0.07] bg-white py-12 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-[0.085] grayscale"
        />
        <div className="absolute inset-0 bg-white/[0.82]" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,.38)_0%,rgba(251,250,246,.18)_58%,rgba(244,248,243,.34)_100%)]" />
        <div className="absolute left-[7%] top-0 whitespace-nowrap text-[clamp(6rem,17vw,16rem)] font-black leading-[.78] tracking-[-0.09em] text-brand-500/[0.085]">
          FANSHOP
        </div>
      </div>

      <div className="relative">
        <div className="mx-auto max-w-[1480px] px-5 md:px-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-[650px]">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
                <ShoppingBag size={15} />
                Klubový e-shop
              </div>
              <h2 className="mt-3 text-[clamp(2.6rem,5vw,4.9rem)] font-black leading-[.9] tracking-[-0.065em] text-brand-900">
                NFC nosíme i mimo hřiště.
              </h2>
            </div>

            <a
              href="https://nfclichnov.kastomi.com/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 text-sm font-bold text-brand-900 transition-colors hover:text-brand-500 lg:inline-flex"
            >
              Celý fanshop <ArrowUpRight size={15} />
            </a>
          </div>
        </div>

        <div
          ref={railRef}
          className="mt-8 cursor-grab select-none overflow-x-auto overscroll-x-contain pb-3 active:cursor-grabbing [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={stopDrag}
          onPointerCancel={() => {
            dragRef.current.active = false;
          }}
          onClickCapture={(event) => {
            if (!dragRef.current.moved) return;
            event.preventDefault();
            event.stopPropagation();
            dragRef.current.moved = false;
          }}
          onDragStart={(event) => event.preventDefault()}
        >
          <div className="flex w-max items-stretch gap-3 pl-5 pr-5 md:gap-4 md:pl-8 md:pr-8 xl:pl-[max(2rem,calc((100vw-1480px)/2+2rem))]">
            <div className="flex w-[255px] shrink-0 flex-col justify-between py-3 pr-4 sm:w-[280px] sm:pr-6 lg:w-[300px]">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.17em] text-brand-500">
                  Fanoušci NFC
                </div>
                <p className="mt-4 text-xl font-extrabold leading-7 tracking-[-0.035em] text-brand-900 sm:text-2xl sm:leading-8">
                  Klubové oblečení a doplňky pro hřiště i každý den.
                </p>
                <p className="mt-4 max-w-[260px] text-sm leading-6 text-ink-500">
                  Vybrané produkty z aktuální nabídky Kastomi. Táhni do strany a projdi další kousky.
                </p>
              </div>

              <a
                href="https://nfclichnov.kastomi.com/"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-[14px] bg-brand-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-700"
              >
                Navštívit fanshop <ArrowRight size={14} />
              </a>
            </div>

            {FANSHOP_PRODUCTS.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}

         </div>
        </div>
      </div>
    </section>
  );
}

function ShopProductCard({
  product,
}: {
  product: (typeof FANSHOP_PRODUCTS)[number];
}) {
  return (
    <a
      href={product.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Otevřít ${product.title} v e-shopu`}
      className="group relative h-[455px] w-[300px] shrink-0 overflow-hidden rounded-[26px] border border-brand-900/[0.07] bg-[#f5f4ef] shadow-[0_16px_44px_rgba(24,53,42,.055)] sm:h-[490px] sm:w-[330px]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8f7f2_0%,#f1f0e9_100%)]" />

      <div className="absolute left-5 right-5 top-5 h-[72%] rounded-[18px] bg-white/55 sm:left-6 sm:right-6 sm:top-6" />

      <img
        src={product.image}
        alt={product.title}
        loading="lazy"
        draggable={false}
        referrerPolicy="no-referrer"
        className="absolute left-5 right-5 top-5 h-[72%] object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.018] sm:left-6 sm:right-6 sm:top-6"
        onError={(event) => {
          const image = event.currentTarget;
          image.style.display = "none";
        }}
      />

      <div className="absolute left-4 top-4 rounded-full border border-brand-900/[0.08] bg-white/90 px-3 py-1.5 text-[10px] font-black text-brand-900 shadow-sm backdrop-blur">
        {product.price}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900 via-brand-900/95 to-brand-900/0 px-5 pb-5 pt-24 text-white sm:px-6 sm:pb-6">
        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-brand-500">
          NFC Lichnov
        </div>

        <div className="mt-2 flex items-end justify-between gap-5">
          <div className="max-w-[235px] text-xl font-black leading-[1.02] tracking-[-0.04em] sm:text-2xl">
            {product.title}
          </div>

          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors group-hover:bg-white/[0.18]">
            <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </a>
  );
}

