import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ClubLogo } from '../components/ClubLogo'
import { EmptyState, LoadingState } from '../components/LoadingState'
import { MatchCarousel } from '../components/MatchCarousel'
import { PlayerStripCarousel } from '../components/PlayerStripCarousel'
import { SectionHeading } from '../components/SectionHeading'
import { StandingsTable } from '../components/StandingsTable'
import {
  fetchDisplayPlayersByTeam,
  fetchHomepageMatchSummaries,
  fetchPublishedNews,
  fetchStandingsByTeam,
  fetchTeams,
  fetchUpcomingMatches,
} from '../lib/data'
import { formatDate, formatMatchDate } from '../lib/format'
import type { Match, Team } from '../lib/types'

export function HomePage() {
  const teamsQuery = useQuery({ queryKey: ['teams'], queryFn: fetchTeams, retry: false })
  const matchesQuery = useQuery({
    queryKey: ['home-match-summaries'],
    queryFn: fetchHomepageMatchSummaries,
    retry: false,
  })
  const newsQuery = useQuery({
    queryKey: ['news', 'home'],
    queryFn: () => fetchPublishedNews(4),
    retry: false,
  })
  const upcomingQuery = useQuery({
    queryKey: ['matches', 'upcoming'],
    queryFn: fetchUpcomingMatches,
    retry: false,
  })

  const men = teamsQuery.data?.find((team) => team.slug === 'muzi')
  const standingsQuery = useQuery({
    queryKey: ['standings', men?.id],
    queryFn: () => fetchStandingsByTeam(men!.id),
    enabled: Boolean(men?.id),
    retry: false,
  })
  const menPlayersQuery = useQuery({
    queryKey: ['players', men?.id, 'home-strip'],
    queryFn: () => fetchDisplayPlayersByTeam(men!),
    enabled: Boolean(men?.id),
    retry: false,
  })

  const news = newsQuery.data ?? []
  const upcomingMatches = upcomingQuery.data ?? []
  const featuredUpcoming =
    upcomingMatches.find((match) => match.team?.slug === 'muzi') ?? upcomingMatches[0]
  const dorostUpcoming = upcomingMatches.find((match) => match.team?.slug === 'dorost')
  const lowerUpcoming = upcomingMatches
    .filter((match) => match.id !== featuredUpcoming?.id && match.id !== dorostUpcoming?.id)
    .slice(0, 3)
  const standings = standingsQuery.data ?? []
  const lichnovIndex = standings.findIndex((row) => /lichnov/i.test(row.team_name || row.club_name || ''))
  const standingsPreview =
    lichnovIndex >= 0
      ? standings.slice(Math.max(0, lichnovIndex - 2), Math.min(standings.length, lichnovIndex + 3))
      : standings.slice(0, 5)

  return (
    <main>
      <section className="relative -mt-[84px] overflow-hidden px-4 pb-10 pt-[116px] sm:-mt-[88px] sm:px-5 sm:pb-14 sm:pt-[132px] md:px-8 md:pt-[140px] lg:pb-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src="/hero-lichnov-field.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(250,248,243,.98) 0%, rgba(250,248,243,.93) 28%, rgba(250,248,243,.62) 50%, rgba(250,248,243,.30) 72%, rgba(250,248,243,.16) 100%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(250,248,243,.18) 0%, rgba(250,248,243,.08) 36%, rgba(250,248,243,.48) 72%, rgba(250,248,243,.98) 100%)',
            }}
          />
          <div className="hero-glow absolute inset-0 opacity-70" />
          <div className="absolute left-[-8rem] top-40 h-80 w-80 rounded-full bg-brand-500/[0.08] blur-3xl" />
        </div>

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
                <span className="mt-2 block text-brand-500">Od nejmenších až po muže.</span>
              </h1>

              <p className="mt-7 max-w-[590px] text-base leading-7 text-ink-500 sm:text-lg sm:leading-8">
                Výsledky, zápasy, hráči a život klubu na jednom místě. Přehledně pro fanoušky,
                rodiče i všechny, kteří jsou součástí NFC.
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

              <div className="mt-10 grid max-w-[430px] grid-cols-2 border-t border-sand-200 pt-5">
                <HeroStat value={teamsQuery.data?.length ? String(teamsQuery.data.length) : '—'} label="aktivních týmů" />
                <HeroStat value={men?.season || '2026/27'} label="aktuální sezóna" />
              </div>
            </div>

            <div className="relative lg:pl-4">
              <div className="mb-4 flex items-end justify-between gap-4 px-1">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">Zápasy</div>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.045em] text-brand-900">
                    Výsledky napříč kategoriemi
                  </h2>
                </div>
                <div className="hidden text-right text-[11px] leading-5 text-ink-500 sm:block">
                  Přepínej mezi týmy<br />nebo přejeď prstem
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
                <MatchCarousel items={matchesQuery.data ?? []} />
              )}
            </div>
          </div>

          {(teamsQuery.data?.length ?? 0) > 0 && <TeamRail teams={teamsQuery.data ?? []} />}
        </div>
      </section>

      <section className="relative overflow-hidden bg-sand-100 px-5 py-20 md:px-8 md:py-28">
        <div className="field-watermark pointer-events-none absolute inset-0 opacity-45" />
        <div className="relative mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="Klubový deník"
            title="Aktuálně z Lichnova"
            text="Novinky z hřiště, kabiny i života klubu."
            to="/aktuality"
            linkLabel="Všechny aktuality"
          />

          {newsQuery.isLoading ? (
            <LoadingState rows={3} />
          ) : news.length ? (
            <div className="grid gap-7 lg:grid-cols-[1.45fr_.75fr]">
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
                      {news[0].category || 'Aktualita'}
                    </span>
                    <ArrowUpRight
                      size={20}
                      className="text-white/55 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-white/55">{formatDate(news[0].published_at)}</div>
                    <h3 className="mt-3 max-w-2xl text-3xl font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
                      {news[0].title}
                    </h3>
                    {news[0].excerpt && (
                      <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">{news[0].excerpt}</p>
                    )}
                  </div>
                </div>
              </Link>

              <div className="border-t border-brand-900/10">
                {news.slice(1, 4).map((article) => (
                  <Link
                    key={article.id}
                    to={`/aktuality/${article.slug}`}
                    className="group grid grid-cols-[1fr_auto] gap-5 border-b border-brand-900/10 py-6 first:pt-5"
                  >
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-500">
                        {article.category || 'Aktualita'}
                      </div>
                      <h3 className="mt-2 text-xl font-extrabold leading-tight tracking-[-0.035em] text-brand-900 transition group-hover:text-brand-700">
                        {article.title}
                      </h3>
                      <p className="mt-3 text-xs text-ink-500">{formatDate(article.published_at)}</p>
                    </div>

                    <div className="grid h-10 w-10 place-items-center self-center rounded-2xl bg-white/70 text-brand-900 ring-1 ring-white transition group-hover:bg-brand-500 group-hover:text-white">
                      <ArrowUpRight size={17} />
                    </div>
                  </Link>
                ))}

                <Link
                  to="/aktuality"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition hover:text-brand-500"
                >
                  Všechny zprávy <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Aktuality zatím nejsou publikované"
              text="Jakmile v administraci zveřejníš první článek, objeví se automaticky tady."
            />
          )}
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
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
            <div className="grid gap-4 lg:grid-cols-12">
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
                      ? 'min-h-[185px] lg:col-span-4'
                      : lowerUpcoming.length === 2
                        ? 'min-h-[185px] lg:col-span-6'
                        : 'min-h-[185px] lg:col-span-12'
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nejbližší zápasy zatím nejsou k dispozici"
              text="Sekce se naplní automaticky z tabulky matches."
            />
          )}
        </div>
      </section>

      {men && (
        <div className="py-8 md:py-14">
          {menPlayersQuery.isLoading ? (
            <div className="px-5 md:px-8">
              <div className="mx-auto max-w-[1240px]">
                <LoadingState rows={3} />
              </div>
            </div>
          ) : menPlayersQuery.data?.length ? (
            <PlayerStripCarousel team={men} players={menPlayersQuery.data} />
          ) : null}
        </div>
      )}

      <section className="px-5 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-[1240px] overflow-hidden rounded-[42px] bg-brand-900 px-6 py-9 text-white sm:px-8 md:px-10 md:py-12">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">A tým</div>
              <h2 className="mt-4 text-4xl font-extrabold leading-[.98] tracking-[-0.055em] md:text-5xl">
                Tabulka bez hledání.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/60 sm:text-base">
                Aktuální pozice mužů na první pohled. NFC Lichnov zvýrazňujeme, aby ses v tabulce
                zorientoval během vteřiny.
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
                <StandingsTable rows={standingsPreview} compact />
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

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="Od mužů po nejmenší"
            title="Jeden klub. Šest týmů."
            text="Každá kategorie má vlastní prostor pro zápasy, hráče a statistiky."
            to="/tymy"
            linkLabel="Přehled týmů"
          />

          {teamsQuery.data?.length ? (
            <TeamEditorialGrid teams={teamsQuery.data} />
          ) : (
            <EmptyState
              title="Týmy se nepodařilo načíst"
              text="Po připojení Supabase se zde zobrazí všechny aktivní kategorie."
            />
          )}
        </div>
      </section>

      <section className="px-5 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1240px] overflow-hidden rounded-[42px] bg-brand-900 p-7 text-white sm:p-10 md:p-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Život klubu</div>
              <h2 className="mt-4 max-w-xl text-4xl font-extrabold leading-[.98] tracking-[-0.055em] md:text-6xl">
                Fotbal nejsou jen výsledky.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-6 text-white/65 sm:text-base">
                Galerie bude patřit zápasům, tréninkům, mládeži, fanouškům i tomu, co se děje mimo
                devadesát minut na hřišti.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-[4/3] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_30%_25%,rgba(0,146,63,.55),transparent_35%),linear-gradient(145deg,#244938,#18352A)]" />
              <div className="mt-8 aspect-[4/3] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_70%_30%,rgba(243,239,230,.2),transparent_35%),linear-gradient(145deg,#1d412f,#0d281d)]" />
            </div>
          </div>

          <Link
            to="/galerie"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-brand-900"
          >
            Galerie <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <SectionHeading eyebrow="NFC Lichnov" title="Klub je víc než sestava." />

          <div className="grid border-y border-sand-200 md:grid-cols-4 md:divide-x md:divide-sand-200">
            {[
              ['O klubu', '/klub'],
              ['Historie', '/klub#historie'],
              ['Sportovní areál', '/klub#areal'],
              ['Kontakt', '/kontakt'],
            ].map(([label, to]) => (
              <Link
                key={label}
                to={to}
                className="group flex items-center justify-between border-b border-sand-200 px-1 py-6 text-2xl font-extrabold tracking-[-0.04em] text-brand-900 last:border-b-0 md:border-b-0 md:px-6 md:py-9"
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
  )
}

function UpcomingMatchTile({
  match,
  featured = false,
  large = false,
  className = '',
}: {
  match: Match & { team?: Team }
  featured?: boolean
  large?: boolean
  className?: string
}) {
  const teamName = match.team?.name || 'NFC Lichnov'
  const to = `/tymy/${match.team?.slug ?? ''}`

  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-[30px] border transition duration-300 hover:-translate-y-1 hover:shadow-soft ${featured
        ? 'border-brand-900 bg-brand-900 text-white'
        : 'border-sand-200 bg-white text-ink-900'
      } ${className}`}
    >
      <div className={`absolute right-[-4rem] top-[-4rem] h-48 w-48 rounded-full ${featured ? 'bg-brand-500/20' : 'bg-brand-500/[0.06]'}`} />

      <div className={`relative flex h-full flex-col ${featured ? 'p-7 sm:p-8' : large ? 'p-6 sm:p-7' : 'p-5'}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-[0.17em] ${featured ? 'text-white/45' : 'text-brand-500'}`}>
              {teamName}
            </div>
            <div className={`mt-1 text-xs font-semibold ${featured ? 'text-white/60' : 'text-ink-500'}`}>
              {formatMatchDate(match.playing_at)}
            </div>
          </div>
          <ArrowUpRight
            size={featured ? 20 : 16}
            className={`shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${featured ? 'text-white/55 group-hover:text-white' : 'text-ink-500 group-hover:text-brand-500'}`}
          />
        </div>

        <div className={`my-auto grid grid-cols-[1fr_auto_1fr] items-center ${featured ? 'gap-6' : large ? 'gap-5' : 'gap-3'}`}>
          <MatchClub
            name={match.home_team_name}
            logo={match.home_team_logo}
            featured={featured}
            large={large}
            align="right"
          />

          <div className={`rounded-full font-black uppercase tracking-[0.12em] ${featured
            ? 'bg-white/[0.08] px-3 py-2 text-[11px] text-white/60 ring-1 ring-white/10'
            : 'bg-sand-100 px-2.5 py-1.5 text-[9px] text-ink-500'
          }`}>
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

        <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-xs ${featured ? 'text-white/55' : 'text-ink-500'}`}>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} />
            {formatMatchDate(match.playing_at)}
          </span>
          {match.pitch_name && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} />
              {match.pitch_name}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function MatchClub({
  name,
  logo,
  featured,
  large,
  align,
}: {
  name: string
  logo: string | null
  featured: boolean
  large: boolean
  align: 'left' | 'right'
}) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      <ClubLogo src={logo} name={name} size={featured ? 'lg' : large ? 'md' : 'sm'} />
      <div className={`line-clamp-2 font-extrabold leading-[1.05] tracking-[-0.03em] ${featured ? 'text-xl sm:text-2xl' : large ? 'text-base sm:text-lg' : 'text-sm'}`}>
        {name}
      </div>
    </div>
  )
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-r border-sand-200 px-3 first:pl-0 last:border-r-0 sm:px-5">
      <div className="truncate text-base font-black tracking-[-0.04em] text-brand-900 sm:text-xl">{value}</div>
      <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.13em] text-ink-500 sm:text-[10px]">{label}</div>
    </div>
  )
}

