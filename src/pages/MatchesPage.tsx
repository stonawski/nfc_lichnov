import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  MapPin,
  Trophy,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { DataFade } from '../components/DataFade'
import { EmptyState, LoadingState } from '../components/LoadingState'
import { HeroFieldBackdrop } from '../components/HeroFieldBackdrop'
import { fetchCurrentMatches, fetchTeams } from '../lib/data'
import {
  formatMatchDate,
  formatMatchDay,
  formatMatchTime,
  initials,
  isUpcomingMatch,
  matchScore,
} from '../lib/format'
import { locationPath, withReturnPath } from '../lib/navigationState'
import type { Match, Team } from '../lib/types'

export function MatchesPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showAllUpcoming, setShowAllUpcoming] = useState(false)
  const [showAllResults, setShowAllResults] = useState(false)
  const selectedTeamSlug = searchParams.get('team') || 'all'
  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })
  const matchesQuery = useQuery({
    queryKey: ['matches', 'current'],
    queryFn: fetchCurrentMatches,
    retry: false,
  })

  const teams = teamsQuery.data ?? []
  const teamMap = useMemo(
    () => new Map(teams.map((team) => [team.id, team])),
    [teams],
  )
  const selectedTeam =
    selectedTeamSlug === 'all'
      ? null
      : teams.find((team) => team.slug === selectedTeamSlug) ?? null
  const teamId = selectedTeam?.id ?? 'all'
  const returnTo = locationPath(location.pathname, location.search)

  const setTeamFilter = (slug: string) => {
    const next = new URLSearchParams(searchParams)

    if (slug === 'all') next.delete('team')
    else next.set('team', slug)

    setSearchParams(next, { replace: true })
  }

  const matches = (matchesQuery.data ?? []).filter(
    (match) => teamId === 'all' || match.team_id === teamId,
  )

  const upcoming = matches
    .filter((match) => isUpcomingMatch(match.playing_at))
    .sort((a, b) => +new Date(a.playing_at) - +new Date(b.playing_at))

  const results = matches
    .filter((match) => !isUpcomingMatch(match.playing_at))
    .sort((a, b) => +new Date(b.playing_at) - +new Date(a.playing_at))

  const featuredMatch = upcoming[0]
  const remainingUpcoming = featuredMatch ? upcoming.slice(1) : upcoming
  const visibleUpcoming = showAllUpcoming
    ? remainingUpcoming
    : remainingUpcoming.slice(0, 4)
  const visibleResults = showAllResults ? results : results.slice(0, 4)

  useEffect(() => {
    setShowAllUpcoming(false)
    setShowAllResults(false)
  }, [selectedTeamSlug])

  return (
    <main>
      <section className="site-hero-frame relative -mt-[84px] flex flex-col overflow-hidden px-5 pb-14 pt-[118px] sm:-mt-[88px] sm:pt-[126px] md:px-8 md:pb-20 md:pt-[132px]">
        <HeroFieldBackdrop />

        <div className="relative mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center">
          <div className="grid gap-5 py-5 lg:grid-cols-[1fr_.48fr] lg:items-end lg:py-7">
            <div className="max-w-3xl">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
                Zápasy
              </div>
              <h1 className="mt-3 text-4xl font-black leading-[0.94] tracking-[-0.06em] text-brand-900 sm:text-5xl md:text-6xl">
                Program.
                <span className="block text-brand-500">Výsledky. Detail.</span>
              </h1>
            </div>

            <p className="max-w-md text-sm leading-6 text-ink-500 lg:justify-self-end">
              Vyber kategorii a projdi si nejbližší program i odehrané zápasy.
            </p>
          </div>

          {teamsQuery.isLoading ? (
            <div className="h-[68px] rounded-[24px] border border-white/80 bg-white/55 backdrop-blur-xl" />
          ) : (
            <DataFade className="rounded-[24px] border border-white/90 bg-white/90 p-3 shadow-[0_12px_34px_rgba(24,53,42,.07)] backdrop-blur-xl sm:p-4">
              <div className="flex flex-wrap gap-2">
                <Filter active={teamId === 'all'} onClick={() => setTeamFilter('all')}>
                  Všechny týmy
                </Filter>

                {teams.map((team) => (
                  <Filter
                    key={team.id}
                    active={selectedTeamSlug === team.slug}
                    onClick={() => setTeamFilter(team.slug)}
                  >
                    {team.name}
                  </Filter>
                ))}
              </div>
            </DataFade>
          )}

          {!matchesQuery.isLoading && !teamsQuery.isLoading && featuredMatch && (
            <DataFade
              key={`featured-${selectedTeamSlug}-${featuredMatch.id}`}
              className="mt-10 md:mt-12"
            >
              <FeaturedMatch
                match={featuredMatch}
                team={teamMap.get(featuredMatch.team_id)}
                returnTo={returnTo}
              />
            </DataFade>
          )}
        </div>
      </section>

      {matchesQuery.isLoading || teamsQuery.isLoading ? (
        <section className="bg-white px-5 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1240px]">
            <LoadingState rows={6} />
          </div>
        </section>
      ) : matches.length ? (
        <>
          <section
            key={`upcoming-${selectedTeamSlug}`}
            className="data-fade-in bg-white px-5 py-16 md:px-8 md:py-24"
          >
            <div className="mx-auto max-w-[1240px]">
              <SectionHeader
                eyebrow="Program"
                title="Následující zápasy"
                count={remainingUpcoming.length}
              />

              {remainingUpcoming.length ? (
                <>
                  <div className="stagger-children grid gap-4 lg:grid-cols-2">
                    {visibleUpcoming.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        team={teamMap.get(match.team_id)}
                        returnTo={returnTo}
                      />
                    ))}
                  </div>

                  {remainingUpcoming.length > 4 && (
                    <ExpandButton
                      expanded={showAllUpcoming}
                      onClick={() => setShowAllUpcoming((value) => !value)}
                      hiddenCount={remainingUpcoming.length - 4}
                    />
                  )}
                </>
              ) : (
                <EmptyState
                  title="Další zápasy zatím nejsou k dispozici"
                  text="Pro vybranou kategorii je zatím naplánovaný jen nejbližší zápas."
                />
              )}
            </div>
          </section>

          <section
            key={`results-${selectedTeamSlug}`}
            className="data-fade-in bg-sand-100 px-5 py-16 md:px-8 md:py-24"
          >
            <div className="mx-auto max-w-[1240px]">
              <SectionHeader
                eyebrow="Odehráno"
                title="Poslední výsledky"
                count={results.length}
              />

              {results.length ? (
                <>
                  <div className="stagger-children grid gap-4 lg:grid-cols-2">
                    {visibleResults.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        team={teamMap.get(match.team_id)}
                        returnTo={returnTo}
                      />
                    ))}
                  </div>

                  {results.length > 4 && (
                    <ExpandButton
                      expanded={showAllResults}
                      onClick={() => setShowAllResults((value) => !value)}
                      hiddenCount={results.length - 4}
                    />
                  )}
                </>
              ) : (
                <EmptyState
                  title="Žádné výsledky"
                  text="Pro vybranou kategorii zatím nejsou dostupné odehrané zápasy."
                />
              )}
            </div>
          </section>
        </>
      ) : (
        <section
          key={`empty-${selectedTeamSlug}`}
          className="data-fade-in bg-white px-5 py-16 md:px-8 md:py-24"
        >
          <div className="mx-auto max-w-[1240px]">
            <EmptyState
              title="Žádné zápasy"
              text="Pro vybraný filtr nejsou k dispozici žádná utkání."
            />
          </div>
        </section>
      )}
    </main>
  )
}

