import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarClock,
  Clock3,
  MapPin,
  Trophy,
  UsersRound,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, LoadingState } from '../components/LoadingState'
import {
  fetchMatchById,
  fetchMatchParticipants,
  fetchMatchTimeline,
  fetchTeams,
} from '../lib/data'
import {
  formatMatchDate,
  formatMatchTime,
  initials,
  isUpcomingMatch,
  matchScore,
} from '../lib/format'
import type {
  Match,
  MatchParticipant,
  MatchTimelineEvent,
  Team,
} from '../lib/types'

export function MatchDetailPage() {
  const { id = '' } = useParams()

  const matchQuery = useQuery({
    queryKey: ['match', id],
    queryFn: () => fetchMatchById(id),
    enabled: Boolean(id),
    retry: false,
  })

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })

  const match = matchQuery.data

  const participantsQuery = useQuery({
    queryKey: ['match-participants', match?.id],
    queryFn: () => fetchMatchParticipants(match!),
    enabled: Boolean(match),
    retry: false,
  })

  const timelineQuery = useQuery({
    queryKey: ['match-timeline', match?.id],
    queryFn: () => fetchMatchTimeline(match!),
    enabled: Boolean(match),
    retry: false,
  })

  if (matchQuery.isLoading) {
    return (
      <main className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-[1180px]">
          <LoadingState rows={6} />
        </div>
      </main>
    )
  }

  if (!match) {
    return (
      <main className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-[1000px]">
          <EmptyState
            title="Zápas nebyl nalezen"
            text="Je možné, že byl odstraněn nebo není dostupný pro aktuální sezónu."
          />
        </div>
      </main>
    )
  }

  const team = (teamsQuery.data ?? []).find((item) => item.id === match.team_id)
  const homeLogo =
    match.home_team_logo ||
    (/lichnov/i.test(match.home_team_name) ? team?.logo_url ?? null : null)
  const awayLogo =
    match.away_team_logo ||
    (/lichnov/i.test(match.away_team_name) ? team?.logo_url ?? null : null)

  const participants = participantsQuery.data ?? []
  const timeline = timelineQuery.data ?? []

  return (
    <main>
      <section className="px-5 pb-10 pt-14 md:px-8 md:pb-14 md:pt-20">
        <div className="mx-auto max-w-[1180px]">
          <Link
            to="/zapasy"
            className="inline-flex items-center gap-2 text-sm font-bold text-ink-500 transition hover:text-brand-900"
          >
            <ArrowLeft size={16} />
            Zpět na zápasy
          </Link>

          <MatchHero
            match={match}
            team={team}
            homeLogo={homeLogo}
            awayLogo={awayLogo}
          />
        </div>
      </section>

      <section className="px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[32px] border border-sand-200 bg-[#fbfaf6] p-6 sm:p-8">
            <SectionTitle
              eyebrow="Sestava"
              title="Kdo hrál"
              icon={<UsersRound size={18} />}
            />

            {participantsQuery.isLoading ? (
              <LoadingState rows={5} />
            ) : participants.length ? (
              <Lineups
                participants={participants}
                homeName={match.home_team_name}
                awayName={match.away_team_name}
              />
            ) : (
              <EmptyState
                title="Sestava není k dispozici"
                text="Pro tento zápas zatím backend nevrací údaje o hráčích."
              />
            )}
          </div>

          <div className="rounded-[32px] border border-sand-200 bg-[#fbfaf6] p-6 sm:p-8">
            <SectionTitle
              eyebrow="Průběh"
              title="Timeline zápasu"
              icon={<Clock3 size={18} />}
            />

            {timelineQuery.isLoading ? (
              <LoadingState rows={5} />
            ) : timeline.length ? (
              <Timeline events={timeline} />
            ) : (
              <EmptyState
                title="Průběh není k dispozici"
                text="Pro tento zápas zatím backend nevrací události zápasu."
              />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function MatchHero({
  match,
  team,
  homeLogo,
  awayLogo,
}: {
  match: Match
  team?: Team
  homeLogo: string | null
  awayLogo: string | null
}) {
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
    <div className="relative mt-8 overflow-hidden rounded-[40px] bg-brand-900 px-6 py-8 text-white shadow-soft sm:px-9 sm:py-10 lg:px-12 lg:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,146,63,.45),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(255,255,255,.08),transparent_26%)]" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
          <span>{team?.name || 'NFC Lichnov'}</span>
          <span>{match.state || (upcoming ? 'Nadcházející utkání' : 'Odehráno')}</span>
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <HeroTeam name={match.home_team_name} logo={homeLogo} align="right" />

          <div className="text-center">
            {upcoming ? (
              <div className="inline-block rounded-[26px] border border-white/10 bg-white/[0.07] px-6 py-5">
                <div className="text-3xl font-black tracking-[-0.055em]">
                  {formatMatchTime(match.playing_at)}
                </div>
                <div className="mt-1 text-xs font-bold text-white/55">
                  {formatMatchDate(match.playing_at)}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-5xl font-black tracking-[-0.07em] sm:text-6xl">
                  {score ?? match.final_score ?? '—'}
                </div>
                {(match.penalty_score_home != null || match.penalty_score_away != null) && (
                  <div className="mt-2 text-xs font-bold text-white/50">
                    Penalty {match.penalty_score_home ?? 0}:{match.penalty_score_away ?? 0}
                  </div>
                )}
              </div>
            )}
          </div>

          <HeroTeam name={match.away_team_name} logo={awayLogo} align="left" />
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-xs text-white/55">
          {match.competition_name && (
            <span className="inline-flex items-center gap-1.5">
              <Trophy size={14} />
              {match.competition_name}
            </span>
          )}

          {match.round && <span>{match.round}</span>}

          <span className="inline-flex items-center gap-1.5">
            <CalendarClock size={14} />
            {formatMatchDate(match.playing_at)}
          </span>

          {match.pitch_name && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} />
              {match.pitch_name}
            </span>
          )}

          {match.season && <span>Sezóna {match.season}</span>}
        </div>
      </div>
    </div>
  )
}

