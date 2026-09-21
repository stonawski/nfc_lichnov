import type { Player, Team } from './types'

function normalizePlayerName(player: Player) {
  return [player.first_name, player.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
    .toLocaleLowerCase('cs-CZ')
}

export function playerIdentityKey(player: Player) {
  if (player.facr_player_id != null) return `facr:${player.facr_player_id}`

  const name = normalizePlayerName(player)
  return name ? `name:${name}` : `row:${player.id}`
}

export function preferDorostOverMen(players: Player[], teams: Team[]) {
  const teamById = new Map(teams.map((team) => [team.id, team]))
  const byIdentity = new Map<string, Player>()

  for (const player of players) {
    const key = playerIdentityKey(player)
    const current = byIdentity.get(key)

    if (!current) {
      byIdentity.set(key, player)
      continue
    }

    const currentSlug = teamById.get(current.team_id)?.slug
    const candidateSlug = teamById.get(player.team_id)?.slug

    if (currentSlug === 'muzi' && candidateSlug === 'dorost') {
      byIdentity.set(key, player)
    }
  }

  return [...byIdentity.values()]
}

export function isPlayerOwnedByDorost(
  player: Player,
  dorostPlayers: Player[],
) {
  const key = playerIdentityKey(player)
  return dorostPlayers.some((candidate) => playerIdentityKey(candidate) === key)
}