function FeaturedMatch({
  match,
  team,
  returnTo,
}: {
  match: Match
  team?: Team
  returnTo: string
}) {
  return (
    <Link
      to={withReturnPath(`/zapasy/${match.id}`, returnTo)}
      className="group relative block overflow-hidden rounded-[38px] bg-brand-900 p-6 text-white shadow-soft sm:p-8 lg:p-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,146,63,.42),transparent_32%),radial-gradient(circle_at_88%_82%,rgba(255,255,255,.08),transparent_28%)]" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
            <span>Nejbližší zápas</span>
            {team?.name && <span>· {team.name}</span>}
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-bold text-white/70 transition group-hover:text-white">
            Detail zápasu
            <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <TeamIdentity
            name={match.home_team_name}
            logo={match.home_team_logo}
            align="right"
            large
          />

          <div className="text-center">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.07] px-5 py-4">
              <div className="text-3xl font-black tracking-[-0.055em]">
                {formatMatchDay(match.playing_at)}
              </div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-white/65">
                <CalendarClock size={14} />
                {formatMatchTime(match.playing_at)}
              </div>
            </div>
          </div>

          <TeamIdentity
            name={match.away_team_name}
            logo={match.away_team_logo}
            align="left"
            large
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/50">
          {match.competition_name && (
            <span className="inline-flex items-center gap-1.5">
              <Trophy size={13} />
              {match.competition_name}
            </span>
          )}
          {match.round && <span>{match.round}</span>}
          {match.pitch_name && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} />
              {match.pitch_name}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function MatchCard({
  match,
  team,
  returnTo,
}: {
  match: Match
  team?: Team
  returnTo: string
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
      className="group block rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-soft sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-brand-500">{team?.name || 'NFC Lichnov'}</div>
          <div className="mt-1 text-xs text-ink-500">
            {formatMatchDate(match.playing_at)}
          </div>
        </div>

        <ChevronRight
          size={18}
          className="text-ink-500 transition group-hover:translate-x-1 group-hover:text-brand-500"
        />
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamIdentity name={match.home_team_name} logo={match.home_team_logo} align="right" />

        <div className="min-w-[76px] text-center">
          {upcoming ? (
            <div className="rounded-2xl bg-brand-50 px-3 py-2 ring-1 ring-brand-500/10">
              <div className="text-base font-black tracking-[-0.04em] text-brand-900">
                {formatMatchTime(match.playing_at)}
              </div>
              <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.11em] text-brand-500">
                Výkop
              </div>
            </div>
          ) : (
            <div className="text-3xl font-black tracking-[-0.055em] text-brand-900">
              {score ?? '—'}
            </div>
          )}
        </div>

        <TeamIdentity name={match.away_team_name} logo={match.away_team_logo} align="left" />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-sand-200 pt-4 text-[11px] text-ink-500">
        {match.competition_name && <span>{match.competition_name}</span>}
        {match.round && <span>{match.round}</span>}
        {match.pitch_name && <span>{match.pitch_name}</span>}
      </div>
    </Link>
  )
}

