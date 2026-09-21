import { supabase, isSupabaseConfigured } from './supabase'
import type {
  Gallery,
  GalleryImage,
  Match,
  MatchParticipant,
  MatchTimelineEvent,
  NewsArticle,
  Player,
  Staff,
  Standing,
  Team,
  TeamMatchSummary,
  TeamSeason,
} from './types'
import { TEAM_ORDER } from './format'
import { isPlayerOwnedByDorost } from './playerIdentity'

function ensureConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase není nakonfigurovaný. Doplň VITE_SUPABASE_URL a VITE_SUPABASE_ANON_KEY do .env.')
  }
}

export async function fetchTeams(): Promise<Team[]> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('teams')
    .select('id,name,short_name,slug,category,logo_url,active,sort_order,season')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error

  const teams = (data ?? []) as Team[]
  const clubLogo =
    teams.find((team) => team.slug === 'muzi' && team.logo_url)?.logo_url ??
    teams.find((team) => team.logo_url)?.logo_url ??
    null

  return teams.map((team) => ({
    ...team,
    logo_url: team.logo_url || clubLogo,
  }))
}

export async function fetchTeamBySlug(slug: string): Promise<Team | null> {
  const teams = await fetchTeams()
  return teams.find((team) => team.slug === slug) ?? null
}

export async function fetchActiveSeasons(): Promise<TeamSeason[]> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('team_seasons')
    .select('team_id,season,facr_team_id,facr_competition_id,active')
    .eq('active', true)

  if (error) throw error
  return (data ?? []) as TeamSeason[]
}

function withClubLogoFallback(match: Match, team?: Team): Match {
  if (!team?.logo_url) return match

  const homeIsLichnov = /lichnov/i.test(match.home_team_name)
  const awayIsLichnov = /lichnov/i.test(match.away_team_name)

  return {
    ...match,
    home_team_logo: match.home_team_logo || (homeIsLichnov ? team.logo_url : null),
    away_team_logo: match.away_team_logo || (awayIsLichnov ? team.logo_url : null),
  }
}

export async function fetchCurrentMatches(): Promise<Match[]> {
  ensureConfigured()
  const [seasons, teams] = await Promise.all([fetchActiveSeasons(), fetchTeams()])
  if (!seasons.length) return []

  const teamIds = seasons.map((item) => item.team_id)
  const seasonByTeam = new Map(seasons.map((item) => [item.team_id, item.season]))
  const teamById = new Map(teams.map((team) => [team.id, team]))

  const { data, error } = await supabase
    .from('matches')
    .select('id,team_id,facr_match_id,home_team_facr_id,home_team_name,home_team_logo,away_team_facr_id,away_team_name,away_team_logo,playing_at,season,facr_competition_id,competition_name,round,round_position,state,final_score,score_home,score_away,penalty_score_home,penalty_score_away,manual_override,manual_score_home,manual_score_away,pitch_name')
    .in('team_id', teamIds)
    .order('playing_at', { ascending: true })

  if (error) throw error

  return ((data ?? []) as Match[])
    .filter((match) => {
      const expected = seasonByTeam.get(match.team_id)
      return !expected || !match.season || match.season === expected
    })
    .map((match) => withClubLogoFallback(match, teamById.get(match.team_id)))
}

export async function fetchHomepageMatchSummaries(): Promise<TeamMatchSummary[]> {
  const [teams, matches] = await Promise.all([fetchTeams(), fetchCurrentMatches()])
  const now = Date.now()
  const allowed = new Set(TEAM_ORDER.slice(0, 5))

  return teams
    .filter((team) => allowed.has(team.slug))
    .sort((a, b) => TEAM_ORDER.indexOf(a.slug) - TEAM_ORDER.indexOf(b.slug))
    .map((team) => {
      const teamMatches = matches.filter((match) => match.team_id === team.id)
      const completed = teamMatches
        .filter((match) => new Date(match.playing_at).getTime() <= now && (match.score_home != null || match.manual_score_home != null))
        .sort((a, b) => new Date(b.playing_at).getTime() - new Date(a.playing_at).getTime())
      const upcoming = teamMatches
        .filter((match) => new Date(match.playing_at).getTime() > now)
        .sort((a, b) => new Date(a.playing_at).getTime() - new Date(b.playing_at).getTime())

      if (completed[0]) return { team, match: completed[0], kind: 'result' as const }
      if (upcoming[0]) return { team, match: upcoming[0], kind: 'upcoming' as const }
      return { team, match: null, kind: 'empty' as const }
    })
}

