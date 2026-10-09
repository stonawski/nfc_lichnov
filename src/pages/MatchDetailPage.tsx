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
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { DataFade } from '../components/DataFade'
import { EmptyState, ErrorState, LoadingState, PublicDataPageLoading } from '../components/LoadingState'
import { HeroFieldBackdrop } from '../components/HeroFieldBackdrop'
import { Seo } from '../components/Seo'
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
  matchVenueMapUrl,
} from '../lib/format'
import { normalizeTacticalPosition } from '../lib/playerPosition'
import { safeReturnPath } from '../lib/navigationState'
import type {
  Match,
  MatchParticipant,
  MatchTimelineEvent,
  Team,
} from '../lib/types'

export function MatchDetailPage() {
  const { id = '' } = useParams()
  const [searchParams] = useSearchParams()
  const backTo = safeReturnPath(searchParams, '/zapasy')

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

  const matchDataLoading =
    matchQuery.isLoading ||
    teamsQuery.isLoading ||
    (Boolean(match) && (participantsQuery.isLoading || timelineQuery.isLoading))

  if (matchDataLoading) {
    return <PublicDataPageLoading sections={1} />
  }

  if (matchQuery.isError) {
    return (
      <main className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-[1000px]">
          <ErrorState
            title="Zápas se nepodařilo načíst"
            text="Zkus načtení zopakovat."
            onRetry={() => void matchQuery.refetch()}
          />
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
    <main className="data-fade-in">
      <Seo
        title={`${match.home_team_name} – ${match.away_team_name}`}
        description={`Detail zápasu ${match.home_team_name} – ${match.away_team_name}: termín, výsledek, sestava a průběh utkání.`}
        canonicalPath={`/zapasy/${match.id}`}
      />
      <section className="relative -mt-[84px] overflow-hidden px-5 pb-10 pt-[120px] sm:-mt-[88px] sm:pt-[132px] md:px-8 md:pt-[136px]">
        <HeroFieldBackdrop />

        <div className="relative mx-auto w-full max-w-[1240px]">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-sm font-bold text-ink-500 transition hover:text-brand-900"
          >
            <ArrowLeft size={16} />
            {backTo.startsWith('/zapasy') ? 'Zpět na zápasy' : 'Zpět'}
          </Link>

          <MatchHero
            match={match}
            team={team}
            homeLogo={homeLogo}
            awayLogo={awayLogo}
          />

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <section className="min-w-0">
              <div className="mb-3">
                <CompactSectionHeader label="Sestava" icon={<UsersRound size={18} />} />
              </div>

              {participantsQuery.isLoading ? (
                <LoadingState rows={5} />
              ) : clubParticipants.length ? (
                <DataFade>
                  <FormationPitch
                    teamName={clubName}
                    participants={clubParticipants}
                    events={timeline}
                  />
                </DataFade>
              ) : (
                <DataFade>
                  <EmptyState
                    title="Sestava není k dispozici"
                    text="Pro tento zápas zatím backend nevrací údaje o hráčích."
                  />
                </DataFade>
              )}
            </section>

            <section className="min-w-0 rounded-[30px] border border-sand-200/90 bg-[#fbfaf6]/92 p-5 shadow-[0_18px_50px_rgba(24,53,42,.07)] backdrop-blur-[2px] sm:p-6">
              <CompactSectionHeader label="Průběh" icon={<Clock3 size={18} />} />

              {timelineQuery.isLoading ? (
                <div className="mt-4">
                  <LoadingState rows={5} />
                </div>
              ) : timeline.length ? (
                <DataFade>
                  <Timeline events={timeline} />
                </DataFade>
              ) : (
                <DataFade className="mt-4">
                  <EmptyState
                    title="Průběh není k dispozici"
                    text="Pro tento zápas zatím backend nevrací události zápasu."
                  />
                </DataFade>
              )}
            </section>
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
    <div className="relative mt-4 overflow-hidden rounded-[32px] bg-brand-900 px-5 py-4 text-white shadow-[0_24px_68px_rgba(24,53,42,.15)] sm:px-7 sm:py-5 lg:px-8 lg:py-5">
      <img
        src="/hero-lichnov-field.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[65%_center] opacity-[0.12]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,#18352a_0%,rgba(24,53,42,.96)_48%,rgba(20,83,45,.82)_100%)]" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
          <span>{team?.name || 'NFC Lichnov'}</span>
          <span>{match.state || (upcoming ? 'Nadcházející utkání' : 'Odehráno')}</span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <HeroTeam name={match.home_team_name} logo={homeLogo} align="right" />

          <div className="text-center">
            {upcoming ? (
              <div className="inline-block rounded-[22px] border border-white/10 bg-white/[0.07] px-5 py-3.5">
                <div className="text-3xl font-black tracking-[-0.055em]">
                  {formatMatchTime(match.playing_at)}
                </div>
                <div className="mt-1 text-xs font-bold text-white/55">
                  {formatMatchDate(match.playing_at)}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-4xl font-black tracking-[-0.07em]">
                  {score ?? match.final_score ?? '—'}
                </div>
                {match.penalty_score_home != null &&
                  match.penalty_score_away != null &&
                  (match.penalty_score_home > 0 || match.penalty_score_away > 0) && (
                    <div className="mt-2 text-xs font-bold text-white/50">
                      Penalty {match.penalty_score_home}:{match.penalty_score_away}
                    </div>
                  )}
              </div>
            )}
          </div>

          <HeroTeam name={match.away_team_name} logo={awayLogo} align="left" />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-white/10 pt-3 text-[11px] text-white/55 sm:text-xs">
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

          <a
            href={matchVenueMapUrl(match)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition hover:text-white"
            title="Otevřít hřiště v Google Maps"
          >
            <MapPin size={14} />
            {match.pitch_name || `Hřiště — ${match.home_team_name}`}
          </a>

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
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[18px] bg-white/95 ring-1 ring-white/20 sm:h-16 sm:w-16">
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-contain p-3" />
        ) : (
          <span className="text-sm font-black text-brand-900">{initials(name)}</span>
        )}
      </div>

      <div className="text-lg font-black leading-tight tracking-[-0.045em] sm:text-xl lg:text-2xl">
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

  const placements = assignFourFourTwo(starters)

  return (
    <div>
      <div className="relative min-h-[560px] overflow-hidden rounded-[30px] border border-white/80 bg-[#c9d8ce] shadow-[0_18px_50px_rgba(24,53,42,.08)] sm:min-h-[640px] lg:min-h-[700px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#e7ece8_0%,#d6e0d9_30%,#bfd1c5_68%,#afc7b7_100%)]" />
        <div className="absolute left-4 top-4 z-20 rounded-[18px] border border-white/70 bg-white/82 px-4 py-3 shadow-[0_10px_28px_rgba(24,53,42,.08)] backdrop-blur-md sm:left-5 sm:top-5">
          <div className="text-sm font-extrabold text-brand-900">{teamName}</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">
            Základní sestava
          </div>
        </div>

        <div className="absolute right-4 top-4 z-20 rounded-full bg-white/82 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700 shadow-sm backdrop-blur-md sm:right-5 sm:top-5">
          NFC
        </div>

        <div className="absolute inset-x-0 top-0 h-[34%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,.95),rgba(255,255,255,.32)_46%,transparent_76%)]" />

        <svg
          aria-hidden="true"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="broadcastGrass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dbe5de" stopOpacity="0.40" />
              <stop offset="100%" stopColor="#8fb39b" stopOpacity="0.38" />
            </linearGradient>
          </defs>

          <rect width="1000" height="700" fill="url(#broadcastGrass)" />

          <polygon points="260,65 380,65 238,690 -20,690" fill="#ffffff" opacity="0.055" />
          <polygon points="500,65 620,65 760,690 500,690" fill="#ffffff" opacity="0.045" />

          <g
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.76"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="260,65 740,65 1000,690 0,690" />

            <line x1="133" y1="370" x2="867" y2="370" />
            <ellipse cx="500" cy="370" rx="108" ry="48" />
            <circle cx="500" cy="370" r="4" fill="#ffffff" fillOpacity="0.76" />

            <polygon points="380,65 620,65 646,190 354,190" />
            <polygon points="442,65 558,65 564,130 436,130" />
            <circle cx="500" cy="158" r="4" fill="#ffffff" fillOpacity="0.76" />
            <path d="M 405 190 Q 500 238 595 190" />

            <polygon points="246,520 754,520 796,690 204,690" />
            <polygon points="376,600 624,600 635,690 365,690" />
            <circle cx="500" cy="570" r="4" fill="#ffffff" fillOpacity="0.76" />
            <path d="M 335 520 Q 500 448 665 520" />
          </g>
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

        <div className="pointer-events-none absolute inset-x-[8%] top-0 h-28 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.72),transparent_72%)]" />
      </div>

      {substitutes.length > 0 && (
        <div className="mt-4">
          <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-500">
            Náhradníci
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {substitutes.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 ring-1 ring-sand-200"
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
      className="absolute z-10 w-[108px] -translate-x-1/2 -translate-y-1/2 text-center sm:w-[124px]"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="relative mx-auto w-fit">
        <div className="flex h-12 w-12 items-end justify-center overflow-hidden rounded-[16px] bg-white/72 shadow-[0_8px_18px_rgba(24,53,42,0.12)] ring-1 ring-white sm:h-[60px] sm:w-[60px]">
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

        <div className="absolute -right-5 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1">
          {player.captain && (
            <span
              className="grid h-5 min-w-5 place-items-center rounded bg-[#e8d9a9] px-1 text-[8px] font-black text-brand-900 shadow-sm ring-1 ring-black/5"
              title="Kapitán"
            >
              K
            </span>
          )}
          <PlayerEventBadges player={player} events={events} vertical />
        </div>
      </div>

      <div className="relative -mt-1.5 rounded-xl bg-brand-900/95 px-2.5 py-2 text-white shadow-[0_8px_20px_rgba(24,53,42,0.24)] ring-1 ring-white/35 backdrop-blur-sm">
        <div className="flex min-w-0 items-center justify-center gap-1.5">
          {player.number != null && (
            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-md bg-white/12 px-1 text-[9px] font-black text-white/80 sm:text-[10px]">
              {player.number}
            </span>
          )}
          <span className="truncate text-[11px] font-extrabold leading-none tracking-[-0.02em] sm:text-xs">
            {shortPlayerName(player.name)}
          </span>
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
  vertical = false,
}: {
  player: MatchParticipant
  events: MatchTimelineEvent[]
  compact?: boolean
  vertical?: boolean
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
    <div
      className={`flex items-center gap-1 ${
        vertical ? 'flex-col' : 'flex-row'
      }`}
    >
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

type FormationSlot = {
  id: string
  x: number
  y: number
  line: FormationLine
  preferred: string[]
}

const FOUR_FOUR_TWO_SLOTS: FormationSlot[] = [
  { id: 'gk', x: 50, y: 89, line: 'goalkeeper', preferred: ['GK'] },

  { id: 'lb', x: 13, y: 67, line: 'defence', preferred: ['LB'] },
  { id: 'lcb', x: 38, y: 67, line: 'defence', preferred: ['LCB', 'CB'] },
  { id: 'rcb', x: 62, y: 67, line: 'defence', preferred: ['RCB', 'CB'] },
  { id: 'rb', x: 87, y: 67, line: 'defence', preferred: ['RB'] },

  { id: 'lm', x: 13, y: 42, line: 'midfield', preferred: ['LW', 'LCM'] },
  { id: 'lcm', x: 38, y: 42, line: 'midfield', preferred: ['LCM', 'CM', 'DM', 'AM'] },
  { id: 'rcm', x: 62, y: 42, line: 'midfield', preferred: ['RCM', 'CM', 'DM', 'AM'] },
  { id: 'rm', x: 87, y: 42, line: 'midfield', preferred: ['RW', 'RCM'] },

  { id: 'ls', x: 38, y: 18, line: 'attack', preferred: ['ST', 'LW'] },
  { id: 'rs', x: 62, y: 18, line: 'attack', preferred: ['ST', 'RW'] },
]

function positionLine(position: string | null): FormationLine | null {
  const tactical = normalizeTacticalPosition(position)

  if (tactical === 'GK') return 'goalkeeper'
  if (['RB', 'RCB', 'CB', 'LCB', 'LB'].includes(tactical ?? '')) return 'defence'
  if (['DM', 'RCM', 'CM', 'LCM', 'AM'].includes(tactical ?? '')) return 'midfield'
  if (['RW', 'LW', 'ST'].includes(tactical ?? '')) return 'attack'

  return null
}

function formationSlotScore(player: MatchParticipant, slot: FormationSlot) {
  const tactical = normalizeTacticalPosition(player.position)
  const line = positionLine(player.position)

  if (tactical) {
    const exactIndex = slot.preferred.indexOf(tactical)
    if (exactIndex >= 0) return exactIndex

    if (line === slot.line) return 20

    if (
      (line === 'attack' && slot.line === 'midfield') ||
      (line === 'midfield' && slot.line === 'attack')
    ) {
      return 45
    }

    if (
      (line === 'defence' && slot.line === 'midfield') ||
      (line === 'midfield' && slot.line === 'defence')
    ) {
      return 55
    }

    return slot.line === 'goalkeeper' ? 500 : 90
  }

  return slot.line === 'goalkeeper' ? 110 : 100
}

function assignFourFourTwo(starters: MatchParticipant[]) {
  const available = [...FOUR_FOUR_TWO_SLOTS]
  const assignments: Array<{
    player: MatchParticipant
    x: number
    y: number
  }> = []

  const remaining = [...starters]

  const goalkeeperIndex = remaining.findIndex(
    (player) => normalizeTacticalPosition(player.position) === 'GK',
  )
  const numberOneIndex = remaining.findIndex((player) => player.number === 1)
  const selectedGoalkeeperIndex =
    goalkeeperIndex >= 0 ? goalkeeperIndex : numberOneIndex

  if (selectedGoalkeeperIndex >= 0) {
    const [goalkeeper] = remaining.splice(selectedGoalkeeperIndex, 1)
    const goalkeeperSlot = available.find((slot) => slot.line === 'goalkeeper')!
    available.splice(available.indexOf(goalkeeperSlot), 1)
    assignments.push({
      player: goalkeeper,
      x: goalkeeperSlot.x,
      y: goalkeeperSlot.y,
    })
  }

  const positioned = remaining
    .filter((player) => normalizeTacticalPosition(player.position))
    .sort((a, b) => {
      const aLine = positionLine(a.position)
      const bLine = positionLine(b.position)
      const priority: Record<FormationLine, number> = {
        goalkeeper: 0,
        defence: 1,
        midfield: 2,
        attack: 3,
      }
      return (aLine ? priority[aLine] : 9) - (bLine ? priority[bLine] : 9)
    })

  for (const player of positioned) {
    if (!available.length) break

    let bestSlot = available[0]
    let bestScore = formationSlotScore(player, bestSlot)

    for (const slot of available.slice(1)) {
      const score = formationSlotScore(player, slot)
      if (score < bestScore) {
        bestSlot = slot
        bestScore = score
      }
    }

    assignments.push({ player, x: bestSlot.x, y: bestSlot.y })
    available.splice(available.indexOf(bestSlot), 1)
    remaining.splice(remaining.indexOf(player), 1)
  }

  const fallbackOrder: FormationLine[] = [
    'goalkeeper',
    'defence',
    'midfield',
    'attack',
  ]

  for (const line of fallbackOrder) {
    const slots = available.filter((slot) => slot.line === line)

    for (const slot of slots) {
      const player = remaining.shift()
      if (!player) break

      assignments.push({ player, x: slot.x, y: slot.y })
      available.splice(available.indexOf(slot), 1)
    }
  }

  while (remaining.length && available.length) {
    const player = remaining.shift()!
    const slot = available.shift()!
    assignments.push({ player, x: slot.x, y: slot.y })
  }

  return assignments
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
    <div className="relative mt-4">
      <div className="absolute bottom-6 left-[24px] top-6 w-px bg-sand-200 sm:left-1/2" />

      <div className="relative flex flex-col gap-3">
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
        <TimelineEnd />
      </div>
    </div>
  )
}

function TimelineEnd() {
  return (
    <div className="relative grid min-h-12 grid-cols-[48px_1fr] gap-2 sm:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] sm:gap-2">
      <div className="relative z-10 grid h-10 w-10 place-items-center self-center rounded-full border-[3px] border-[#fbfaf6] bg-brand-900 text-center text-white shadow-sm sm:col-start-2 sm:mx-auto">
        <div className="text-xs font-black">90'</div>
      </div>

      <div className="self-center sm:col-start-3">
        <div className="inline-flex rounded-full bg-brand-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-brand-700 ring-1 ring-brand-500/10">
          Konec
        </div>
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
    <div className="relative grid min-h-12 grid-cols-[48px_1fr] gap-2 sm:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] sm:gap-2">
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
        className={`relative z-10 grid h-10 w-10 place-items-center self-center rounded-full border-[3px] border-[#fbfaf6] text-center shadow-sm sm:col-start-2 sm:row-start-1 sm:mx-auto ${minuteClass}`}
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
      <div className="inline-block max-w-full rounded-[14px] bg-white px-3 py-2 ring-1 ring-sand-200">
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

      <div className="grid h-9 w-9 place-items-center rounded-[14px] bg-brand-50 text-brand-700">
        {icon}
      </div>
    </div>
  )
}
