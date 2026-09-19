import { useQuery } from '@tanstack/react-query'
import { useMemo, useState, type ReactNode } from 'react'
import { EmptyState, LoadingState } from '../components/LoadingState'
import { fetchCurrentMatches, fetchTeams } from '../lib/data'
import { formatMatchDate, matchScore } from '../lib/format'

export function MatchesPage() {
  const [teamId, setTeamId] = useState('all')
  const teamsQuery = useQuery({ queryKey: ['teams'], queryFn: fetchTeams, retry: false })
  const matchesQuery = useQuery({ queryKey: ['matches', 'current'], queryFn: fetchCurrentMatches, retry: false })
  const teamMap = useMemo(() => new Map((teamsQuery.data ?? []).map((team) => [team.id, team])), [teamsQuery.data])
  const matches = (matchesQuery.data ?? []).filter((match) => teamId === 'all' || match.team_id === teamId)
  return <main className="px-5 py-16 md:px-8 md:py-24"><div className="mx-auto max-w-[1100px]"><Header eyebrow="Zápasy" title="Program a výsledky" /><div className="mb-8 flex flex-wrap gap-2"><Filter active={teamId === 'all'} onClick={() => setTeamId('all')}>Všechny</Filter>{(teamsQuery.data ?? []).map(team => <Filter key={team.id} active={teamId === team.id} onClick={() => setTeamId(team.id)}>{team.name}</Filter>)}</div>{matchesQuery.isLoading ? <LoadingState rows={6}/> : matches.length ? <div className="space-y-3">{matches.map(match => <div key={match.id} className="grid gap-4 rounded-4xl border border-sand-200 bg-white p-5 md:grid-cols-[150px_1fr_100px] md:items-center"><div><div className="text-xs font-bold text-brand-500">{teamMap.get(match.team_id)?.name}</div><div className="mt-1 text-xs text-ink-500">{formatMatchDate(match.playing_at)}</div></div><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm font-semibold"><span className="text-right">{match.home_team_name}</span><span className="text-2xl font-black text-brand-900">{matchScore(match.score_home,match.score_away,match.manual_override,match.manual_score_home,match.manual_score_away) ?? '—'}</span><span>{match.away_team_name}</span></div><div className="text-right text-xs text-ink-500">{match.round || ''}</div></div>)}</div> : <EmptyState title="Žádné zápasy" text="Pro vybraný filtr nejsou k dispozici zápasy." />}</div></main>
}
function Header({eyebrow,title}:{eyebrow:string;title:string}){return <div className="mb-10"><div className="text-xs font-bold uppercase tracking-[.18em] text-brand-500">{eyebrow}</div><h1 className="mt-3 text-5xl font-black tracking-[-.06em] text-brand-900">{title}</h1></div>}
function Filter({active,onClick,children}:{active:boolean;onClick:()=>void;children:ReactNode}){return <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active?'bg-brand-900 text-white':'bg-white text-ink-900 ring-1 ring-sand-200 hover:bg-sand-100'}`}>{children}</button>}
