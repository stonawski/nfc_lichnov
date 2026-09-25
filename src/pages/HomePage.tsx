import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { ClubLogo } from "../components/ClubLogo";
import { DataFade } from "../components/DataFade";
import { HeroFieldBackdrop } from "../components/HeroFieldBackdrop";
import { EmptyState, LoadingState } from "../components/LoadingState";
import { MatchCarousel } from "../components/MatchCarousel";
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
import { formatDate, formatMatchDate, matchVenueMapUrl } from "../lib/format";
import type { Match, Team } from "../lib/types";

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
  const featuredUpcoming =
    upcomingMatches.find((match) => match.team?.slug === "muzi") ??
    upcomingMatches[0];
  const dorostUpcoming = upcomingMatches.find(
    (match) => match.team?.slug === "dorost",
  );
  const lowerUpcoming = upcomingMatches
    .filter(
      (match) =>
        match.id !== featuredUpcoming?.id && match.id !== dorostUpcoming?.id,
    )
    .slice(0, 3);
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
      <section className="site-hero-frame relative -mt-[84px] overflow-hidden px-4 pb-10 pt-[116px] sm:-mt-[88px] sm:px-5 sm:pb-14 sm:pt-[132px] md:px-8 md:pt-[140px] lg:pb-20">
        <HeroFieldBackdrop />

        <div className="relative mx-auto max-w-[1240px]">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-12">
            <div className="py-6 sm:py-10 lg:py-14">
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/15 bg-white/65 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  NFC Lichnov
                </span>
                <span className="rounded-full border border-sand-200 bg-sand-100/70 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-500 backdrop-blur">
                  fotbal napříč generacemi
                </span>
              </div>

              <h1 className="max-w-[760px] text-[clamp(3.25rem,7vw,6.85rem)] font-black leading-[0.86] tracking-[-0.075em] text-brand-900">
                Fotbal v Lichnově.
                <span className="mt-2 block text-brand-500">
                  Výsledky. Program. Aktuality.
                </span>
              </h1>

              <p className="mt-7 max-w-[590px] text-base leading-7 text-ink-500 sm:text-lg sm:leading-8">
                To nejdůležitější z klubu hned na první pohled — poslední výsledky,
                nejbližší zápasy a aktuální dění v NFC Lichnov.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/zapasy"
                  className="inline-flex items-center gap-2 rounded-[16px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(24,53,42,.16)] transition hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  Zobrazit zápasy <ArrowRight size={16} />
                </Link>
                <Link
                  to="/tymy"
                  className="inline-flex items-center gap-2 rounded-[16px] bg-white/80 px-5 py-3 text-sm font-semibold text-brand-900 ring-1 ring-sand-200 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  Naše týmy
                </Link>
              </div>

              {!teamsQuery.isLoading && (
                <DataFade className="mt-10 grid max-w-[430px] grid-cols-2 border-t border-sand-200 pt-5">
                  <HeroStat
                    value={String(teamsQuery.data?.length ?? 0)}
                    label="aktivních týmů"
                  />
                  <HeroStat
                    value={men?.season || "—"}
                    label="aktuální sezóna"
                  />
                </DataFade>
              )}
            </div>

            <div className="relative lg:pl-4">
              <div className="mb-4 flex items-end justify-between gap-4 px-1">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
                    Zápasy
                  </div>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.045em] text-brand-900">
                    Výsledky napříč kategoriemi
                  </h2>
                </div>
                <div className="hidden text-right text-[11px] leading-5 text-ink-500 sm:block">
                  Přepínej mezi týmy
                  <br />
                  nebo přejeď prstem
                </div>
              </div>

              {matchesQuery.isLoading ? (
                <LoadingState rows={3} />
              ) : matchesQuery.isError ? (
                <EmptyState
                  title="Data se nepodařilo načíst"
                  text="Zkontroluj Supabase připojení a veřejná RLS oprávnění."
                />
              ) : (
                <DataFade>
                  <MatchCarousel items={matchesQuery.data ?? []} />
                </DataFade>
              )}
            </div>
          </div>

          {upcomingQuery.isLoading ? (
            <div className="mt-3 h-[112px] rounded-[22px] border border-sand-200 bg-white/45 backdrop-blur sm:mt-5" />
          ) : upcomingMatches.length ? (
            <DataFade>
              <UpcomingRail matches={upcomingMatches.slice(0, 3)} />
            </DataFade>
          ) : null}
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="Program"
            title="Co nás čeká"
            text="Jeden nejbližší zápas z každé kategorie."
            to="/zapasy"
            linkLabel="Celý program"
          />

          {upcomingQuery.isLoading ? (
            <LoadingState rows={3} />
          ) : featuredUpcoming ? (
            <DataFade className="stagger-children grid gap-4 lg:grid-cols-12">
              <UpcomingMatchTile
                match={featuredUpcoming}
                featured
                large
                className="min-h-[290px] lg:col-span-7"
              />

              {dorostUpcoming && (
                <UpcomingMatchTile
                  match={dorostUpcoming}
                  large
                  className="min-h-[290px] lg:col-span-5"
                />
              )}

              {lowerUpcoming.map((match) => (
                <UpcomingMatchTile
                  key={match.id}
                  match={match}
                  className={
                    lowerUpcoming.length >= 3
                      ? "min-h-[185px] lg:col-span-4"
                      : lowerUpcoming.length === 2
                        ? "min-h-[185px] lg:col-span-6"
                        : "min-h-[185px] lg:col-span-12"
                  }
                />
              ))}
            </DataFade>
          ) : (
            <DataFade>
              <EmptyState
              title="Nejbližší zápasy zatím nejsou k dispozici"
              text="Sekce se naplní automaticky z tabulky matches."
              />
            </DataFade>
          )}
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

      <section className="bg-white px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="overflow-hidden rounded-[38px] border border-sand-200 bg-sand-100 p-7 sm:p-9 md:p-11">
            <div className="grid gap-9 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
                  <ShoppingBag size={15} />
                  Klubový e-shop
                </div>
                <h2 className="mt-4 max-w-xl text-4xl font-extrabold leading-[.98] tracking-[-0.055em] text-brand-900 md:text-5xl">
                  NFC i mimo hřiště.
                </h2>
                <p className="mt-5 max-w-lg text-sm leading-7 text-ink-500 sm:text-base">
                  Klubové oblečení, vybavení pro volný čas a doplňky v barvách NFC.
                  Aktuální nabídku a dostupné velikosti najdeš v oficiálním e-shopu.
                </p>
                <a
                  href="https://nfclichnov.kastomi.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex items-center gap-2 rounded-[16px] bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  Otevřít e-shop <ArrowUpRight size={16} />
                </a>
              </div>

              <div>
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
                  Co v e-shopu najdeš
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["Klubové oblečení", "NFC na zápas i mimo něj."],
                    ["Trénink a volný čas", "Věci pro hráče i fanoušky."],
                    ["Klubové doplňky", "Aktuální nabídka na Kastomi."],
                  ].map(([title, text]) => (
                    <a
                      key={title}
                      href="https://nfclichnov.kastomi.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="group rounded-[24px] border border-white bg-white/75 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-soft"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-base font-extrabold tracking-[-0.035em] text-brand-900">
                          {title}
                        </div>
                        <ArrowUpRight
                          size={16}
                          className="shrink-0 text-ink-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-500"
                        />
                      </div>
                      <p className="mt-3 text-xs leading-5 text-ink-500">{text}</p>
                    </a>
                  ))}
                </div>
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

