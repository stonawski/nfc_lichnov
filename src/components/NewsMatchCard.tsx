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
  variant?: 'detail' | 'spotlight'
}) {
  const query = useQuery({
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
  const match = query.data
  if (!match) return null

  const clubLogo = teamsQuery.data?.find((team) => team.id === match.team_id)?.logo_url
  const homeLogo = match.home_team_logo || (/lichnov/i.test(match.home_team_name) ? clubLogo : null)
  const awayLogo = match.away_team_logo || (/lichnov/i.test(match.away_team_name) ? clubLogo : null)

  const upcoming = isUpcomingMatch(match.playing_at)
  const score = matchScore(
    match.score_home,
    match.score_away,
    match.manual_override,
    match.manual_score_home,
    match.manual_score_away,
    match.playing_at,
  ) ?? match.final_score

  const dark = variant === 'spotlight'

  return (
    <div className={dark
      ? 'mt-6 max-w-[640px] rounded-[20px] border border-white/20 bg-[#09291b]/70 p-4 shadow-[0_12px_32px_rgba(2,23,13,.14)] backdrop-blur-md sm:p-5'
      : 'my-9 rounded-[26px] border border-sand-200 bg-[#f7f7f2] p-5 shadow-[0_12px_30px_rgba(24,53,42,.05)] sm:p-7'
    }>
      <div className={`mb-4 flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] ${dark ? 'text-[#a7dfb8]' : 'text-brand-700'}`}>
        <CalendarDays size={13} />
        {upcoming ? 'Následující zápas' : 'Odehraný zápas'}
        <span className={dark ? 'text-white/55' : 'text-ink-500'}>· {formatMatchDate(match.playing_at)}</span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-5">
        <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
          <ClubLogo src={homeLogo} name={match.home_team_name} size="sm" />
          <span className={`text-xs font-extrabold leading-snug sm:text-sm ${dark ? 'text-white' : 'text-brand-900'}`}>
            {match.home_team_name}
          </span>
        </div>
        <span className={`min-w-[52px] text-center text-xl font-black tracking-tight ${dark ? 'text-white' : 'text-brand-900'}`}>
          {upcoming ? 'VS' : score || '–'}
        </span>
        <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row-reverse sm:text-right">
          <ClubLogo src={awayLogo} name={match.away_team_name} size="sm" />
          <span className={`text-xs font-extrabold leading-snug sm:text-sm ${dark ? 'text-white' : 'text-brand-900'}`}>
            {match.away_team_name}
          </span>
        </div>
      </div>

      {!dark && (
        <Link to={`/zapasy/${match.id}`} className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-500">
          Detail zápasu <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  )
}
