export const TEAM_ORDER = [
  'muzi',
  'dorost',
  'starsi-zaci',
  'starsi-pripravka',
  'mladsi-pripravka',
  'predpripravka',
]

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
  }).format(new Date(value))
}

export function matchScore(
  scoreHome: number | null,
  scoreAway: number | null,
  manualOverride?: boolean | null,
  manualHome?: number | null,
  manualAway?: number | null,
) {
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