function HeroTeam({
  name,
  logo,
  align,
}: {
  name: string
  logo: string | null
  align: 'left' | 'right'
}) {
  const reverse = align === 'right'

  return (
    <div
      className={`flex items-center gap-4 ${
        reverse ? 'flex-row-reverse text-right' : 'text-left'
      }`}
    >
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-[24px] bg-white/95 ring-1 ring-white/20 sm:h-24 sm:w-24">
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-contain p-3" />
        ) : (
          <span className="text-sm font-black text-brand-900">{initials(name)}</span>
        )}
      </div>

      <div className="text-xl font-black leading-tight tracking-[-0.045em] sm:text-3xl">
        {name}
      </div>
    </div>
  )
}

function Lineups({
  participants,
  homeName,
  awayName,
}: {
  participants: MatchParticipant[]
  homeName: string
  awayName: string
}) {
  const home = participants.filter((person) => person.side === 'home')
  const away = participants.filter((person) => person.side === 'away')
  const other = participants.filter((person) => person.side == null)

  return (
    <div className="mt-6 space-y-6">
      <LineupGroup title={homeName} participants={home} />
      <LineupGroup title={awayName} participants={away} />

      {other.length > 0 && (
        <LineupGroup title="Další uvedení hráči" participants={other} />
      )}
    </div>
  )
}