function TeamIdentity({
  name,
  logo,
  align,
  large = false,
}: {
  name: string
  logo: string | null
  align: 'left' | 'right'
  large?: boolean
}) {
  const reverse = align === 'right'

  return (
    <div
      className={`flex min-w-0 items-center gap-3 ${
        reverse ? 'flex-row-reverse text-right' : 'text-left'
      }`}
    >
      <div
        className={`grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/90 ring-1 ring-black/5 ${
          large ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-11 w-11'
        }`}
      >
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-contain p-2" />
        ) : (
          <span className="text-xs font-black text-brand-900">{initials(name)}</span>
        )}
      </div>

      <div
        className={`min-w-0 font-extrabold tracking-[-0.035em] ${
          large ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-sm sm:text-base'
        }`}
      >
        {name}
      </div>
    </div>
  )
}

function SectionHeader({
  eyebrow,
  title,
  count,
}: {
  eyebrow: string
  title: string
  count: number
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-5">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
          {eyebrow}
        </div>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-brand-900 sm:text-4xl">
          {title}
        </h2>
      </div>

      <div className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink-500 ring-1 ring-sand-200">
        {count}
      </div>
    </div>
  )
}

function ExpandButton({
  expanded,
  onClick,
  hiddenCount,
}: {
  expanded: boolean
  onClick: () => void
  hiddenCount: number
}) {
  return (
    <div className="mt-7 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="group inline-flex items-center gap-2 rounded-2xl border border-sand-200 bg-white px-4 py-2.5 text-sm font-bold text-brand-900 shadow-[0_8px_24px_rgba(24,53,42,.05)] transition hover:-translate-y-0.5 hover:border-brand-500/20 hover:shadow-soft"
      >
        {expanded ? 'Zobrazit méně' : `Zobrazit další (${hiddenCount})`}
        <ChevronDown
          size={15}
          className={`transition duration-[420ms] ease-smooth ${expanded ? 'rotate-180' : 'group-hover:translate-y-0.5'}`}
        />
      </button>
    </div>
  )
}

function Filter({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
        active
          ? 'bg-brand-900 text-white'
          : 'bg-white text-ink-500 ring-1 ring-sand-200 hover:text-brand-900'
      }`}
    >
      {children}
    </button>
  )
}
