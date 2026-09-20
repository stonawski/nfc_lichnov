import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { CalendarClock, CalendarDays } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { ClubLogo } from '../components/ClubLogo'
import { EmptyState, LoadingState } from '../components/LoadingState'
import { PlayerStripCarousel } from '../components/PlayerStripCarousel'
import { StandingsTable } from '../components/StandingsTable'
import {
  fetchDisplayPlayersByTeam,
  fetchMatchesByTeam,
  fetchStaffByTeam,
  fetchStandingsByTeam,
  fetchTeamBySlug,
} from '../lib/data'
import {
  formatMatchDate,
  formatMatchDay,
  formatMatchTime,
  isUpcomingMatch,
  matchScore,
} from '../lib/format'
import type { Match } from '../lib/types'

export function TeamPage() {
  const { slug = '' } = useParams()
  const teamQuery = useQuery({
    queryKey: ['team', slug],
    queryFn: () => fetchTeamBySlug(slug),
    retry: false,
  })
  const team = teamQuery.data

  const matchesQuery = useQuery({
    queryKey: ['team-matches', team?.id],
    queryFn: () => fetchMatchesByTeam(team!.id),
    enabled: Boolean(team?.id),
    retry: false,
  })
  const standingsQuery = useQuery({
    queryKey: ['standings', team?.id],
    queryFn: () => fetchStandingsByTeam(team!.id),
    enabled: Boolean(team?.id),
    retry: false,
  })
  const playersQuery = useQuery({
    queryKey: ['players', team?.id],
    queryFn: () => fetchDisplayPlayersByTeam(team!),
    enabled: Boolean(team?.id),
    retry: false,
  })
  const staffQuery = useQuery({
    queryKey: ['staff', team?.id],
    queryFn: () => fetchStaffByTeam(team!.id),
    enabled: Boolean(team?.id),
    retry: false,
  })

  if (teamQuery.isLoading) {
    return (
      <PageWrap>
        <LoadingState rows={4} />
      </PageWrap>
    )
  }

  if (!team) {
    return (
      <PageWrap>
        <EmptyState title="Tým nebyl nalezen" text="Zkontroluj adresu nebo vyber tým z navigace." />
      </PageWrap>
    )
  }

  const matches = matchesQuery.data ?? []
  const now = Date.now()
  const latest = matches
    .filter((match) => new Date(match.playing_at).getTime() <= now)
    .sort((a, b) => +new Date(b.playing_at) - +new Date(a.playing_at))[0]
  const next = matches
    .filter((match) => new Date(match.playing_at).getTime() > now)
    .sort((a, b) => +new Date(a.playing_at) - +new Date(b.playing_at))[0]

  return (
    <main>
      <section className="px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1240px] rounded-[42px] bg-brand-900 p-7 text-white sm:p-10 md:p-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <ClubLogo src={team.logo_url} name={team.name} size="lg" />
              <div className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                NFC Lichnov · {team.season || 'aktuální sezóna'}
              </div>
              <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] sm:text-6xl">{team.name}</h1>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[580px]">
              <HeroMatch label="Poslední výsledek" match={latest} kind="result" />
              <HeroMatch label="Další zápas" match={next} kind="upcoming" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1240px]">
          <PageHeading eyebrow="Program" title="Zápasy" />

          {matchesQuery.isLoading ? (
            <LoadingState rows={4} />
          ) : matches.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {matches.slice(0, 12).map((match) => {
                const upcoming = isUpcomingMatch(match.playing_at)
                const score = matchScore(
                  match.score_home,
                  match.score_away,
                  match.manual_override,
                  match.manual_score_home,
                  match.manual_score_away,
                  match.playing_at,
                )

                return (
                  <div key={match.id} className="rounded-4xl border border-sand-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-4 text-xs text-ink-500">
                      <span>{upcoming ? 'Nadcházející utkání' : formatMatchDate(match.playing_at)}</span>
                      <span>{match.round || match.competition_name || ''}</span>
                    </div>

                    <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm font-bold">
                      <span className="text-right">{match.home_team_name}</span>

                      {upcoming ? (
                        <div className="min-w-[82px] rounded-2xl bg-brand-50 px-3 py-2 text-center ring-1 ring-brand-500/10">
                          <div className="text-lg font-black tracking-[-0.04em] text-brand-900">
                            {formatMatchDay(match.playing_at)}
                          </div>
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-brand-500">
                            <CalendarClock size={12} />
                            {formatMatchTime(match.playing_at)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-2xl font-black tracking-tight text-brand-900">{score ?? '—'}</span>
                      )}

                      <span>{match.away_team_name}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState title="Žádné zápasy" text="Pro tuto kategorii zatím nejsou k dispozici zápasy." />
          )}
        </div>
      </section>

      {(standingsQuery.data?.length ?? 0) > 0 && (
        <section className="bg-sand-100 px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1000px]">
            <PageHeading eyebrow="Soutěž" title="Tabulka" />
            <StandingsTable rows={standingsQuery.data ?? []} />
          </div>
        </section>
      )}

      <section className="py-10 md:py-16">
        {playersQuery.isLoading ? (
          <div className="px-5 md:px-8">
            <div className="mx-auto max-w-[1240px]">
              <PageHeading eyebrow="Kabina" title="Hráči" />
              <LoadingState rows={4} />
            </div>
          </div>
        ) : playersQuery.data?.length ? (
          <PlayerStripCarousel team={team} players={playersQuery.data} />
        ) : (
          <div className="px-5 md:px-8">
            <div className="mx-auto max-w-[1240px]">
              <PageHeading eyebrow="Kabina" title="Hráči" />
              <EmptyState
                title="Soupiska zatím není k dispozici"
                text="Hráči se zobrazí po synchronizaci nebo ručním doplnění."
              />
            </div>
          </div>
        )}
      </section>

      <section className="px-5 pb-12 md:px-8 md:pb-20">
        <div className="mx-auto max-w-[1240px]">
          <PageHeading eyebrow="Realizační tým" title="Trenéři a vedení týmu" />

          {staffQuery.data?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {staffQuery.data.map((person) => (
                <div key={person.id} className="rounded-4xl border border-sand-200 bg-white p-6">
                  <div className="text-xl font-extrabold text-brand-900">{person.name}</div>
                  <div className="mt-1 text-sm text-ink-500">{person.role || 'Realizační tým'}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Realizační tým zatím není doplněn"
              text="Tato část se naplní z tabulky staff."
            />
          )}
        </div>
      </section>
    </main>
  )
}

function PageWrap({ children }: { children: ReactNode }) {
  return (
    <main className="px-5 py-20 md:px-8">
      <div className="mx-auto max-w-[1000px]">{children}</div>
    </main>
  )
}

function PageHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">{eyebrow}</div>
      <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-brand-900 sm:text-5xl">{title}</h2>
    </div>
  )
}

function HeroMatch({
  label,
  match,
  kind,
}: {
  label: string
  match?: Match
  kind: 'result' | 'upcoming'
}) {
  if (!match) {
    return (
      <div className="rounded-4xl border border-white/10 bg-white/[0.07] p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{label}</div>
        <div className="mt-4 text-sm text-white/50">Není k dispozici</div>
      </div>
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
    <div className="rounded-4xl border border-white/10 bg-white/[0.07] p-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{label}</div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{match.home_team_name}</div>
          <div className="mt-1 truncate text-sm font-semibold">{match.away_team_name}</div>
        </div>

        {kind === 'result' ? (
          <div className="shrink-0 text-3xl font-black tracking-[-0.06em]">{score ?? '—'}</div>
        ) : (
          <div className="shrink-0 rounded-2xl bg-white/10 px-3 py-2 text-center">
            <div className="text-lg font-black">{formatMatchDay(match.playing_at)}</div>
            <div className="text-[11px] font-bold text-white/65">{formatMatchTime(match.playing_at)}</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
        <CalendarDays size={14} />
        {formatMatchDate(match.playing_at)}
      </div>
    </div>
  )
}
