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
  variant?: 'detail' | 'corner' | 'thumbnail' | 'hero'
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
  if (variant === 'thumbnail' || variant === 'hero') {
    const isHero = variant === 'hero'
    return (
      <div
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-white ${isHero ? 'px-2 sm:px-6' : 'bg-[linear-gradient(180deg,rgba(5,24,14,.10),rgba(5,24,14,.28)_48%,rgba(5,24,14,.50))] px-5'}`}
        role="img"
        aria-label={`${match.home_team_name} ${score} ${match.away_team_name}`}
      >
        <div className={`grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center ${isHero ? 'gap-1 sm:gap-4' : 'gap-3 sm:gap-5'}`}>
          <div className="flex justify-center drop-shadow-[0_6px_16px_rgba(0,0,0,.55)]">
            <ClubLogo src={homeLogo} name={match.home_team_name} size={isHero ? 'hero' : 'lg'} />
          </div>
          <span className={`text-center font-black tracking-[-0.055em] drop-shadow-[0_4px_16px_rgba(0,0,0,.85)] ${isHero ? 'min-w-[55px] text-4xl sm:text-6xl lg:text-7xl' : 'min-w-[70px] text-4xl sm:text-5xl'}`}>
            {score}
          </span>
          <div className="flex justify-center drop-shadow-[0_6px_16px_rgba(0,0,0,.55)]">
            <ClubLogo src={awayLogo} name={match.away_team_name} size={isHero ? 'hero' : 'lg'} />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'corner') {
    return (
      <>
        <div
          className="relative z-10 mt-8 flex w-fit shrink-0 self-end items-center gap-4 text-white xl:absolute xl:bottom-16 xl:right-12 xl:mt-0"
          aria-label={`${match.home_team_name} ${score} ${match.away_team_name}`}
        >
          <ClubLogo src={homeLogo} name={match.home_team_name} size="lg" />
          <span className="min-w-[78px] text-center text-4xl font-black tracking-[-0.055em] drop-shadow-[0_4px_16px_rgba(0,0,0,.75)] sm:text-[3.5rem]">
            {score}
          </span>
          <ClubLogo src={awayLogo} name={match.away_team_name} size="lg" />
        </div>
      </>
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