export async function fetchUpcomingMatches(): Promise<Array<Match & { team?: Team }>> {
  ensureConfigured()
  const teams = await fetchTeams()
  if (!teams.length) return []

  const teamIds = teams.map((team) => team.id)
  const nowIso = new Date().toISOString()

  const { data, error } = await supabase
    .from('matches')
    .select('id,team_id,facr_match_id,home_team_facr_id,home_team_name,home_team_logo,away_team_facr_id,away_team_name,away_team_logo,playing_at,season,facr_competition_id,competition_name,round,round_position,state,final_score,score_home,score_away,penalty_score_home,penalty_score_away,manual_override,manual_score_home,manual_score_away,pitch_name')
    .in('team_id', teamIds)
    .gt('playing_at', nowIso)
    .order('playing_at', { ascending: true })

  if (error) throw error

  const firstMatchByTeam = new Map<string, Match>()
  for (const match of (data ?? []) as Match[]) {
    if (!firstMatchByTeam.has(match.team_id)) {
      firstMatchByTeam.set(match.team_id, match)
    }
  }

  return teams
    .sort((a, b) => TEAM_ORDER.indexOf(a.slug) - TEAM_ORDER.indexOf(b.slug))
    .map((team) => {
      const match = firstMatchByTeam.get(team.id)
      if (!match) return null

      const fallbackLogo = team.logo_url
      const homeIsLichnov = /lichnov/i.test(match.home_team_name)
      const awayIsLichnov = /lichnov/i.test(match.away_team_name)

      return {
        ...match,
        home_team_logo: match.home_team_logo || (homeIsLichnov ? fallbackLogo : null),
        away_team_logo: match.away_team_logo || (awayIsLichnov ? fallbackLogo : null),
        team,
      }
    })
    .filter((match): match is Match & { team: Team } => match != null)
}

export async function fetchMatchesByTeam(teamId: string): Promise<Match[]> {
  const [seasons, teams] = await Promise.all([fetchActiveSeasons(), fetchTeams()])
  const season = seasons.find((item) => item.team_id === teamId)?.season
  const team = teams.find((item) => item.id === teamId)

  let query = supabase
    .from('matches')
    .select('id,team_id,facr_match_id,home_team_facr_id,home_team_name,home_team_logo,away_team_facr_id,away_team_name,away_team_logo,playing_at,season,facr_competition_id,competition_name,round,round_position,state,final_score,score_home,score_away,penalty_score_home,penalty_score_away,manual_override,manual_score_home,manual_score_away,pitch_name')
    .eq('team_id', teamId)
    .order('playing_at', { ascending: false })

  if (season) query = query.eq('season', season)
  const { data, error } = await query
  if (error) throw error
  return ((data ?? []) as Match[]).map((match) => withClubLogoFallback(match, team))
}

export async function fetchStandingsByTeam(teamId: string): Promise<Standing[]> {
  ensureConfigured()
  const seasons = await fetchActiveSeasons()
  const season = seasons.find((item) => item.team_id === teamId)?.season

  let query = supabase
    .from('standings')
    .select('id,team_id,facr_team_id,team_name,team_short_name,club_name,club_logo,rank,points,matches_count,wins_count,draws_count,losses_count,goals_for,goals_against,season')
    .eq('team_id', teamId)
    .order('rank', { ascending: true })

  if (season) query = query.eq('season', season)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Standing[]
}

export async function fetchPlayersByTeam(teamId: string): Promise<Player[]> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('players')
    .select('id,team_id,facr_player_id,first_name,last_name,birth_date,number,position,photo_url,facr_photo_url,bio,matches_count,goals_count,yellow_cards,red_cards,active,sort_order')
    .eq('team_id', teamId)
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('last_name', { ascending: true })

  if (error) throw error
  return (data ?? []) as Player[]
}

export async function fetchDisplayPlayersByTeam(team: Team): Promise<Player[]> {
  const players = await fetchPlayersByTeam(team.id)
  if (team.slug !== 'muzi') return players

  const teams = await fetchTeams()
  const dorost = teams.find((item) => item.slug === 'dorost')
  if (!dorost) return players

  const dorostPlayers = await fetchPlayersByTeam(dorost.id)
  return players.filter((player) => !isPlayerOwnedByDorost(player, dorostPlayers))
}

export async function fetchStaffByTeam(teamId: string): Promise<Staff[]> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('staff')
    .select('id,team_id,facr_person_id,name,role,photo_url,bio,active,sort_order')
    .eq('team_id', teamId)
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []) as Staff[]
}

export async function fetchPublishedNews(limit?: number): Promise<NewsArticle[]> {
  ensureConfigured()
  let query = supabase
    .from('news')
    .select('id,team_id,title,slug,excerpt,content,cover_image,category,featured,published,published_at,created_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as NewsArticle[]
}

export async function fetchNewsBySlug(slug: string): Promise<NewsArticle | null> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('news')
    .select('id,team_id,title,slug,excerpt,content,cover_image,category,featured,published,published_at,created_at')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) throw error
  return data as NewsArticle | null
}