function TeamRail({ teams }: { teams: Team[] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-[22px] border border-sand-200 bg-white/45 backdrop-blur sm:mt-5">
      <div className="flex overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {teams.map((team) => (
          <Link
            key={team.id}
            to={`/tymy/${team.slug}`}
            className="group flex shrink-0 items-center gap-2 rounded-[14px] px-3 py-2 text-xs font-semibold text-ink-500 transition hover:bg-white hover:text-brand-900 sm:px-4"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500/35 transition group-hover:bg-brand-500" />
            {team.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

function TeamEditorialGrid({ teams }: { teams: Team[] }) {
  return (
    <div className="grid auto-rows-[170px] gap-4 md:grid-cols-12 md:auto-rows-[190px]">
      {teams.map((team, index) => {
        const span =
          index === 0
            ? 'md:col-span-7 md:row-span-2'
            : index === 1
              ? 'md:col-span-5'
              : index === 2
                ? 'md:col-span-5'
                : 'md:col-span-4'

        return (
          <Link
            key={team.id}
            to={`/tymy/${team.slug}`}
            className={`group relative overflow-hidden rounded-5xl border border-sand-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-soft ${span}`}
          >
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-500/10 transition duration-500 group-hover:scale-125" />
            <div className="absolute bottom-0 right-0 h-24 w-24 rounded-tl-full border-l border-t border-brand-500/10 opacity-0 transition group-hover:opacity-100" />

            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <ClubLogo src={team.logo_url} name={team.name} size={index === 0 ? 'lg' : 'sm'} />
                <ArrowUpRight
                  className="text-ink-500 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-500"
                  size={18}
                />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">NFC Lichnov</div>
                <div
                  className={`${index === 0 ? 'text-4xl md:text-5xl' : 'text-2xl'} mt-2 font-extrabold tracking-[-0.05em] text-brand-900`}
                >
                  {team.name}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
