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
        <div className="mx-auto grid max-w-[1180px] gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
          <div className="overflow-hidden rounded-[32px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-7">
            <CompactSectionHeader label="Sestava" icon={<UsersRound size={18} />} />

            {participantsQuery.isLoading ? (
              <div className="mt-6">
                <LoadingState rows={5} />
              </div>
            ) : clubParticipants.length ? (
              <FormationPitch
                teamName={clubName}
                participants={clubParticipants}
                events={timeline}
              />
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
  events,
}: {
  teamName: string
  participants: MatchParticipant[]
  events: MatchTimelineEvent[]
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
  const unassigned: MatchParticipant[] = []

  starters.forEach((person) => {
    const line = classifyPosition(person)
    if (line) rows[line].push(person)
    else unassigned.push(person)
  })

  if (!rows.goalkeeper.length && starters.length) {
    const goalkeeper =
      unassigned.find((person) => person.number === 1) ||
      unassigned[0]

    if (goalkeeper) {
      rows.goalkeeper.push(goalkeeper)
      unassigned.splice(unassigned.indexOf(goalkeeper), 1)
    }
  }

  while (rows.defence.length < 4 && unassigned.length) {
    rows.defence.push(unassigned.shift()!)
  }
  while (rows.midfield.length < 4 && unassigned.length) {
    rows.midfield.push(unassigned.shift()!)
  }
  while (unassigned.length) {
    rows.attack.push(unassigned.shift()!)
  }

  const placements = [
    ...placeLine(rows.attack, 17),
    ...placeLine(rows.midfield, 42),
    ...placeLine(rows.defence, 67),
    ...placeLine(rows.goalkeeper, 89),
  ]

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold text-brand-900">{teamName}</div>
          <div className="mt-1 text-xs text-ink-500">
            Základní sestava
          </div>
        </div>

        <div className="rounded-full bg-brand-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">
          NFC
        </div>
      </div>

      <div className="relative -mx-5 min-h-[590px] overflow-hidden bg-[#dce4de] shadow-inner sm:-mx-7 sm:min-h-[690px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,.96),rgba(246,247,244,.72)_30%,transparent_58%),linear-gradient(180deg,#eef1ee_0%,#dce3dd_42%,#cad8cf_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[38%] bg-[linear-gradient(180deg,rgba(255,255,255,.68),rgba(255,255,255,0))]" />

        <svg
          aria-hidden="true"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="broadcastPitchFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d8e1da" stopOpacity="0.74" />
              <stop offset="50%" stopColor="#c1d1c6" stopOpacity="0.80" />
              <stop offset="100%" stopColor="#a8c0b0" stopOpacity="0.90" />
            </linearGradient>
            <linearGradient id="broadcastPitchShade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#173d2d" stopOpacity="0.10" />
            </linearGradient>
            <filter id="broadcastPitchShadow" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="24" stdDeviation="22" floodColor="#18352a" floodOpacity="0.16" />
            </filter>
          </defs>

          <polygon
            points="270,72 730,72 1040,700 -40,700"
            fill="url(#broadcastPitchFill)"
            filter="url(#broadcastPitchShadow)"
          />

          <polygon points="270,72 390,72 280,700 -40,700" fill="#ffffff" opacity="0.09" />
          <polygon points="500,72 620,72 760,700 500,700" fill="#ffffff" opacity="0.07" />
          <polygon
            points="270,72 730,72 1040,700 -40,700"
            fill="url(#broadcastPitchShade)"
          />

          <g
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.72"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="286,88 714,88 1005,676 -5,676" />
            <line x1="142" y1="352" x2="858" y2="352" />
            <ellipse cx="500" cy="352" rx="112" ry="50" />
            <circle cx="500" cy="352" r="4" fill="#ffffff" fillOpacity="0.72" />

            <polygon points="382,88 618,88 654,204 346,204" />
            <polygon points="438,88 562,88 578,140 422,140" />
            <circle cx="500" cy="161" r="4" fill="#ffffff" fillOpacity="0.72" />

            <polygon points="246,488 754,488 840,676 160,676" />
            <polygon points="365,555 635,555 690,676 310,676" />
            <circle cx="500" cy="518" r="4" fill="#ffffff" fillOpacity="0.72" />

          </g>

          <path
            d="M 402 204 Q 500 246 598 204"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.52"
            strokeWidth="2"
          />
          <path
            d="M 325 488 Q 500 420 675 488"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.52"
            strokeWidth="2"
          />

          <path
            d="M 270 72 L -40 700"
            fill="none"
            stroke="#18352a"
            strokeOpacity="0.08"
            strokeWidth="18"
          />
          <path
            d="M 730 72 L 1040 700"
            fill="none"
            stroke="#18352a"
            strokeOpacity="0.05"
            strokeWidth="18"
          />
        </svg>

        <div className="pointer-events-none absolute inset-x-[1.5%] bottom-[2%] top-[5%]">
          {placements.map(({ player, x, y }) => (
            <PitchPlayer
              key={player.id}
              player={player}
              x={x}
              y={y}
              events={events}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-[10%] top-[3%] h-24 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.92),transparent_72%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#18352a]/10 to-transparent" />
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
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-bold text-brand-900">
                      {person.name}
                    </div>
                    <PlayerEventBadges player={person} events={events} compact />
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
  events,
}: {
  player: MatchParticipant
  x: number
  y: number
  events: MatchTimelineEvent[]
}) {
  return (
    <div
      className="absolute z-10 w-[98px] -translate-x-1/2 -translate-y-1/2 text-center sm:w-[118px]"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="relative mx-auto w-fit">
        <div className="flex h-14 w-14 items-end justify-center overflow-hidden rounded-[18px] bg-white/72 shadow-[0_8px_18px_rgba(24,53,42,0.12)] ring-1 ring-white sm:h-[68px] sm:w-[68px]">
          {player.photo_url ? (
            <img
              src={player.photo_url}
              alt=""
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_35%,#fff_0,#f4f1e8_52%,#e5e2d8_100%)] text-xs font-black text-brand-900 sm:text-sm">
              {initials(player.name)}
            </div>
          )}
        </div>

        <div className="absolute -right-5 top-1/2 -translate-y-1/2">
          <PlayerEventBadges player={player} events={events} />
        </div>
      </div>

      <div className="relative -mt-1.5 rounded-[7px] bg-[linear-gradient(180deg,#244a3b,#15382c)] px-2 py-1.5 text-white shadow-[0_6px_16px_rgba(24,53,42,0.24)] ring-1 ring-white/35">
        <div className="flex items-center justify-center gap-1 truncate text-[9px] font-extrabold leading-none sm:text-[10px]">
          {player.number != null && (
            <span className="text-white/65">{player.number}</span>
          )}
          <span className="truncate">{shortPlayerName(player.name)}</span>
          {player.captain && (
            <span className="shrink-0 rounded bg-[#e8d9a9] px-1 py-0.5 text-[7px] font-black text-brand-900">
              K
            </span>
          )}
        </div>
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
  const size = small ? 'h-9 w-9' : 'h-11 w-11 sm:h-14 sm:w-14'

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

function PlayerEventBadges({
  player,
  events,
  compact = false,
}: {
  player: MatchParticipant
  events: MatchTimelineEvent[]
  compact?: boolean
}) {
  const playerName = normalizePersonName(player.name)
  const playerEvents = events.filter(
    (event) => event.player_name && normalizePersonName(event.player_name) === playerName,
  )
  const goals = playerEvents.filter((event) => eventKind(event) === 'goal').length
  const yellows = playerEvents.filter((event) => eventKind(event) === 'yellow').length
  const reds = playerEvents.filter((event) => eventKind(event) === 'red').length

  if (!goals && !yellows && !reds) return null

  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-1'}`}>
      {goals > 0 && (
        <span
          className={`grid place-items-center rounded-full bg-white shadow-md ring-1 ring-black/5 ${
            compact ? 'h-5 min-w-5 px-1 text-[9px]' : 'h-6 min-w-6 px-1 text-[10px]'
          }`}
          title={goals === 1 ? 'Gól' : `${goals} góly`}
        >
          ⚽{goals > 1 ? goals : ''}
        </span>
      )}
      {yellows > 0 && (
        <span
          className={`rounded-[2px] bg-yellow-400 shadow-md ring-1 ring-black/10 ${
            compact ? 'h-4 w-2.5' : 'h-5 w-3.5'
          }`}
          title="Žlutá karta"
        />
      )}
      {reds > 0 && (
        <span
          className={`rounded-[2px] bg-red-600 shadow-md ring-1 ring-black/10 ${
            compact ? 'h-4 w-2.5' : 'h-5 w-3.5'
          }`}
          title="Červená karta"
        />
      )}
    </div>
  )
}

function classifyPosition(player: MatchParticipant): FormationLine | null {
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
    value === 'fw' ||
    value === 'st' ||
    value.includes('forward') ||
    value.includes('striker') ||
    value.includes('winger') ||
    value.includes('utoc')
  ) {
    return 'attack'
  }

  if (
    value.includes('mf') ||
    value.includes('mid') ||
    value.includes('zalo') ||
    value.includes('stred')
  ) {
    return 'midfield'
  }

  return null
}

function placeLine(players: MatchParticipant[], y: number) {
  if (!players.length) return []

  const [start, end] =
    y <= 22
      ? [players.length === 1 ? 50 : 27, players.length === 1 ? 50 : 73]
      : y <= 48
        ? [players.length === 1 ? 50 : 16, players.length === 1 ? 50 : 84]
        : y <= 72
          ? [players.length === 1 ? 50 : 10, players.length === 1 ? 50 : 90]
          : [50, 50]

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

function normalizePersonName(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('cs-CZ')
    .trim()
    .replace(/\s+/g, ' ')
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

type TimelineEventKind = 'goal' | 'yellow' | 'red' | 'substitution' | 'other'

function eventKind(event: MatchTimelineEvent): TimelineEventKind {
  const type = `${event.type} ${event.label}`
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('cs-CZ')

  if (type.includes('goal') || type.includes('gol')) return 'goal'
  if (type.includes('yellow') || type.includes('zluta')) return 'yellow'
  if (type.includes('red') || type.includes('cervena')) return 'red'
  if (type.includes('sub') || type.includes('strid')) return 'substitution'
  return 'other'
}

function Timeline({ events }: { events: MatchTimelineEvent[] }) {
  return (
    <div className="relative mt-6 min-h-[700px] sm:min-h-[720px]">
      <div className="absolute bottom-8 left-[28px] top-8 w-px bg-sand-200 sm:left-1/2" />

      <div className="relative flex min-h-[700px] flex-col justify-evenly gap-4 sm:min-h-[720px]">
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

function TimelineItem({ event }: { event: MatchTimelineEvent }) {
  const isAway = event.side === 'away'
  const kind = eventKind(event)
  const eventName =
    kind === 'goal'
      ? 'Gól'
      : kind === 'yellow'
        ? 'Žlutá karta'
        : kind === 'red'
          ? 'Červená karta'
          : kind === 'substitution'
            ? 'Střídání'
            : event.label

  const score =
    event.score_home != null && event.score_away != null
      ? `${event.score_home}:${event.score_away}`
      : null

  const minuteClass =
    kind === 'yellow'
      ? 'bg-yellow-400 text-brand-900'
      : kind === 'red'
        ? 'bg-red-600 text-white'
        : 'bg-brand-900 text-white'

  return (
    <div className="relative grid min-h-16 grid-cols-[56px_1fr] gap-3 sm:grid-cols-[minmax(0,1fr)_50px_minmax(0,1fr)] sm:gap-2">
      <div
        className={`hidden sm:block ${
          isAway ? 'sm:col-start-3' : 'sm:col-start-1 sm:row-start-1'
        }`}
      >
        {!isAway && (
          <EventCard event={event} title={eventName} score={score} align="right" />
        )}
      </div>

      <div
        className={`relative z-10 grid h-12 w-12 place-items-center self-center rounded-full border-4 border-[#fbfaf6] text-center shadow-sm sm:col-start-2 sm:row-start-1 sm:mx-auto ${minuteClass}`}
      >
        <div className="text-xs font-black">
          {event.minute != null ? `${event.minute}'` : '•'}
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
  const kind = eventKind(event)

  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div className="inline-block max-w-full rounded-2xl bg-white px-3 py-2.5 ring-1 ring-sand-200">
        <div
          className={`flex items-center gap-2 ${
            align === 'right' ? 'justify-end' : 'justify-start'
          }`}
        >
          {align === 'left' && <EventMarker kind={kind} />}
          <div className="text-xs font-extrabold text-brand-900">{title}</div>
          {align === 'right' && <EventMarker kind={kind} />}
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

        {score && (
          <div className="mt-1 text-[10px] font-black text-brand-500">
            {score}
          </div>
        )}
      </div>
    </div>
  )
}

function EventMarker({ kind }: { kind: TimelineEventKind }) {
  if (kind === 'goal') {
    return (
      <span
        className="grid h-5 w-5 place-items-center rounded-full bg-brand-50 text-[10px]"
        aria-hidden="true"
      >
        ⚽
      </span>
    )
  }

  if (kind === 'yellow' || kind === 'red') {
    return (
      <span
        className={`h-4 w-2.5 rounded-[2px] ${
          kind === 'yellow' ? 'bg-yellow-400' : 'bg-red-600'
        }`}
        aria-hidden="true"
      />
    )
  }

  if (kind === 'substitution') {
    return (
      <span
        className="grid h-5 w-5 place-items-center rounded-full bg-brand-50 text-[9px] font-black text-brand-700"
        aria-hidden="true"
      >
        ↔
      </span>
    )
  }

  return <span className="h-2.5 w-2.5 rounded-full bg-sand-300" aria-hidden="true" />
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