export async function fetchGalleries(): Promise<Gallery[]> {
  ensureConfigured()

  const { data, error } = await supabase
    .from('galleries')
    .select('id,team_id,title,slug,description,cover_image,event_date,published,published_at,sort_order,created_at,updated_at')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Gallery[]
}

export async function fetchGalleryBySlug(slug: string): Promise<Gallery | null> {
  ensureConfigured()

  const { data, error } = await supabase
    .from('galleries')
    .select('id,team_id,title,slug,description,cover_image,event_date,published,published_at,sort_order,created_at,updated_at')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) throw error
  return data as Gallery | null
}

export async function fetchGalleryImages(galleryId?: string): Promise<GalleryImage[]> {
  ensureConfigured()

  let query = supabase
    .from('gallery_images')
    .select('id,gallery_id,image_url,caption,sort_order,created_at,updated_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (galleryId) query = query.eq('gallery_id', galleryId)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as GalleryImage[]
}

export function galleryImageUrl(image: GalleryImage): string {
  return image.image_url
}


export async function fetchMatchById(id: string): Promise<Match | null> {
  ensureConfigured()

  const { data, error } = await supabase
    .from('matches')
    .select('id,team_id,facr_match_id,home_team_facr_id,home_team_name,home_team_logo,away_team_facr_id,away_team_name,away_team_logo,playing_at,season,facr_competition_id,competition_name,round,round_position,state,final_score,score_home,score_away,penalty_score_home,penalty_score_away,manual_override,manual_score_home,manual_score_away,pitch_name')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as Match | null
}

type UnknownRow = Record<string, unknown>

function textValue(row: UnknownRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }
  return null
}

function numberValue(row: UnknownRow, keys: string[]): number | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value)
    }
  }
  return null
}

function booleanValue(row: UnknownRow, keys: string[]): boolean | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'boolean') return value
    if (value === 1 || value === '1' || value === 'true') return true
    if (value === 0 || value === '0' || value === 'false') return false
  }
  return null
}

function sideValue(row: UnknownRow, match?: Match): 'home' | 'away' | null {
  const side = textValue(row, ['side', 'team_side', 'home_away'])?.toLowerCase()
  if (side === 'home' || side === 'domaci' || side === 'domácí') return 'home'
  if (side === 'away' || side === 'hoste' || side === 'hosté') return 'away'

  const isHome = booleanValue(row, ['is_home', 'home'])
  if (isHome === true) return 'home'
  if (isHome === false) return 'away'

  if (match) {
    const teamName = textValue(row, ['team_name', 'club_name', 'team'])
      ?.toLocaleLowerCase('cs-CZ')
      .trim()

    if (teamName) {
      const homeName = match.home_team_name.toLocaleLowerCase('cs-CZ').trim()
      const awayName = match.away_team_name.toLocaleLowerCase('cs-CZ').trim()
      if (teamName === homeName || homeName.includes(teamName) || teamName.includes(homeName)) {
        return 'home'
      }
      if (teamName === awayName || awayName.includes(teamName) || teamName.includes(awayName)) {
        return 'away'
      }
    }
  }

  return null
}

async function fetchOptionalMatchRows(
  tableNames: string[],
  match: Match,
): Promise<UnknownRow[]> {
  for (const table of tableNames) {
    const byId = await supabase.from(table).select('*').eq('match_id', match.id)
    if (!byId.error && (byId.data ?? []).length) {
      return (byId.data ?? []) as UnknownRow[]
    }

    if (match.facr_match_id != null) {
      const byFacrId = await supabase
        .from(table)
        .select('*')
        .eq('facr_match_id', match.facr_match_id)

      if (!byFacrId.error && (byFacrId.data ?? []).length) {
        return (byFacrId.data ?? []) as UnknownRow[]
      }
    }
  }

  return []
}

