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
    <div className="content-enter overflow-hidden rounded-[32px] border border-sand-200 bg-[#fbfaf6] shadow-soft">
      <div className="border-b border-sand-200 px-4 py-4 sm:px-5">
        <div
          className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  active
                    ? 'bg-brand-900 text-white'
                    : 'bg-sand-100 text-ink-500 hover:bg-sand-200 hover:text-brand-900'
                }`}
              >
                {team.short_name || team.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 md:divide-x md:divide-sand-200">
        <MatchPanel
          label="Poslední výsledek"
          match={resultMatch}
          kind="result"
        />
        <MatchPanel
          label="Nadcházející zápas"
          match={upcomingMatch}
          kind="upcoming"
          venueLink
        />
      </div>
    </div>
  )
}

function MatchPanel({
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
      <div className="min-h-[300px] p-5 sm:p-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
          {label}
        </div>
        <div className="mt-16 rounded-[22px] bg-sand-50 px-5 py-7 text-center text-sm text-ink-500">
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
    <div className="min-h-[300px] p-5 sm:p-6">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
        {label}
      </div>

      <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-5">
        <ClubSide
          name={match.home_team_name}
          logo={match.home_team_logo}
        />

        <div className="min-w-[92px] text-center">
          {kind === 'upcoming' ? (
            <>
              <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-500">
                Výkop
              </div>
              <div className="mt-1 text-3xl font-black tracking-[-0.06em] text-brand-900">
                {formatMatchDay(match.playing_at)}
              </div>
              <div className="mt-1 text-xs font-bold text-brand-500">
                {formatMatchTime(match.playing_at)}
              </div>
            </>
          ) : (
            <div className="text-5xl font-black tracking-[-0.07em] text-brand-900">
              {score ?? '—'}
            </div>
          )}
        </div>

        <ClubSide
          name={match.away_team_name}
          logo={match.away_team_logo}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-sand-200 pt-4 text-center text-xs font-medium text-ink-500">
        <span>{formatMatchDate(match.playing_at)}</span>
        {match.competition_name && <span>· {match.competition_name}</span>}
        {match.round && <span>· {match.round}</span>}
        {venueLink && (
          <a
            href={matchVenueMapUrl(match)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-brand-700 transition-colors hover:text-brand-500"
            title={`Otevřít hřiště domácího týmu ${match.home_team_name} v Google Maps`}
          >
            <MapPin size={13} />
            {match.pitch_name || `Hřiště — ${match.home_team_name}`}
          </a>
        )}
      </div>
    </div>
  )
}

function ClubSide({
  name,
  logo,
}: {
  name: string
  logo: string | null
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2.5 text-center">
      <ClubLogo src={logo} name={name} />
      <div className="line-clamp-2 min-h-[36px] max-w-[145px] text-sm font-bold leading-[1.15] text-ink-900">
        {name}
      </div>
    </div>
  )
}
