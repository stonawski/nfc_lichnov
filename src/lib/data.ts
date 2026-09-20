import { supabase, isSupabaseConfigured } from './supabase'
import type {
  Gallery,
  GalleryImage,
  Match,
  NewsArticle,
  Player,
  Staff,
  Standing,
  Team,
  TeamMatchSummary,
  TeamSeason,
} from './types'
import { TEAM_ORDER } from './format'

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

export async function fetchCurrentMatches(): Promise<Match[]> {
  ensureConfigured()
  const seasons = await fetchActiveSeasons()
  if (!seasons.length) return []

  const teamIds = seasons.map((item) => item.team_id)
  const seasonByTeam = new Map(seasons.map((item) => [item.team_id, item.season]))

  const { data, error } = await supabase
    .from('matches')
    .select('id,team_id,facr_match_id,home_team_facr_id,home_team_name,home_team_logo,away_team_facr_id,away_team_name,away_team_logo,playing_at,season,facr_competition_id,competition_name,round,round_position,state,final_score,score_home,score_away,penalty_score_home,penalty_score_away,manual_override,manual_score_home,manual_score_away,pitch_name')
    .in('team_id', teamIds)
    .order('playing_at', { ascending: true })

  if (error) throw error

  return ((data ?? []) as Match[]).filter((match) => {
    const expected = seasonByTeam.get(match.team_id)
    return !expected || !match.season || match.season === expected
  })
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
  const seasons = await fetchActiveSeasons()
  const season = seasons.find((item) => item.team_id === teamId)?.season

  let query = supabase
    .from('matches')
    .select('id,team_id,facr_match_id,home_team_facr_id,home_team_name,home_team_logo,away_team_facr_id,away_team_name,away_team_logo,playing_at,season,facr_competition_id,competition_name,round,round_position,state,final_score,score_home,score_away,penalty_score_home,penalty_score_away,manual_override,manual_score_home,manual_score_away,pitch_name')
    .eq('team_id', teamId)
    .order('playing_at', { ascending: false })

  if (season) query = query.eq('season', season)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Match[]
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
  const dorostFacrIds = new Set(
    dorostPlayers
      .map((player) => player.facr_player_id)
      .filter((id): id is number => id != null),
  )
  const normalizeName = (player: Player) =>
    [player.first_name, player.last_name]
      .filter(Boolean)
      .join(' ')
      .trim()
      .toLocaleLowerCase('cs-CZ')

  const dorostNames = new Set(dorostPlayers.map(normalizeName).filter(Boolean))

  return players.filter((player) => {
    if (player.facr_player_id != null && dorostFacrIds.has(player.facr_player_id)) return false

    const normalizedName = normalizeName(player)
    return !normalizedName || !dorostNames.has(normalizedName)
  })
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

  const { data, error } = await supabase.from('galleries').select('*')
  if (error) throw error

  return ((data ?? []) as Gallery[])
    .filter((gallery) => gallery.published !== false)
    .sort((a, b) => {
      const aDate = a.event_date || a.created_at || ''
      const bDate = b.event_date || b.created_at || ''
      return bDate.localeCompare(aDate)
    })
}

export async function fetchGalleryBySlug(slug: string): Promise<Gallery | null> {
  const galleries = await fetchGalleries()
  return galleries.find((gallery) => gallery.slug === slug) ?? null
}

export async function fetchGalleryImages(galleryId?: string): Promise<GalleryImage[]> {
  ensureConfigured()

  let query = supabase.from('gallery_images').select('*')
  if (galleryId) query = query.eq('gallery_id', galleryId)

  const { data, error } = await query
  if (error) throw error

  return ((data ?? []) as GalleryImage[]).sort((a, b) => {
    const aOrder = a.sort_order ?? Number.MAX_SAFE_INTEGER
    const bOrder = b.sort_order ?? Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder

    return (a.created_at || '').localeCompare(b.created_at || '')
  })
}

export function galleryImageUrl(image: GalleryImage): string | null {
  return image.image_url || image.url || null
}
