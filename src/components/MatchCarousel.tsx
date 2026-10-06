import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { useEffect, useRef, useState, type TouchEvent as ReactTouchEvent } from 'react'
import { formatMatchDate, formatMatchDay, formatMatchTime, matchScore, matchVenueMapUrl } from '../lib/format'
import type { TeamMatchSummary } from '../lib/types'
import { ClubLogo } from './ClubLogo'
import { EmptyState } from './LoadingState'

export function MatchCarousel({
  items,
  venueLinks = false,
}: {
  items: TeamMatchSummary[]
  venueLinks?: boolean
}) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => setIndex(0), [items.length])

  if (!items.length) {
    return (
      <EmptyState
        title="Zápasy zatím nejsou k dispozici"
        text="Po připojení Supabase se zde automaticky zobrazí poslední výsledky jednotlivých týmů."
      />
    )
  }

  const active = items[Math.min(index, items.length - 1)]
  const score = active.match
    ? matchScore(
        active.match.score_home,
        active.match.score_away,
        active.match.manual_override,
        active.match.manual_score_home,
        active.match.manual_score_away,
        active.match.playing_at,
      )
    : null

  const move = (delta: number) => {
    setIndex((current) => (current + delta + items.length) % items.length)
  }

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current
    const end = event.changedTouches[0]?.clientX ?? null
    touchStartX.current = null

    if (start == null || end == null) return
    const distance = end - start
    if (Math.abs(distance) < 45) return

    move(distance < 0 ? 1 : -1)
  }

  return (
    <div
      className="content-enter min-h-[330px] rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 shadow-soft sm:p-6"
      role="region"
      aria-roledescription="carousel"
      aria-label="Zápasy týmů NFC Lichnov"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') move(-1)
        if (event.key === 'ArrowRight') move(1)
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-start justify-between gap-5">
        <div
          key={`heading-${active.team.id}-${index}`}
          className="carousel-content-enter"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
            {active.kind === 'upcoming' ? 'Další zápas' : active.kind === 'result' ? 'Poslední výsledek' : 'Tým'}
          </div>
          <div className="mt-1.5 text-xl font-extrabold tracking-[-0.035em] text-brand-900">{active.team.name}</div>
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="Předchozí tým"
            onClick={() => move(-1)}
            className="grid h-11 w-11 place-items-center rounded-full text-ink-500 ring-1 ring-sand-200 transition hover:bg-sand-100 hover:text-brand-900"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            aria-label="Další tým"
            onClick={() => move(1)}
            className="grid h-11 w-11 place-items-center rounded-full text-ink-500 ring-1 ring-sand-200 transition hover:bg-sand-100 hover:text-brand-900"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div
        key={`${active.team.id}-${active.kind}-${active.match?.id ?? 'empty'}`}
        className="carousel-content-enter"
        aria-live="polite"
      >
        {active.match ? (
          <>
            <div className="mt-9 grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-6">
              <ClubSide name={active.match.home_team_name} logo={active.match.home_team_logo} align="right" />

              <div className="min-w-[96px] text-center">
                {active.kind === 'upcoming' ? (
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-500">Výkop</div>
                    <div className="mt-1 text-3xl font-black tracking-[-0.06em] text-brand-900">
                      {formatMatchDay(active.match.playing_at)}
                    </div>
                    <div className="mt-1 text-xs font-bold text-brand-500">
                      {formatMatchTime(active.match.playing_at)}
                    </div>
                  </div>
                ) : (
                  <div className="text-5xl font-black tracking-[-0.07em] text-brand-900">{score ?? '—'}</div>
                )}
              </div>

              <ClubSide name={active.match.away_team_name} logo={active.match.away_team_logo} align="left" />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-sand-200 pt-4 text-center text-xs font-medium text-ink-500">
              <span>{formatMatchDate(active.match.playing_at)}</span>
              {active.match.competition_name && <span>· {active.match.competition_name}</span>}
              {active.match.round && <span>· {active.match.round}</span>}
              {venueLinks && active.kind === 'upcoming' && (
                <a
                  href={matchVenueMapUrl(active.match)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-brand-700 transition-colors hover:text-brand-500"
                  title={`Otevřít hřiště domácího týmu ${active.match.home_team_name} v Google Maps`}
                >
                  <MapPin size={13} />
                  {active.match.pitch_name || `Hřiště — ${active.match.home_team_name}`}
                </a>
              )}
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-2xl bg-sand-50 p-5 text-sm text-ink-500">
            Pro tento tým momentálně nemáme zápas k zobrazení.
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2" aria-label="Výběr týmu">
        {items.map((item, itemIndex) => (
          <button
            key={item.team.id}
            type="button"
            onClick={() => setIndex(itemIndex)}
            aria-label={`Zobrazit ${item.team.name}`}
            aria-current={itemIndex === index ? 'true' : undefined}
            className="grid h-9 w-9 place-items-center rounded-full"
          >
            <span
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-all ${
                itemIndex === index ? 'w-6 bg-brand-500' : 'w-1.5 bg-sand-200'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

function ClubSide({ name, logo, align }: { name: string; logo: string | null; align: 'left' | 'right' }) {
  return (
    <div className={`flex min-w-0 flex-col items-center gap-2.5 text-center ${align === 'right' ? '' : ''}`}>
      <ClubLogo src={logo} name={name} />
      <div className="line-clamp-2 min-h-[36px] max-w-[145px] text-sm font-bold leading-[1.15] text-ink-900">{name}</div>
    </div>
  )
}
