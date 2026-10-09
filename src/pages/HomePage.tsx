import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowRight, ArrowUpRight, Images, ShoppingBag } from "lucide-react";
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
  fetchGalleryImages,
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
  const galleryImagesQuery = useQuery({
    queryKey: ["gallery-images", "home-random"],
    queryFn: () => fetchGalleryImages(),
    enabled: galleriesQuery.isSuccess,
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
  const galleryPreview = useMemo(() => {
    const publishedById = new Map(
      (galleriesQuery.data ?? []).map((gallery) => [gallery.id, gallery]),
    );
    const pool = (galleryImagesQuery.data ?? [])
      .map((image) => {
        const gallery = publishedById.get(image.gallery_id);
        return gallery ? { gallery, image } : null;
      })
      .filter(
        (
          item,
        ): item is {
          gallery: NonNullable<typeof galleriesQuery.data>[number];
          image: NonNullable<typeof galleryImagesQuery.data>[number];
        } => Boolean(item),
      );

    if (!pool.length) {
      return (galleriesQuery.data ?? [])
        .filter((gallery) => gallery.cover_image)
        .slice(0, 2)
        .map((gallery) => ({
          gallery,
          image: {
            id: `cover-${gallery.id}`,
            gallery_id: gallery.id,
            image_url: gallery.cover_image!,
            caption: null,
            sort_order: 0,
            created_at: gallery.created_at,
            updated_at: gallery.updated_at,
          },
        }));
    }

    const shuffled = [...pool];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [
        shuffled[swapIndex],
        shuffled[index],
      ];
    }

    const selected = [];
    const usedAlbums = new Set<string>();

    for (const item of shuffled) {
      if (selected.length >= 2) break;
      if (!usedAlbums.has(item.gallery.id)) {
        selected.push(item);
        usedAlbums.add(item.gallery.id);
      }
    }

    if (selected.length < 2) {
      for (const item of shuffled) {
        if (selected.length >= 2) break;
        if (!selected.some((entry) => entry.image.id === item.image.id)) {
          selected.push(item);
        }
      }
    }

    return selected;
  }, [galleriesQuery.data, galleryImagesQuery.data]);
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

      <section className="relative overflow-hidden bg-sand-100 px-5 py-16 md:px-8 md:py-24">
        <div className="relative mx-auto max-w-[1180px]">
          <div className="mb-6 flex items-end justify-between gap-5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">
                Fotogalerie
              </div>
              <div className="mt-2 text-sm font-semibold text-brand-900/55">
                {galleries.length
                  ? `${galleries.length} ${galleries.length === 1 ? "album" : galleries.length < 5 ? "alba" : "alb"} v klubovém archivu`
                  : "Momentky ze života NFC Lichnov"}
              </div>
            </div>

            <div className="hidden text-right sm:block">
              <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-500">
                Klub
              </div>
              <div className="mt-1 text-sm font-extrabold text-brand-900">
                NFC Lichnov
              </div>
            </div>
          </div>

          <div className="relative min-h-[610px] lg:min-h-[650px]">
            <div className="absolute inset-y-0 right-0 w-full overflow-hidden rounded-[42px] bg-brand-900 shadow-[0_24px_70px_rgba(24,53,42,.12)] lg:w-[84%]">
              {galleriesQuery.isLoading || galleryImagesQuery.isLoading ? (
                <div className="absolute inset-0 p-6">
                  <LoadingState rows={3} />
                </div>
              ) : (
                <img
                  src={galleryPreview[0]?.image.image_url || "/hero-lichnov-field.webp"}
                  alt={
                    galleryPreview[0]
                      ? galleryPreview[0].image.caption ||
                        galleryPreview[0].gallery.title
                      : ""
                  }
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  style={{
                    filter: "saturate(.94) contrast(.97) brightness(.96)",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,53,42,.52)_0%,rgba(24,53,42,.16)_28%,rgba(24,53,42,0)_58%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,53,42,0)_48%,rgba(24,53,42,.18)_72%,rgba(24,53,42,.46)_100%)]" />
            </div>

            <div className="relative z-20 flex min-h-[610px] items-end pb-7 pt-56 lg:min-h-[650px] lg:items-center lg:pb-0 lg:pt-0">
              <div className="w-full rounded-[34px] border border-white/10 bg-brand-900 p-7 text-white shadow-[0_24px_70px_rgba(24,53,42,.22)] sm:p-9 lg:w-[430px] lg:p-10">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
                    <Images size={18} />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">
                    Klub očima fotografií
                  </div>
                </div>

                <h2 className="mt-7 text-4xl font-black leading-[.92] tracking-[-0.06em] sm:text-5xl">
                  Život klubu
                  <span className="block text-white/48">v obrazech.</span>
                </h2>

                <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
                  Zápasy, turnaje, tréninky, mládež i chvíle mimo hřiště. Při každém načtení vybíráme moment napříč klubovými alby.
                </p>

                {galleryPreview[0]?.gallery && (
                  <div className="mt-7 border-t border-white/12 pt-5">
                    <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
                      Vybraný moment
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm font-extrabold leading-5 text-white/82">
                      {galleryPreview[0].gallery.title}
                    </div>
                  </div>
                )}

                <Link
                  to="/galerie"
                  className="group mt-8 inline-flex min-h-12 items-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-brand-900 transition hover:bg-brand-50"
                >
                  Otevřít fotogalerii
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
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
    id: 4084,
    title: "Tréninkové šortky",
    price: "335 Kč",
    image: "https://cdn.kastomi.com/files/4084-Black-PREVIEW.png",
    href: "https://nfclichnov.kastomi.com/4084-treninkove-sortky",
  },
  {
    id: 3903,
    title: "Sportovní taška",
    price: "629 Kč",
    image: "https://cdn.kastomi.com/files/3903-Blue-kastomizace.png",
    href: "https://nfclichnov.kastomi.com/3903-sportovni-taska",
  },
  {
    id: 3898,
    title: "Hrnek s logem",
    price: "209 Kč",
    image: "https://cdn.kastomi.com/files/3898-White.png",
    href: "https://nfclichnov.kastomi.com/3898-hrnek-s-logem-a-personalizaci",
  },
  {
    id: 3985,
    title: "Polotričko s proužky",
    price: "464 Kč",
    image: "/shop/nfc-polo.jpg",
    href: "https://nfclichnov.kastomi.com/3985-polotricko-s-prouzky",
  },
  {
    id: 3894,
    title: "Pletená zimní šála",
    price: "295 Kč",
    image: "/shop/nfc-scarf.jpg",
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
    <section className="relative overflow-hidden border-y border-brand-900/[0.07] bg-white py-24 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-[0.30] grayscale"
        />
        <div className="absolute inset-0 bg-white/[0.52]" />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,.42)_0%,rgba(255,255,255,.20)_48%,rgba(245,249,246,.30)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-[1480px] px-5 md:px-8">
        <div className="pointer-events-none absolute -left-8 top-[-112px] whitespace-nowrap text-[clamp(9rem,20vw,20rem)] font-black leading-[0.8] tracking-[-0.1em] text-brand-500/[0.14]">
          FANSHOP
        </div>

        <div className="relative grid gap-9 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[330px_minmax(0,1fr)] xl:gap-10">
          <div className="flex min-h-[570px] flex-col justify-between py-2 lg:min-h-[560px]">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
                <ShoppingBag size={15} />
                Klubový e-shop
              </div>

              <h2 className="mt-4 max-w-[360px] text-[clamp(2.8rem,4.2vw,4.8rem)] font-black leading-[.9] tracking-[-0.065em] text-brand-900">
                NFC nosíme i mimo hřiště.
              </h2>

              <div className="mt-10 max-w-[280px]">
                <div className="text-[9px] font-black uppercase tracking-[0.17em] text-brand-500">
                  Fanoušci NFC
                </div>
                <p className="mt-3 text-xl font-extrabold leading-7 tracking-[-0.035em] text-brand-900">
                  Klubové oblečení a doplňky pro hřiště i každý den.
                </p>
                <p className="mt-4 text-sm leading-6 text-ink-500">
                  Vybrané produkty z aktuální nabídky Kastomi.
                </p>
              </div>
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

          <div className="min-w-0" style={{ width: "calc(100% + max(2rem, calc((100vw - 1480px) / 2 + 2rem)))" }}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-500">
                Vybrané produkty
              </div>

              <a
                href="https://nfclichnov.kastomi.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-900 transition-colors hover:text-brand-500"
              >
                Celý fanshop <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="overflow-hidden">
              <div
                ref={railRef}
                className="cursor-grab select-none overflow-x-auto overscroll-x-contain pb-2 active:cursor-grabbing [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
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
                <div className="flex w-max gap-4 pr-1">
                  {FANSHOP_PRODUCTS.map((product) => (
                    <ShopProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 text-[10px] font-semibold text-ink-500/70">
              Táhni myší nebo swipni pro další produkty.
            </div>
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
      className="group flex h-[480px] w-[280px] shrink-0 flex-col overflow-hidden rounded-[26px] border border-brand-900/[0.075] bg-white shadow-[0_18px_48px_rgba(24,53,42,.06)] transition-shadow hover:shadow-[0_24px_58px_rgba(24,53,42,.10)] sm:h-[510px] sm:w-[310px] xl:w-[325px]"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-white px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
        <div className="absolute left-4 top-4 z-10 rounded-full border border-brand-900/[0.08] bg-[#fbfaf6] px-3 py-1.5 text-[10px] font-black text-brand-900 shadow-[0_4px_14px_rgba(24,53,42,.04)]">
          {product.price}
        </div>

        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          draggable={false}
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.018]"
          onError={(event) => {
            const image = event.currentTarget;
            image.style.display = "none";
          }}
        />
      </div>

      <div className="relative shrink-0 border-t border-brand-900/[0.07] bg-white px-5 py-5 sm:px-6 sm:py-6">
        <div className="mb-2 h-0.5 w-8 rounded-full bg-brand-500" />

        <div className="flex items-end justify-between gap-5">
          <div>
            <div className="text-[8px] font-black uppercase tracking-[0.16em] text-brand-500">
              NFC Lichnov
            </div>
            <div className="mt-2 max-w-[235px] text-xl font-black leading-[1.03] tracking-[-0.04em] text-brand-900 sm:text-2xl">
              {product.title}
            </div>
          </div>

          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-900/[0.08] bg-brand-50 text-brand-900 transition-colors group-hover:border-brand-500/20 group-hover:bg-brand-900 group-hover:text-white">
            <ArrowUpRight size={15} />
          </span>
        </div>
      </div>
    </a>
  );
}

