import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ClubLogo } from './ClubLogo'
import { fetchMatchById, fetchTeams } from '../lib/data'
import { formatMatchDate, isUpcomingMatch, matchScore } from '../lib/format'

export function NewsMatchCard({
  matchId,
  variant = 'detail',
}: {
  matchId: string
  variant?: 'detail' | 'corner'
}) {
  const matchQuery = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => fetchMatchById(matchId),
    enabled: Boolean(matchId),
    retry: false,
  })
  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })
  const match = matchQuery.data
  if (!match) return null

  const clubLogo = teamsQuery.data?.find((team) => team.id === match.team_id)?.logo_url
  const homeLogo = match.home_team_logo || (/lichnov/i.test(match.home_team_name) ? clubLogo : null)
  const awayLogo = match.away_team_logo || (/lichnov/i.test(match.away_team_name) ? clubLogo : null)

  const upcoming = isUpcomingMatch(match.playing_at)
  const result = matchScore(
    match.score_home,
    match.score_away,
    match.manual_override,
    match.manual_score_home,
    match.manual_score_away,
    match.playing_at,
  ) ?? (upcoming ? null : match.final_score)
  const score = upcoming ? 'VS' : result || '–'

  if (variant === 'corner') {
    return (
      <div
        className="mt-8 flex w-fit shrink-0 self-end items-center gap-3 text-white lg:absolute lg:bottom-16 lg:right-8 lg:mt-0 xl:right-12"
        aria-label={`${match.home_team_name} ${score} ${match.away_team_name}`}
      >
        <ClubLogo src={homeLogo} name={match.home_team_name} size="md" />
        <span className="min-w-[60px] text-center text-3xl font-black tracking-[-0.045em] drop-shadow-[0_3px_12px_rgba(0,0,0,.55)] sm:text-4xl">
          {score}
        </span>
        <ClubLogo src={awayLogo} name={match.away_team_name} size="md" />
      </div>
    )
  }

  return (
    <div className="my-9 rounded-[26px] border border-sand-200 bg-[#f7f7f2] p-5 shadow-[0_12px_30px_rgba(24,53,42,.05)] sm:p-7">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-brand-700">
        <CalendarDays size={13} />
        {upcoming ? 'Následující zápas' : 'Odehraný zápas'}
        <span className="text-ink-500">· {formatMatchDate(match.playing_at)}</span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-5">
        <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
          <ClubLogo src={homeLogo} name={match.home_team_name} size="sm" />
          <span className="text-xs font-extrabold leading-snug text-brand-900 sm:text-sm">
            {match.home_team_name}
          </span>
        </div>
        <span className="min-w-[52px] text-center text-xl font-black tracking-tight text-brand-900">
          {score}
        </span>
        <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row-reverse sm:text-right">
          <ClubLogo src={awayLogo} name={match.away_team_name} size="sm" />
          <span className="text-xs font-extrabold leading-snug text-brand-900 sm:text-sm">
            {match.away_team_name}
          </span>
        </div>
      </div>

      <Link to={`/zapasy/${match.id}`} className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-500">
        Detail zápasu <ArrowUpRight size={14} />
      </Link>
    </div>
  )
}
