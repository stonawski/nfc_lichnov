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
  const clubSide = resolveClubSide(match, participants)
  const clubParticipants = participants.filter(
    (person) => person.side === clubSide || person.side == null,
  )
  const clubName =
    clubSide === 'home'
      ? match.home_team_name
      : clubSide === 'away'
        ? match.away_team_name
        : team?.name || 'NFC Lichnov'

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
        <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
          <div className="rounded-[32px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-7">
            <CompactSectionHeader label="Sestava" icon={<UsersRound size={18} />} />

            {participantsQuery.isLoading ? (
              <div className="mt-6">
                <LoadingState rows={5} />
              </div>
            ) : clubParticipants.length ? (
              <FormationPitch teamName={clubName} participants={clubParticipants} />
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Sestava není k dispozici"
                  text="Pro tento zápas zatím backend nevrací údaje o hráčích."
                />
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-7">
            <CompactSectionHeader label="Průběh" icon={<Clock3 size={18} />} />

            {timelineQuery.isLoading ? (
              <div className="mt-6">
                <LoadingState rows={5} />
              </div>
            ) : timeline.length ? (
              <Timeline events={timeline} />
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Průběh není k dispozici"
                  text="Pro tento zápas zatím backend nevrací události zápasu."
                />
              </div>
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

type FormationLine = 'goalkeeper' | 'defence' | 'midfield' | 'attack'

function FormationPitch({
  teamName,
  participants,
}: {
  teamName: string
  participants: MatchParticipant[]
}) {
  const explicitStarters = participants.filter((person) => person.starter === true)
  const starters =
    explicitStarters.length >= 7
      ? explicitStarters.slice(0, 11)
      : participants.filter((person) => person.starter !== false).slice(0, 11)

  const starterIds = new Set(starters.map((person) => person.id))
  const substitutes = participants.filter(
    (person) => person.starter === false || !starterIds.has(person.id),
  )

  const rows: Record<FormationLine, MatchParticipant[]> = {
    goalkeeper: [],
    defence: [],
    midfield: [],
    attack: [],
  }

  starters.forEach((person) => {
    rows[classifyPosition(person)].push(person)
  })

  if (!rows.goalkeeper.length && starters.length) {
    const goalkeeperIndex = starters.findIndex((person) => person.number === 1)
    if (goalkeeperIndex >= 0) {
      const goalkeeper = starters[goalkeeperIndex]
      Object.values(rows).forEach((line) => {
        const index = line.findIndex((person) => person.id === goalkeeper.id)
        if (index >= 0) line.splice(index, 1)
      })
      rows.goalkeeper.push(goalkeeper)
    }
  }

  const placements = [
    ...placeLine(rows.attack, 20),
    ...placeLine(rows.midfield, 43),
    ...placeLine(rows.defence, 66),
    ...placeLine(rows.goalkeeper, 88),
  ]

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold text-brand-900">{teamName}</div>
          <div className="mt-1 text-xs text-ink-500">
            Základní sestava {starters.length ? `· ${starters.length} hráčů` : ''}
          </div>
        </div>

        <div className="rounded-full bg-brand-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">
          NFC
        </div>
      </div>

      <div className="relative min-h-[540px] overflow-hidden rounded-[30px] bg-[#0e2d20] shadow-inner sm:min-h-[620px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.16),transparent_36%),linear-gradient(180deg,rgba(6,22,15,.22),rgba(6,22,15,.72))]" />

        <div className="absolute inset-x-[4%] bottom-[3%] top-[4%] origin-bottom [clip-path:polygon(8%_0,92%_0,100%_100%,0_100%)] bg-[repeating-linear-gradient(90deg,#1d6b45_0,#1d6b45_12.5%,#226f49_12.5%,#226f49_25%)] [transform:perspective(900px)_rotateX(7deg)]">
          <div className="absolute inset-[3%] border-2 border-white/55" />
          <div className="absolute left-[3%] right-[3%] top-1/2 border-t-2 border-white/50" />
          <div className="absolute left-1/2 top-1/2 h-[17%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-white/50" />
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/55" />

          <div className="absolute left-[25%] right-[25%] top-[3%] h-[16%] border-x-2 border-b-2 border-white/50" />
          <div className="absolute left-[35%] right-[35%] top-[3%] h-[7%] border-x-2 border-b-2 border-white/50" />
          <div className="absolute left-1/2 top-[13%] h-2 w-2 -translate-x-1/2 rounded-full bg-white/55" />

          <div className="absolute bottom-[3%] left-[25%] right-[25%] h-[16%] border-x-2 border-t-2 border-white/50" />
          <div className="absolute bottom-[3%] left-[35%] right-[35%] h-[7%] border-x-2 border-t-2 border-white/50" />
          <div className="absolute bottom-[13%] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/55" />
        </div>

        <div className="absolute inset-x-[5%] bottom-[4%] top-[4%]">
          {placements.map(({ player, x, y }) => (
            <PitchPlayer key={player.id} player={player} x={x} y={y} />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#081d15]/85 to-transparent" />
      </div>

      {substitutes.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
            Náhradníci
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {substitutes.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-sand-200"
              >
                <PlayerAvatar player={person} small />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-brand-900">
                    {person.name}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-ink-500">
                    {[person.number != null ? `#${person.number}` : null, person.position]
                      .filter(Boolean)
                      .join(' · ') || 'Náhradník'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PitchPlayer({
  player,
  x,
  y,
}: {
  player: MatchParticipant
  x: number
  y: number
}) {
  return (
    <div
      className="absolute z-10 w-[92px] -translate-x-1/2 -translate-y-1/2 text-center sm:w-[108px]"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <PlayerAvatar player={player} />

      <div className="relative -mt-1 rounded-xl bg-brand-900 px-2 py-1.5 text-white shadow-lg ring-1 ring-white/15">
        <div className="truncate text-[9px] font-extrabold leading-none sm:text-[10px]">
          {player.number != null && (
            <span className="mr-1 text-white/55">{player.number}</span>
          )}
          {shortPlayerName(player.name)}
        </div>
        {player.captain && (
          <div className="absolute -right-1.5 -top-2 rounded-full bg-[#e8d9a9] px-1.5 py-0.5 text-[8px] font-black text-brand-900">
            C
          </div>
        )}
      </div>
    </div>
  )
}

function PlayerAvatar({
  player,
  small = false,
}: {
  player: MatchParticipant
  small?: boolean
}) {
  const size = small ? 'h-9 w-9' : 'h-12 w-12 sm:h-14 sm:w-14'

  return (
    <div
      className={`mx-auto grid ${size} shrink-0 place-items-center overflow-hidden rounded-full bg-[#f8f4e8] text-xs font-black text-brand-900 shadow-lg ring-2 ring-white/80`}
    >
      {player.photo_url ? (
        <img
          src={player.photo_url}
          alt=""
          className="h-full w-full object-cover object-top"
        />
      ) : (
        initials(player.name)
      )}
    </div>
  )
}

function classifyPosition(player: MatchParticipant): FormationLine {
  const value = (player.position || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('cs-CZ')

  if (
    value.includes('gk') ||
    value.includes('goal') ||
    value.includes('brankar')
  ) {
    return 'goalkeeper'
  }

  if (
    value.includes('df') ||
    value.includes('def') ||
    value.includes('obr') ||
    value.includes('back')
  ) {
    return 'defence'
  }

  if (
    value.includes('fw') ||
    value.includes('st') ||
    value.includes('forward') ||
    value.includes('striker') ||
    value.includes('utoc')
  ) {
    return 'attack'
  }

  return 'midfield'
}

function placeLine(players: MatchParticipant[], y: number) {
  if (!players.length) return []

  const start = players.length === 1 ? 50 : players.length === 2 ? 34 : 16
  const end = players.length === 1 ? 50 : players.length === 2 ? 66 : 84
  const step = players.length <= 1 ? 0 : (end - start) / (players.length - 1)

  return players.map((player, index) => ({
    player,
    x: start + step * index,
    y,
  }))
}

function shortPlayerName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return name
  return parts[parts.length - 1]
}

function resolveClubSide(
  match: Match,
  participants: MatchParticipant[],
): 'home' | 'away' | null {
  if (/lichnov/i.test(match.home_team_name)) return 'home'
  if (/lichnov/i.test(match.away_team_name)) return 'away'

  const homeCount = participants.filter((person) => person.side === 'home').length
  const awayCount = participants.filter((person) => person.side === 'away').length
  if (homeCount && !awayCount) return 'home'
  if (awayCount && !homeCount) return 'away'

  return null
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
        {!isAway && (
          <EventCard event={event} title={eventName} score={score} align="right" />
        )}
      </div>

      <div className="relative z-10 grid h-14 w-14 place-items-center rounded-full border-4 border-[#fbfaf6] bg-brand-900 text-center text-white shadow-sm sm:col-start-2 sm:row-start-1 sm:mx-auto">
        <div>
          <div className="text-sm font-black">
            {event.minute != null ? `${event.minute}'` : '•'}
          </div>
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
          <div className="mt-1 text-sm font-semibold text-ink-900">
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

function CompactSectionHeader({
  label,
  icon,
}: {
  label: string
  icon: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-brand-500">
        {label}
      </div>

      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        {icon}
      </div>
    </div>
  )
}