function UpcomingMatchTile({
  match,
  featured = false,
  large = false,
  className = "",
}: {
  match: Match & { team?: Team };
  featured?: boolean;
  large?: boolean;
  className?: string;
}) {
  const teamName = match.team?.name || "NFC Lichnov";
  const to = `/tymy/${match.team?.slug ?? ""}`;
  const venueLabel = match.pitch_name || `Hřiště — ${match.home_team_name}`;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[30px] border transition duration-300 hover:-translate-y-1 hover:shadow-soft ${
        featured
          ? "border-brand-900 bg-brand-900 text-white"
          : "border-sand-200 bg-white text-ink-900"
      } ${className}`}
    >
      {featured && (
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.08]"
        />
      )}

      <Link
        to={to}
        className={`relative flex flex-1 flex-col ${
          featured ? "p-7 pb-5 sm:p-8 sm:pb-5" : large ? "p-6 pb-4 sm:p-7 sm:pb-4" : "p-5 pb-4"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              className={`text-[10px] font-bold uppercase tracking-[0.17em] ${featured ? "text-white/45" : "text-brand-500"}`}
            >
              {teamName}
            </div>
            <div
              className={`mt-1 text-xs font-semibold ${featured ? "text-white/60" : "text-ink-500"}`}
            >
              {formatMatchDate(match.playing_at)}
            </div>
          </div>
          <ArrowUpRight
            size={featured ? 20 : 16}
            className={`shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${featured ? "text-white/55 group-hover:text-white" : "text-ink-500 group-hover:text-brand-500"}`}
          />
        </div>

        <div
          className={`my-auto grid grid-cols-[1fr_auto_1fr] items-center ${featured ? "gap-6" : large ? "gap-5" : "gap-3"}`}
        >
          <MatchClub
            name={match.home_team_name}
            logo={match.home_team_logo}
            featured={featured}
            large={large}
            align="right"
          />

          <div
            className={`rounded-full font-black uppercase tracking-[0.12em] ${
              featured
                ? "bg-white/[0.08] px-3 py-2 text-[11px] text-white/60 ring-1 ring-white/10"
                : "bg-sand-100 px-2.5 py-1.5 text-[9px] text-ink-500"
            }`}
          >
            vs
          </div>

          <MatchClub
            name={match.away_team_name}
            logo={match.away_team_logo}
            featured={featured}
            large={large}
            align="left"
          />
        </div>
      </Link>

      <div
        className={`relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t px-5 py-3 text-xs ${
          featured
            ? "border-white/10 text-white/55"
            : "border-sand-200 text-ink-500"
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={14} />
          {formatMatchDate(match.playing_at)}
        </span>
        <a
          href={matchVenueMapUrl(match)}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center gap-1.5 font-bold transition ${
            featured
              ? "text-white/65 hover:text-white"
              : "text-brand-700 hover:text-brand-500"
          }`}
          title={`Otevřít hřiště domácího týmu ${match.home_team_name} v Google Maps`}
        >
          <MapPin size={14} />
          <span className="max-w-[220px] truncate">{venueLabel}</span>
        </a>
      </div>
    </article>
  );
}

