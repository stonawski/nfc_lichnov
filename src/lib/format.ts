import type { Match } from './types'

export const TEAM_ORDER = [
  'muzi',
  'dorost',
  'starsi-zaci',
  'starsi-pripravka',
  'mladsi-pripravka',
  'predpripravka',
]

// The imported FAČR kickoff value is stored with a UTC offset while its clock value
// already represents the official local kickoff. Formatting it in browser local time
// would therefore add the Czech UTC offset once more.
const MATCH_SOURCE_TIME_ZONE = 'UTC'

export function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return ''
  return new Intl.DateTimeFormat('cs-CZ', options ?? {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatMatchDate(value: string | null | undefined) {
  if (!value) return ''
  return new Intl.DateTimeFormat('cs-CZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: MATCH_SOURCE_TIME_ZONE,
  }).format(new Date(value))
}

export function formatMatchDay(value: string | null | undefined) {
  if (!value) return ''
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    timeZone: MATCH_SOURCE_TIME_ZONE,
  }).format(new Date(value))
}

export function formatMatchTime(value: string | null | undefined) {
  if (!value) return ''
  return new Intl.DateTimeFormat('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: MATCH_SOURCE_TIME_ZONE,
  }).format(new Date(value))
}

export function matchVenueMapUrl(
  match: Pick<Match, 'pitch_name' | 'home_team_name'>,
) {
  const pitch = match.pitch_name?.trim()
  const query = pitch
    ? `${pitch}, ${match.home_team_name}`
    : `${match.home_team_name} fotbalové hřiště`

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function isUpcomingMatch(value: string | null | undefined) {
  if (!value) return false
  return new Date(value).getTime() > Date.now()
}

export function matchScore(
  scoreHome: number | null,
  scoreAway: number | null,
  manualOverride?: boolean | null,
  manualHome?: number | null,
  manualAway?: number | null,
  playingAt?: string | null,
) {
  if (playingAt && isUpcomingMatch(playingAt)) return null

  const home = manualOverride && manualHome != null ? manualHome : scoreHome
  const away = manualOverride && manualAway != null ? manualAway : scoreAway
  if (home == null || away == null) return null
  return `${home}:${away}`
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