function LineupGroup({
  title,
  participants,
}: {
  title: string
  participants: MatchParticipant[]
}) {
  const starters = participants.filter((person) => person.starter !== false)
  const substitutes = participants.filter((person) => person.starter === false)

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-sand-200 pb-3">
        <h3 className="text-sm font-extrabold text-brand-900">{title}</h3>
        <span className="text-xs font-semibold text-ink-500">{participants.length}</span>
      </div>

      {participants.length ? (
        <div className="mt-3 space-y-3">
          {starters.map((person) => (
            <ParticipantRow key={person.id} person={person} />
          ))}

          {substitutes.length > 0 && (
            <div className="pt-2">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-ink-500">
                Náhradníci
              </div>
              {substitutes.map((person) => (
                <ParticipantRow key={person.id} person={person} muted />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 text-sm text-ink-500">Bez dostupných údajů.</div>
      )}
    </div>
  )
}

function ParticipantRow({
  person,
  muted = false,
}: {
  person: MatchParticipant
  muted?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
        muted ? 'bg-sand-100/70' : 'bg-white ring-1 ring-sand-200'
      }`}
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-900 text-xs font-black text-white">
        {person.number ?? '—'}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-brand-900">
          {person.name}
          {person.captain && <span className="ml-1 text-brand-500">(C)</span>}
        </div>
        {(person.position || person.role) && (
          <div className="mt-0.5 truncate text-[11px] text-ink-500">
            {person.position || person.role}
          </div>
        )}
      </div>
    </div>
  )
}

function Timeline({ events }: { events: MatchTimelineEvent[] }) {
  return (
    <div className="relative mt-6">
      <div className="absolute bottom-4 left-[28px] top-4 w-px bg-sand-200 sm:left-1/2" />

      <div className="space-y-4">
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

function TimelineItem({ event }: { event: MatchTimelineEvent }) {
  const isAway = event.side === 'away'
  const type = event.type.toLowerCase()
  const eventName =
    type.includes('goal') || type.includes('gól')
      ? 'Gól'
      : type.includes('yellow')
        ? 'Žlutá karta'
        : type.includes('red')
          ? 'Červená karta'
          : type.includes('sub')
            ? 'Střídání'
            : event.label

  const score =
    event.score_home != null && event.score_away != null
      ? `${event.score_home}:${event.score_away}`
      : null

  return (
    <div className="relative grid min-h-16 grid-cols-[56px_1fr] gap-3 sm:grid-cols-[1fr_64px_1fr] sm:gap-5">
      <div
        className={`hidden sm:block ${
          isAway ? 'sm:col-start-3' : 'sm:col-start-1 sm:row-start-1'
        }`}
      >
        {!isAway && <EventCard event={event} title={eventName} score={score} align="right" />}
      </div>

      <div className="relative z-10 grid h-14 w-14 place-items-center rounded-full border-4 border-[#fbfaf6] bg-brand-900 text-center text-white shadow-sm sm:col-start-2 sm:row-start-1 sm:mx-auto">
        <div>
          <div className="text-sm font-black">{event.minute != null ? `${event.minute}'` : '•'}</div>
          {score && <div className="text-[9px] font-bold text-white/55">{score}</div>}
        </div>
      </div>

      <div className="sm:hidden">
        <EventCard event={event} title={eventName} score={score} align="left" />
      </div>

      {isAway && (
        <div className="hidden sm:col-start-3 sm:row-start-1 sm:block">
          <EventCard event={event} title={eventName} score={score} align="left" />
        </div>
      )}
    </div>
  )
}

function EventCard({
  event,
  title,
  score,
  align,
}: {
  event: MatchTimelineEvent
  title: string
  score: string | null
  align: 'left' | 'right'
}) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div className="inline-block max-w-full rounded-2xl bg-white px-4 py-3 ring-1 ring-sand-200">
        <div className="text-xs font-extrabold text-brand-900">
          {title}
          {score && <span className="ml-2 text-brand-500">{score}</span>}
        </div>

        {event.player_name && (
          <div className="mt-1 text-sm font-semibold text-ink-700">
            {event.player_name}
          </div>
        )}

        {event.secondary_player_name && (
          <div className="mt-1 text-[11px] text-ink-500">
            {event.secondary_player_name}
          </div>
        )}

        {!event.player_name && event.label !== title && (
          <div className="mt-1 text-[11px] text-ink-500">{event.label}</div>
        )}
      </div>
    </div>
  )
}

function SectionTitle({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string
  title: string
  icon: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-brand-500">
          {eyebrow}
        </div>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] text-brand-900">
          {title}
        </h2>
      </div>

      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        {icon}
      </div>
    </div>
  )
}
