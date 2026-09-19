import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatMatchDate, matchScore } from '../lib/format'
import type { TeamMatchSummary } from '../lib/types'
import { ClubLogo } from './ClubLogo'
import { EmptyState } from './LoadingState'

export function MatchCarousel({ items }: { items: TeamMatchSummary[] }) {
  const [index, setIndex] = useState(0)
  useEffect(() => setIndex(0), [items.length])
  if (!items.length) return <EmptyState title="Zápasy zatím nejsou k dispozici" text="Po připojení Supabase se zde automaticky zobrazí poslední výsledky jednotlivých týmů." />

  const active = items[Math.min(index, items.length - 1)]
  const score = active.match ? matchScore(active.match.score_home, active.match.score_away, active.match.manual_override, active.match.manual_score_home, active.match.manual_score_away) : null

  const move = (delta: number) => setIndex((current) => (current + delta + items.length) % items.length)

  return (
    <div className="rounded-[32px] border border-white/80 bg-white/88 p-4 shadow-soft backdrop-blur md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-500">{active.kind === 'upcoming' ? 'Další zápas' : active.kind === 'result' ? 'Poslední výsledek' : 'Tým'}</div>
          <div className="mt-1 text-xl font-extrabold tracking-[-0.035em] text-brand-900">{active.team.name}</div>
        </div>
        <div className="flex gap-2">
          <button type="button" aria-label="Předchozí tým" onClick={() => move(-1)} className="grid h-10 w-10 place-items-center rounded-2xl bg-sand-50 text-brand-900 ring-1 ring-sand-200 transition hover:bg-sand-100"><ChevronLeft size={18} /></button>
          <button type="button" aria-label="Další tým" onClick={() => move(1)} className="grid h-10 w-10 place-items-center rounded-2xl bg-sand-50 text-brand-900 ring-1 ring-sand-200 transition hover:bg-sand-100"><ChevronRight size={18} /></button>
        </div>
      </div>

      {active.match ? (
        <div className="mt-7">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
            <ClubSide name={active.match.home_team_name} logo={active.match.home_team_logo} align="right" />
            <div className="min-w-[78px] text-center">
              <div className="text-4xl font-black tracking-[-0.07em] text-brand-900 sm:text-5xl">{score ?? '—'}</div>
            </div>
            <ClubSide name={active.match.away_team_name} logo={active.match.away_team_logo} align="left" />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-medium text-ink-500">
            <span>{formatMatchDate(active.match.playing_at)}</span>
            {active.match.competition_name && <><span>•</span><span>{active.match.competition_name}</span></>}
            {active.match.round && <><span>•</span><span>{active.match.round}</span></>}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl bg-sand-50 p-6 text-sm text-ink-500">Pro tento tým momentálně nemáme zápas k zobrazení.</div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2" aria-label="Výběr týmu">
        {items.map((item, itemIndex) => (
          <button key={item.team.id} type="button" onClick={() => setIndex(itemIndex)} aria-label={`Zobrazit ${item.team.name}`} className={`h-2 rounded-full transition-all ${itemIndex === index ? 'w-7 bg-brand-500' : 'w-2 bg-sand-200 hover:bg-brand-500/40'}`} />
        ))}
      </div>
    </div>
  )
}

function ClubSide({ name, logo, align }: { name: string; logo: string | null; align: 'left' | 'right' }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      <ClubLogo src={logo} name={name} />
      <div className="min-w-0 text-sm font-bold leading-tight text-ink-900 sm:text-base">{name}</div>
    </div>
  )
}
