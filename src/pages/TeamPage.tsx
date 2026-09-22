import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  MapPin,
  Trophy,
  UsersRound,
} from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ClubLogo } from '../components/ClubLogo'
import { DataFade } from '../components/DataFade'
import { EmptyState, ErrorState, LoadingState } from '../components/LoadingState'
import { HeroFieldBackdrop } from '../components/HeroFieldBackdrop'
import { PlayerStripCarousel } from '../components/PlayerStripCarousel'
import { Seo } from '../components/Seo'
import { StandingsTable } from '../components/StandingsTable'
import {
  fetchDisplayPlayersByTeam,
  fetchMatchesByTeam,
  fetchStaffByTeam,
  fetchStandingsByTeam,
  fetchTeamBySlug,
} from '../lib/data'
import {
  formatMatchDate,
  formatMatchDay,
  formatMatchTime,
  initials,
  isUpcomingMatch,
  matchScore,
} from '../lib/format'
import { locationPath, withReturnPath } from '../lib/navigationState'
import type { Match } from '../lib/types'

export function TeamPage() {
  const { slug = '' } = useParams()
  const location = useLocation()
  const returnTo = locationPath(location.pathname, location.search)

  const teamQuery = useQuery({
    queryKey: ['team', slug],
    queryFn: () => fetchTeamBySlug(slug),
    retry: false,
  })
  const team = teamQuery.data

  const matchesQuery = useQuery({
    queryKey: ['team-matches', team?.id],
    queryFn: () => fetchMatchesByTeam(team!.id),
    enabled: Boolean(team?.id),
    retry: false,
  })
  const standingsQuery = useQuery({
    queryKey: ['standings', team?.id],
    queryFn: () => fetchStandingsByTeam(team!.id),
    enabled: Boolean(team?.id),
    retry: false,
  })
  const playersQuery = useQuery({
    queryKey: ['players', team?.id],
    queryFn: () => fetchDisplayPlayersByTeam(team!),
    enabled: Boolean(team?.id),
    retry: false,
  })
  const staffQuery = useQuery({
    queryKey: ['staff', team?.id],
    queryFn: () => fetchStaffByTeam(team!.id),
    enabled: Boolean(team?.id),
    retry: false,
  })

  if (teamQuery.isLoading) {
    return (
      <PageWrap>
        <LoadingState rows={4} />
      </PageWrap>
    )
  }

  if (teamQuery.isError) {
    return (
      <PageWrap>
        <ErrorState
          title="Tým se nepodařilo načíst"
          text="Zkus načtení zopakovat. Pokud problém přetrvá, může být dočasně nedostupné spojení se sportovními daty."
          onRetry={() => void teamQuery.refetch()}
        />
      </PageWrap>
    )
  }

  if (!team) {
    return (
      <PageWrap>
        <EmptyState
          title="Tým nebyl nalezen"
          text="Zkontroluj adresu nebo vyber tým z navigace."
        />
      </PageWrap>
    )
  }

  const matches = matchesQuery.data ?? []
  const now = Date.now()
  const latest = matches
    .filter((match) => new Date(match.playing_at).getTime() <= now)
    .sort((a, b) => +new Date(b.playing_at) - +new Date(a.playing_at))[0]
  const next = matches
    .filter((match) => new Date(match.playing_at).getTime() > now)
    .sort((a, b) => +new Date(a.playing_at) - +new Date(b.playing_at))[0]

  const upcoming = matches
    .filter((match) => isUpcomingMatch(match.playing_at))
    .sort((a, b) => +new Date(a.playing_at) - +new Date(b.playing_at))
  const standings = standingsQuery.data ?? []
  const lichnovStanding = standings.find((row) =>
    /lichnov/i.test(row.team_name || row.club_name || ''),
  )

  return (
    <main className="data-fade-in bg-sand-50">
      <Seo
        title={team.name}
        description={`${team.name} NFC Lichnov — zápasy, hráči, tabulka a realizační tým.`}
        image={team.logo_url}
        canonicalPath={`/tymy/${team.slug}`}
      />
      <section className="site-hero-frame relative -mt-[84px] flex flex-col px-5 pb-10 pt-[126px] sm:-mt-[88px] sm:pt-[136px] md:px-8 md:pb-14 md:pt-[144px]">
        <HeroFieldBackdrop />

        <div className="relative mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center">
          <div className="relative overflow-hidden rounded-[42px] bg-brand-900 px-6 py-7 text-white shadow-[0_28px_80px_rgba(24,53,42,.16)] sm:px-9 sm:py-10 lg:px-12 lg:py-12">
            <img
              src="/hero-lichnov-field.webp"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-[68%_center] opacity-[0.16]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(95deg,#18352a_0%,rgba(24,53,42,.96)_45%,rgba(24,53,42,.72)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,146,63,.22)_0%,transparent_42%,rgba(255,255,255,.05)_100%)]" />
            <div className="pointer-events-none absolute -bottom-9 -left-3 select-none text-[120px] font-black leading-none tracking-[-0.08em] text-white/[0.025] sm:text-[180px]">
              NFC
            </div>

            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(460px,.92fr)] lg:items-end">
              <div>
                <div className="flex items-center gap-4">
                  <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[28px] bg-white shadow-xl ring-1 ring-white/30 sm:h-28 sm:w-28">
                    <ClubLogo src={team.logo_url} name={team.name} size="lg" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                      NFC Lichnov
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {team.category && (
                        <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
                          {team.category}
                        </span>
                      )}
                      <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
                        Sezóna {team.season || 'aktuální'}
                      </span>
                    </div>
                  </div>
                </div>

                <h1 className="mt-8 max-w-3xl text-5xl font-black leading-[0.9] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                  {team.name}
                </h1>

                <div className="mt-8 flex flex-wrap gap-3">
                  {!playersQuery.isLoading && (
                    <DataFade>
                      <HeroStat
                        label="Hráči"
                        value={String(playersQuery.data?.length ?? 0)}
                      />
                    </DataFade>
                  )}
                  {!standingsQuery.isLoading && (
                    <DataFade>
                      <HeroStat
                        label="Tabulka"
                        value={lichnovStanding?.rank != null ? `${lichnovStanding.rank}. místo` : '—'}
                      />
                    </DataFade>
                  )}
                  {!matchesQuery.isLoading && (
                    <DataFade>
                      <HeroStat
                        label="Zápasy"
                        value={String(matches.length)}
                      />
                    </DataFade>
                  )}
                </div>
              </div>

              {matchesQuery.isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="min-h-[190px] rounded-[28px] border border-white/10 bg-white/[0.05]" />
                  <div className="min-h-[190px] rounded-[28px] border border-white/10 bg-white/[0.05]" />
                </div>
              ) : (
                <DataFade className="grid gap-3 sm:grid-cols-2">
                  <HeroMatch
                    label="Poslední výsledek"
                    match={latest}
                    kind="result"
                    returnTo={returnTo}
                  />
                  <HeroMatch
                    label="Další zápas"
                    match={next}
                    kind="upcoming"
                    returnTo={returnTo}
                  />
                </DataFade>
              )}
            </div>
          </div>

          <nav
            aria-label="Sekce týmu"
            className="relative z-20 mt-4 flex gap-2 overflow-x-auto rounded-[24px] border border-white/80 bg-white/75 p-2 shadow-[0_14px_40px_rgba(24,53,42,.07)] backdrop-blur-xl [scrollbar-width:none] md:sticky md:top-24 [&::-webkit-scrollbar]:hidden"
          >
            <SectionLink href="#zapasy">Zápasy</SectionLink>
            {standings.length > 0 && <SectionLink href="#tabulka">Tabulka</SectionLink>}
            <SectionLink href="#hraci">Hráči</SectionLink>
            <SectionLink href="#realizacni-tym">Realizační tým</SectionLink>
          </nav>
        </div>
      </section>

      <section id="zapasy" className="scroll-mt-28 bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="Program"
            title="Zápasy"
            aside={
              <Link
                to={`/zapasy?team=${team.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-700 ring-1 ring-brand-500/10 transition hover:bg-brand-100"
              >
                Všechna utkání
                <ArrowRight size={14} />
              </Link>
            }
          />

          {matchesQuery.isLoading ? (
            <LoadingState rows={2} />
          ) : upcoming.length ? (
            <DataFade className="grid items-stretch gap-4 lg:grid-cols-[1.35fr_.85fr]">
              <div className="flex min-w-0 flex-col">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
                  Nadcházející zápas
                </div>
                <div className="flex-1">
                  <TeamMatchCard
                    match={upcoming[0]}
                    returnTo={returnTo}
                    featured
                  />
                </div>
              </div>

              <div className="flex min-w-0 flex-col">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
                  Další zápas
                </div>
                <div className="flex-1">
                  {upcoming[1] ? (
                    <TeamMatchCard
                      match={upcoming[1]}
                      returnTo={returnTo}
                    />
                  ) : (
                    <div className="flex h-full min-h-[220px] items-center rounded-[28px] border border-sand-200 bg-sand-100 p-6">
                      <div>
                        <div className="text-base font-extrabold text-brand-900">
                          Zatím není naplánovaný
                        </div>
                        <p className="mt-2 text-sm leading-6 text-ink-500">
                          Další termín se zobrazí automaticky po synchronizaci.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DataFade>
          ) : (
            <DataFade className="rounded-[30px] border border-sand-200 bg-sand-100 p-7">
              <div className="text-base font-extrabold text-brand-900">
                Další zápas zatím není naplánovaný.
              </div>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                Jakmile bude nový termín dostupný, objeví se tady.
              </p>
            </DataFade>
          )}
        </div>
      </section>

      {standings.length > 0 && (
        <section
          id="tabulka"
          className="data-fade-in relative scroll-mt-28 bg-sand-100 px-5 py-16 md:px-8 md:py-24"
        >
          <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[42px] bg-brand-900 p-6 text-white shadow-soft sm:p-8 md:p-10">
            <div className="pointer-events-none absolute right-4 top-4 text-[110px] font-black leading-none tracking-[-0.08em] text-white/[0.025]">
              {lichnovStanding?.rank ?? 'NFC'}
            </div>

            <div className="relative grid gap-8 lg:grid-cols-[.58fr_1.42fr] lg:items-start">
              <div className="lg:sticky lg:top-28">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                  Soutěž
                </div>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-5xl">
                  Tabulka
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-white/[0.58]">
                  Aktuální pořadí týmu v soutěži. NFC Lichnov je zvýrazněný,
                  abys jeho pozici našel okamžitě.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {team.season && (
                    <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/65">
                      Sezóna {team.season}
                    </span>
                  )}
                  {lichnovStanding?.rank != null && (
                    <span className="rounded-full bg-brand-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                      {lichnovStanding.rank}. místo
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-[30px] bg-[#fbfaf6] p-2 text-ink-900 shadow-[0_18px_55px_rgba(0,0,0,.12)] sm:p-3">
                <StandingsTable rows={standings} />
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="hraci" className="relative scroll-mt-28 bg-white py-16 md:py-24">
        <div className="relative px-5 md:px-8">
          <div className="mx-auto max-w-[1240px]">
            <SectionHeading
              eyebrow="Kabina"
              title="Hráči"
              note={
                playersQuery.data?.length
                  ? `${playersQuery.data.length} hráčů v soupisce`
                  : undefined
              }
            />
          </div>
        </div>

        {playersQuery.isLoading ? (
          <div className="px-5 md:px-8">
            <div className="mx-auto max-w-[1240px]">
              <LoadingState rows={4} />
            </div>
          </div>
        ) : playersQuery.data?.length ? (
          <DataFade>
            <PlayerStripCarousel team={team} players={playersQuery.data} />
          </DataFade>
        ) : (
          <DataFade className="px-5 md:px-8">
            <div className="mx-auto max-w-[1240px]">
              <EmptyState
                title="Soupiska zatím není k dispozici"
                text="Hráči se zobrazí po synchronizaci nebo ručním doplnění."
              />
            </div>
          </DataFade>
        )}
      </section>

      <section
        id="realizacni-tym"
        className="relative scroll-mt-28 bg-sand-100 px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24"
      >
        <div className="relative mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="Realizační tým"
            title="Trenéři a vedení týmu"
            note={
              staffQuery.data?.length
                ? `${staffQuery.data.length} členů`
                : undefined
            }
          />

          {staffQuery.isLoading ? (
            <LoadingState rows={3} />
          ) : staffQuery.data?.length ? (
            <DataFade className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {staffQuery.data.map((person) => (
                <article
                  key={person.id}
                  className="group overflow-hidden rounded-[30px] border border-white/80 bg-white/[0.82] shadow-[0_12px_34px_rgba(24,53,42,.055)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-soft"
                >
                  <div className="grid grid-cols-[116px_1fr] sm:block">
                    <div className="relative min-h-[156px] overflow-hidden bg-sand-100 sm:aspect-[4/3] sm:min-h-0">
                      {person.photo_url ? (
                        <img
                          src={person.photo_url}
                          alt={person.name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(0,146,63,.2),transparent_40%)]">
                          <UsersRound size={34} className="text-brand-700/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-500">
                        {person.role || 'Realizační tým'}
                      </div>
                      <div className="mt-2 text-xl font-extrabold tracking-[-0.035em] text-brand-900">
                        {person.name}
                      </div>
                      {person.bio && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-500">
                          {person.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </DataFade>
          ) : (
            <DataFade>
              <EmptyState
              title="Realizační tým zatím není doplněn"
              text="Trenéři a vedení se zobrazí po doplnění v administraci."
              />
            </DataFade>
          )}
        </div>
      </section>
    </main>
  )
}

function PageWrap({ children }: { children: ReactNode }) {
  return (
    <main className="px-5 py-20 md:px-8">
      <div className="mx-auto max-w-[1000px]">{children}</div>
    </main>
  )
}

function SectionHeading({
  eyebrow,
  title,
  note,
  aside,
}: {
  eyebrow: string
  title: string
  note?: string
  aside?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
          {eyebrow}
        </div>
        <h2 className="mt-2 text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
          {title}
        </h2>
      </div>

      {(note || aside) && (
        <div className="flex items-center gap-4">
          {note && (
            <div className="text-xs font-semibold text-ink-500">
              {note}
            </div>
          )}
          {aside}
        </div>
      )}
    </div>
  )
}

function SectionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      data-no-transition="true"
      className="shrink-0 rounded-2xl px-4 py-2.5 text-sm font-bold text-ink-500 transition hover:bg-brand-50 hover:text-brand-900"
    >
      {children}
    </a>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[106px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-white">{value}</div>
    </div>
  )
}

function HeroMatch({
  label,
  match,
  kind,
  returnTo,
}: {
  label: string
  match?: Match
  kind: 'result' | 'upcoming'
  returnTo: string
}) {
  if (!match) {
    return (
      <div className="min-h-[190px] rounded-[28px] border border-white/10 bg-white/[0.07] p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
          {label}
        </div>
        <div className="mt-8 text-sm font-semibold text-white/45">
          Není k dispozici
        </div>
      </div>
    )
  }

  const score = matchScore(
    match.score_home,
    match.score_away,
    match.manual_override,
    match.manual_score_home,
    match.manual_score_away,
    match.playing_at,
  )

  return (
    <Link
      to={withReturnPath(`/zapasy/${match.id}`, returnTo)}
      className="group relative min-h-[190px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.07] p-5 transition hover:bg-white/[0.11]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
          {label}
        </div>
        <ChevronRight
          size={15}
          className="text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white/70"
        />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <HeroClub name={match.home_team_name} logo={match.home_team_logo} />
        <div className="px-1 text-center">
          {kind === 'result' ? (
            <div className="text-3xl font-black tracking-[-0.065em]">
              {score ?? '—'}
            </div>
          ) : (
            <>
              <div className="text-lg font-black tracking-[-0.04em]">
                {formatMatchDay(match.playing_at)}
              </div>
              <div className="mt-1 text-[11px] font-bold text-white/55">
                {formatMatchTime(match.playing_at)}
              </div>
            </>
          )}
        </div>
        <HeroClub name={match.away_team_name} logo={match.away_team_logo} />
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-3 text-[10px] font-medium text-white/45">
        <CalendarDays size={12} />
        {formatMatchDate(match.playing_at)}
      </div>
    </Link>
  )
}

function HeroClub({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="min-w-0 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white/95">
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-contain p-1.5" />
        ) : (
          <span className="text-[10px] font-black text-brand-900">{initials(name)}</span>
        )}
      </div>
      <div className="mt-2 line-clamp-2 text-[10px] font-bold leading-[1.15] text-white/80">
        {name}
      </div>
    </div>
  )
}

function TeamMatchCard({
  match,
  returnTo,
  featured = false,
}: {
  match: Match
  returnTo: string
  featured?: boolean
}) {
  const upcoming = isUpcomingMatch(match.playing_at)
  const score = matchScore(
    match.score_home,
    match.score_away,
    match.manual_override,
    match.manual_score_home,
    match.manual_score_away,
    match.playing_at,
  )

  return (
    <Link
      to={withReturnPath(`/zapasy/${match.id}`, returnTo)}
      className={`group flex h-full min-h-[220px] flex-col overflow-hidden rounded-[28px] border transition duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
        featured
          ? 'border-brand-900 bg-brand-900 text-white'
          : 'border-sand-200 bg-[#f6f3ec] text-ink-900 shadow-[0_12px_32px_rgba(24,53,42,.05)] hover:border-brand-500/20 hover:bg-[#fbfaf6]'
      }`}
    >
      <div className="flex items-center justify-between gap-4 px-5 pt-4">
        <div
          className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
            featured ? 'text-white/45' : 'text-ink-500'
          }`}
        >
          {upcoming ? 'Nadcházející utkání' : formatMatchDate(match.playing_at)}
        </div>
        <ChevronRight
          size={16}
          className={`transition group-hover:translate-x-0.5 ${
            featured ? 'text-white/40' : 'text-ink-500'
          }`}
        />
      </div>

      <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-5">
        <MatchClub
          name={match.home_team_name}
          logo={match.home_team_logo}
          featured={featured}
        />

        <div className="min-w-[76px] text-center">
          {upcoming ? (
            <div
              className={`rounded-2xl px-3 py-2 ${
                featured
                  ? 'bg-white/[0.09] ring-1 ring-white/10'
                  : 'bg-brand-50 ring-1 ring-brand-500/10'
              }`}
            >
              <div
                className={`text-lg font-black tracking-[-0.045em] ${
                  featured ? 'text-white' : 'text-brand-900'
                }`}
              >
                {formatMatchDay(match.playing_at)}
              </div>
              <div
                className={`mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold ${
                  featured ? 'text-white/55' : 'text-brand-500'
                }`}
              >
                <CalendarClock size={11} />
                {formatMatchTime(match.playing_at)}
              </div>
            </div>
          ) : (
            <div
              className={`text-3xl font-black tracking-[-0.06em] ${
                featured ? 'text-white' : 'text-brand-900'
              }`}
            >
              {score ?? '—'}
            </div>
          )}
        </div>

        <MatchClub
          name={match.away_team_name}
          logo={match.away_team_logo}
          featured={featured}
        />
      </div>

      {(match.competition_name || match.round || match.pitch_name) && (
        <div
          className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t px-5 py-3 text-[10px] ${
            featured
              ? 'border-white/10 text-white/45'
              : 'border-sand-200 text-ink-500'
          }`}
        >
          {match.competition_name && (
            <span className="inline-flex items-center gap-1.5">
              <Trophy size={11} />
              {match.competition_name}
            </span>
          )}
          {match.round && <span>{match.round}</span>}
          {match.pitch_name && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={11} />
              {match.pitch_name}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

function MatchClub({
  name,
  logo,
  featured,
}: {
  name: string
  logo: string | null
  featured: boolean
}) {
  return (
    <div className="min-w-0 text-center">
      <div
        className={`mx-auto grid h-11 w-11 place-items-center overflow-hidden rounded-xl ${
          featured ? 'bg-white/95' : 'bg-white ring-1 ring-sand-200'
        }`}
      >
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-contain p-1.5" />
        ) : (
          <span className="text-[10px] font-black text-brand-900">{initials(name)}</span>
        )}
      </div>
      <div
        className={`mt-2 line-clamp-2 text-xs font-bold leading-[1.15] ${
          featured ? 'text-white/85' : 'text-ink-900'
        }`}
      >
        {name}
      </div>
    </div>
  )
}