export async function fetchMatchParticipants(match: Match): Promise<MatchParticipant[]> {
  ensureConfigured()

  const { data: matchPlayers, error: matchPlayersError } = await supabase
    .from('match_players')
    .select('id,match_id,player_id,team_side,lineup_type,number,position,captain')
    .eq('match_id', match.id)

  if (!matchPlayersError && (matchPlayers ?? []).length) {
    const rows = (matchPlayers ?? []) as Array<{
      id: string
      match_id: string
      player_id: string
      team_side: string | null
      lineup_type: string | null
      number: number | null
      position: string | null
      captain: boolean | null
    }>

    const playerIds = [...new Set(rows.map((row) => row.player_id).filter(Boolean))]
    const { data: players, error: playersError } = playerIds.length
      ? await supabase
          .from('players')
          .select('id,first_name,last_name,number,position,photo_url')
          .in('id', playerIds)
      : { data: [], error: null }

    if (playersError) throw playersError

    const playerById = new Map(
      ((players ?? []) as Array<{
        id: string
        first_name: string | null
        last_name: string | null
        number: number | null
        position: string | null
        photo_url: string | null
      }>).map((player) => [player.id, player]),
    )

    return rows.map((row) => {
      const player = playerById.get(row.player_id)
      const lineupType = row.lineup_type?.toLocaleLowerCase('cs-CZ') ?? ''
      const substitute =
        lineupType.includes('sub') ||
        lineupType.includes('bench') ||
        lineupType.includes('náhrad') ||
        lineupType.includes('nahrad')
      const starter =
        lineupType.includes('start') ||
        lineupType.includes('basic') ||
        lineupType.includes('základ') ||
        lineupType.includes('zaklad')

      return {
        id: row.id,
        player_id: row.player_id,
        name:
          [player?.first_name, player?.last_name].filter(Boolean).join(' ').trim() ||
          'Neznámý hráč',
        photo_url: player?.photo_url ?? null,
        number: row.number ?? player?.number ?? null,
        position: player?.position ?? row.position ?? null,
        side:
          row.team_side === 'home'
            ? 'home'
            : row.team_side === 'away'
              ? 'away'
              : null,
        starter: substitute ? false : starter ? true : null,
        captain: row.captain,
        role: row.lineup_type,
      }
    })
  }

  const rows = await fetchOptionalMatchRows(
    ['match_lineups', 'match_squad', 'match_rosters', 'match_participants'],
    match,
  )

  return rows
    .map((row, index): MatchParticipant | null => {
      const firstName = textValue(row, ['first_name', 'firstname'])
      const lastName = textValue(row, ['last_name', 'lastname'])
      const name =
        textValue(row, ['player_name', 'name', 'full_name']) ||
        [firstName, lastName].filter(Boolean).join(' ').trim()

      if (!name) return null

      const lineupType = textValue(row, ['lineup_type', 'role', 'lineup_role', 'status'])
        ?.toLocaleLowerCase('cs-CZ')
      const substitute =
        lineupType?.includes('sub') ||
        lineupType?.includes('bench') ||
        lineupType?.includes('náhrad') ||
        lineupType?.includes('nahrad')

      return {
        id:
          textValue(row, ['id', 'player_id', 'facr_player_id']) ||
          `${match.id}-participant-${index}`,
        player_id: textValue(row, ['player_id']),
        name,
        photo_url: textValue(row, ['photo_url', 'player_photo_url']),
        number: numberValue(row, ['number', 'shirt_number', 'jersey_number']),
        position: textValue(row, ['position', 'player_position']),
        side: sideValue(row, match),
        starter: substitute
          ? false
          : booleanValue(row, ['starter', 'is_starter', 'starting', 'started']),
        captain: booleanValue(row, ['captain', 'is_captain']),
        role: textValue(row, ['lineup_type', 'role', 'lineup_role', 'status']),
      }
    })
    .filter((item): item is MatchParticipant => item != null)
}

export async function fetchMatchTimeline(match: Match): Promise<MatchTimelineEvent[]> {
  ensureConfigured()

  const rows = await fetchOptionalMatchRows(
    ['match_events', 'match_timeline', 'match_incidents', 'match_actions'],
    match,
  )

  return rows
    .map((row, index): MatchTimelineEvent | null => {
      const type =
        textValue(row, ['event_type', 'type', 'kind', 'event']) ||
        'event'
      const playerName = textValue(row, ['player_name', 'name', 'primary_player_name'])
      const secondaryPlayerName = textValue(row, [
        'secondary_player_name',
        'second_player_name',
        'assist_player_name',
        'player_out_name',
      ])
      const label =
        textValue(row, ['label', 'description', 'detail', 'event_label']) ||
        playerName ||
        type

      if (!label) return null

      return {
        id: textValue(row, ['id', 'event_id']) || `${match.id}-event-${index}`,
        minute: numberValue(row, ['minute', 'event_minute', 'match_minute']),
        type,
        label,
        player_name: playerName,
        secondary_player_name: secondaryPlayerName,
        side: sideValue(row, match),
        score_home: numberValue(row, ['score_home', 'home_score']),
        score_away: numberValue(row, ['score_away', 'away_score']),
      }
    })
    .filter((item): item is MatchTimelineEvent => item != null)
    .sort((a, b) => (a.minute ?? Number.MAX_SAFE_INTEGER) - (b.minute ?? Number.MAX_SAFE_INTEGER))
}
