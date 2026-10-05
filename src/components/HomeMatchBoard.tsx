import { ArrowUpRight, MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  formatMatchDate,
  formatMatchDay,
  formatMatchTime,
  matchScore,
  matchVenueMapUrl,
} from '../lib/format'
import type { Match, Team, TeamMatchSummary } from '../lib/types'
import { ClubLogo } from './ClubLogo'

export function HomeMatchBoard({
  results,
  upcoming,
}: {
  results: TeamMatchSummary[]
  upcoming: TeamMatchSummary[]
}) {
  const teams = useMemo(() => {
    const seen = new Set<string>()
    const ordered: Team[] = []

    for (const item of [...results, ...upcoming]) {
      if (seen.has(item.team.id)) continue
      seen.add(item.team.id)
      ordered.push(item.team)
    }

    return ordered
  }, [results, upcoming])

  const [teamId, setTeamId] = useState(teams[0]?.id ?? '')

  useEffect(() => {
    if (!teams.length) {
      setTeamId('')
      return
    }

    if (!teams.some((team) => team.id === teamId)) {
      setTeamId(teams[0].id)
    }
  }, [teams, teamId])

  if (!teams.length) return null

  const activeTeam = teams.find((team) => team.id === teamId) ?? teams[0]
  const resultSummary = results.find((item) => item.team.id === activeTeam.id)
  const upcomingSummary = upcoming.find((item) => item.team.id === activeTeam.id)

  const resultMatch =
    resultSummary?.kind === 'result' ? resultSummary.match : null
  const upcomingMatch =
    upcomingSummary?.kind === 'upcoming' ? upcomingSummary.match : null

  return (
    <div className="content-enter">
      <div className="home-match-board-switcher mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-500">
            Kategorie
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <ClubLogo src={activeTeam.logo_url} name={activeTeam.name} size="sm" />
            <div className="text-lg font-extrabold tracking-[-0.035em] text-brand-900">
              {activeTeam.name}
            </div>
          </div>
        </div>

        <div
          className="flex max-w-full gap-1.5 overflow-x-auto rounded-[16px] border border-white/70 bg-white/70 p-1.5 shadow-[0_8px_24px_rgba(24,53,42,.05)] backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Výběr týmu"
        >
          {teams.map((team) => {
            const active = team.id === activeTeam.id

            return (
              <button
                key={team.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTeamId(team.id)}
                className={`shrink-0 rounded-[11px] px-3.5 py-2 text-[11px] font-bold transition-colors ${
                  active
                    ? 'bg-brand-900 text-white'
                    : 'text-ink-500 hover:bg-sand-100 hover:text-brand-900'
                }`}
              >
                {team.short_name || team.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <ResultCard match={resultMatch} />
        <UpcomingCard match={upcomingMatch} />
      </div>
    </div>
  )
}

function ResultCard({ match }: { match: Match | null }) {
  if (!match) {
    return (
      <article className="home-match-card min-h-[330px] rounded-[32px] border border-sand-200 bg-white/90 p-6 shadow-[0_22px_60px_rgba(24,53,42,.08)] backdrop-blur lg:col-span-7 sm:p-7">
        <CardEyebrow label="Poslední výsledek" />
        <div className="mt-20 rounded-[22px] bg-sand-50 px-5 py-7 text-center text-sm text-ink-500">
          Pro tento tým zatím nemáme poslední výsledek.
        </div>
      </article>
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
    <article className="home-match-card min-h-[330px] rounded-[32px] border border-sand-200 bg-white/90 p-6 shadow-[0_22px_60px_rgba(24,53,42,.08)] backdrop-blur lg:col-span-7 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <CardEyebrow label="Poslední výsledek" />
        <div className="text-right text-[10px] leading-4 text-ink-500">
          {match.competition_name && <div>{match.competition_name}</div>}
          {match.round && <div>{match.round}</div>}
        </div>
      </div>

      <div className="home-match-card-main mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-7">
        <ClubSide name={match.home_team_name} logo={match.home_team_logo} />

        <div className="min-w-[108px] text-center">
          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-500">
            Konečný stav
          </div>
          <div className="mt-2 text-5xl font-black tracking-[-0.075em] text-brand-900 sm:text-6xl">
            {score ?? '—'}
          </div>
        </div>

        <ClubSide name={match.away_team_name} logo={match.away_team_logo} />
      </div>

      <div className="home-match-card-footer mt-8 border-t border-sand-200 pt-4 text-xs font-semibold text-ink-500">
        {formatMatchDate(match.playing_at)}
      </div>
    </article>
  )
}

function UpcomingCard({ match }: { match: Match | null }) {
  if (!match) {
    return (
      <article className="home-match-card min-h-[330px] rounded-[32px] bg-brand-900 p-6 text-white shadow-[0_22px_60px_rgba(24,53,42,.16)] lg:col-span-5 sm:p-7">
        <CardEyebrow label="Nadcházející zápas" dark />
        <div className="mt-20 rounded-[22px] bg-white/[0.06] px-5 py-7 text-center text-sm text-white/60">
          Pro tento tým zatím nemáme další zápas.
        </div>
      </article>
    )
  }

  return (
    <article className="home-match-card relative min-h-[330px] overflow-hidden rounded-[32px] bg-brand-900 p-6 text-white shadow-[0_22px_60px_rgba(24,53,42,.16)] lg:col-span-5 sm:p-7">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(0,146,63,.34),transparent_34%)]"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <CardEyebrow label="Nadcházející zápas" dark />
          <div className="text-right text-[10px] leading-4 text-white/45">
            {match.competition_name && <div>{match.competition_name}</div>}
            {match.round && <div>{match.round}</div>}
          </div>
        </div>

        <div className="home-match-card-main mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
          <ClubSide
            name={match.home_team_name}
            logo={match.home_team_logo}
            dark
          />

          <div className="min-w-[90px] text-center">
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">
              Výkop
            </div>
            <div className="mt-1 text-3xl font-black tracking-[-0.06em] text-white">
              {formatMatchDay(match.playing_at)}
            </div>
            <div className="mt-1 text-sm font-bold text-brand-500">
              {formatMatchTime(match.playing_at)}
            </div>
          </div>

          <ClubSide
            name={match.away_team_name}
            logo={match.away_team_logo}
            dark
          />
        </div>

        <div className="home-match-card-footer mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="text-xs font-semibold text-white/55">
            {formatMatchDate(match.playing_at)}
          </div>

          <a
            href={matchVenueMapUrl(match)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[11px] bg-white/[0.08] px-3 py-2 text-[10px] font-bold text-white/80 transition-colors hover:bg-white hover:text-brand-900"
            title={`Otevřít hřiště domácího týmu ${match.home_team_name} v Google Maps`}
          >
            <MapPin size={12} />
            Hřiště
            <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
    </article>
  )
}

function CardEyebrow({
  label,
  dark = false,
}: {
  label: string
  dark?: boolean
}) {
  return (
    <div
      className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
        dark ? 'text-white/55' : 'text-brand-500'
      }`}
    >
      {label}
    </div>
  )
}

function ClubSide({
  name,
  logo,
  dark = false,
}: {
  name: string
  logo: string | null
  dark?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-3 text-center">
      <ClubLogo src={logo} name={name} size="lg" />
      <div
        className={`line-clamp-2 min-h-[38px] max-w-[150px] text-sm font-extrabold leading-[1.15] ${
          dark ? 'text-white' : 'text-ink-900'
        }`}
      >
        {name}
      </div>
    </div>
  )
}
