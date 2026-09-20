import type { Standing } from '../lib/types'
import { ClubLogo } from './ClubLogo'

export function StandingsTable({ rows, compact = false }: { rows: Standing[]; compact?: boolean }) {
  if (!rows.length) return null
  return (
    <div className="content-enter overflow-hidden rounded-4xl border border-sand-200 bg-white">
      <div className="grid grid-cols-[42px_1fr_48px_54px] items-center gap-2 border-b border-sand-200 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500 sm:grid-cols-[50px_1fr_64px_64px_80px]">
        <span>#</span><span>Tým</span><span className="text-center">Z</span><span className="text-center">B</span><span className="hidden text-center sm:block">Skóre</span>
      </div>
      {rows.map((row) => {
        const lichnov = /lichnov/i.test(row.team_name || row.club_name || '')
        return (
          <div key={row.id} className={`grid grid-cols-[42px_1fr_48px_54px] items-center gap-2 border-b border-sand-200/70 px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[50px_1fr_64px_64px_80px] ${lichnov ? 'bg-brand-50' : ''}`}>
            <div className={`font-extrabold ${lichnov ? 'text-brand-500' : 'text-ink-500'}`}>{row.rank ?? '—'}</div>
            <div className="flex min-w-0 items-center gap-2.5">
              {!compact && <ClubLogo src={row.club_logo} name={row.team_name} size="sm" />}
              <span className={`truncate font-semibold ${lichnov ? 'text-brand-900' : 'text-ink-900'}`}>{row.team_name || row.club_name}</span>
            </div>
            <div className="text-center text-ink-500">{row.matches_count ?? '—'}</div>
            <div className="text-center font-extrabold text-ink-900">{row.points ?? '—'}</div>
            <div className="hidden text-center text-ink-500 sm:block">{row.goals_for ?? '—'}:{row.goals_against ?? '—'}</div>
          </div>
        )
      })}
    </div>
  )
}