function MatchClub({
  name,
  logo,
  featured,
  large,
  align,
}: {
  name: string;
  logo: string | null;
  featured: boolean;
  large: boolean;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      <ClubLogo
        src={logo}
        name={name}
        size={featured ? "lg" : large ? "md" : "sm"}
      />
      <div
        className={`line-clamp-2 font-extrabold leading-[1.05] tracking-[-0.03em] ${featured ? "text-xl sm:text-2xl" : large ? "text-base sm:text-lg" : "text-sm"}`}
      >
        {name}
      </div>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-r border-sand-200 px-3 first:pl-0 last:border-r-0 sm:px-5">
      <div className="truncate text-base font-black tracking-[-0.04em] text-brand-900 sm:text-xl">
        {value}
      </div>
      <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.13em] text-ink-500 sm:text-[10px]">
        {label}
      </div>
    </div>
  );
}

function UpcomingRail({
  matches,
}: {
  matches: Array<Match & { team?: Team }>;
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-[22px] border border-sand-200 bg-white/60 backdrop-blur sm:mt-5">
      <div className="flex items-center justify-between gap-4 border-b border-sand-200/80 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-brand-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-900">
            Co nás čeká
          </span>
        </div>
        <Link
          to="/zapasy"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-500 transition hover:text-brand-500"
        >
          Celý program <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid divide-y divide-sand-200/70 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {matches.map((match) => (
          <Link
            key={match.id}
            to={`/zapasy/${match.id}`}
            className="group flex min-w-0 items-center gap-3 px-4 py-3 transition hover:bg-white/75 sm:px-5"
          >
            <div className="shrink-0 text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-brand-500">
                {match.team?.name || "NFC"}
              </div>
              <div className="mt-1 text-xs font-bold text-brand-900">
                {formatMatchDate(match.playing_at)}
              </div>
            </div>
            <div className="min-w-0 flex-1 border-l border-sand-200 pl-3">
              <div className="truncate text-xs font-extrabold text-brand-900">
                {match.home_team_name}
              </div>
              <div className="mt-0.5 truncate text-xs text-ink-500">
                {match.away_team_name}
              </div>
            </div>
            <ArrowUpRight
              size={14}
              className="shrink-0 text-ink-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-500"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

