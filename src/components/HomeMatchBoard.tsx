import { MapPin } from 'lucide-react'
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
    <div className="content-enter overflow-hidden rounded-[34px] border border-white/70 bg-white/82 shadow-[0_24px_70px_rgba(24,53,42,.10)] backdrop-blur-xl">
      <div className="border-b border-sand-200/80 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center gap-3">
          <ClubLogo
            src={activeTeam.logo_url}
            name={activeTeam.name}
            className="h-11 w-11 shrink-0"
          />
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-500">
              Zápasový přehled
            </div>
            <div className="mt-1 truncate text-xl font-extrabold tracking-[-0.04em] text-brand-900">
              {activeTeam.name}
            </div>
          </div>
        </div>

        <div
          className="mt-4 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                className={`shrink-0 rounded-[11px] px-3 py-2 text-[11px] font-bold transition-colors ${
                  active
                    ? 'bg-brand-900 text-white'
                    : 'bg-sand-100/80 text-ink-500 hover:bg-sand-200/80 hover:text-brand-900'
                }`}
              >
                {team.short_name || team.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="divide-y divide-sand-200/80">
        <MatchRow
          label="Poslední výsledek"
          match={resultMatch}
          kind="result"
        />
        <MatchRow
          label="Další zápas"
          match={upcomingMatch}
          kind="upcoming"
          venueLink
        />
      </div>
    </div>
  )
}

function MatchRow({
  label,
  match,
  kind,
  venueLink = false,
}: {
  label: string
  match: Match | null
  kind: 'result' | 'upcoming'
  venueLink?: boolean
}) {
  if (!match) {
    return (
      <div className="grid min-h-[150px] gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[130px_1fr] lg:items-center">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.17em] text-brand-500">
            {label}
          </div>
        </div>
        <div className="rounded-[20px] bg-sand-50 px-4 py-5 text-sm text-ink-500">
          {kind === 'result'
            ? 'Pro tento tým zatím nemáme poslední výsledek.'
            : 'Pro tento tým zatím nemáme další zápas.'}
        </div>
      </div>
    )
  }

  const score =
    kind === 'result'
      ? matchScore(
          match.score_home,
          match.score_away,
          match.manual_override,
          match.manual_score_home,
          match.manual_score_away,
          match.playing_at,
        )
      : null

  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-[130px_1fr_auto] lg:items-center">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.17em] text-brand-500">
            {label}
          </div>
          <div className="mt-1.5 text-[11px] font-semibold text-ink-500">
            {formatMatchDate(match.playing_at)}
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
          <TeamInline
            name={match.home_team_name}
            logo={match.home_team_logo}
            align="right"
          />

          <div className="min-w-[78px] text-center">
            {kind === 'result' ? (
              <div className="text-4xl font-black tracking-[-0.065em] text-brand-900">
                {score ?? '—'}
              </div>
            ) : (
              <>
                <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-500">
                  Výkop
                </div>
                <div className="mt-1 text-2xl font-black tracking-[-0.055em] text-brand-900">
                  {formatMatchDay(match.playing_at)}
                </div>
                <div className="mt-0.5 text-xs font-bold text-brand-500">
                  {formatMatchTime(match.playing_at)}
                </div>
              </>
            )}
          </div>

          <TeamInline
            name={match.away_team_name}
            logo={match.away_team_logo}
            align="left"
          />
        </div>

        <div className="flex items-center justify-between gap-3 lg:w-[150px] lg:flex-col lg:items-end">
          <div className="text-right text-[10px] leading-4 text-ink-500">
            {match.competition_name && <div>{match.competition_name}</div>}
            {match.round && <div>{match.round}</div>}
          </div>

          {venueLink && (
            <a
              href={matchVenueMapUrl(match)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[11px] bg-sand-100 px-3 py-2 text-[10px] font-bold text-brand-900 transition-colors hover:bg-brand-900 hover:text-white"
              title={`Otevřít hřiště domácího týmu ${match.home_team_name} v Google Maps`}
            >
              <MapPin size={12} />
              Hřiště
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function TeamInline({
  name,
  logo,
  align,
}: {
  name: string
  logo: string | null
  align: 'left' | 'right'
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2.5 ${
        align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
      }`}
    >
      {align === 'left' && (
        <ClubLogo src={logo} name={name} className="h-9 w-9 shrink-0" />
      )}
      <div className="line-clamp-2 text-xs font-extrabold leading-tight text-ink-900 sm:text-sm">
        {name}
      </div>
      {align === 'right' && (
        <ClubLogo src={logo} name={name} className="h-9 w-9 shrink-0" />
      )}
    </div>
  )
}
