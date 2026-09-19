export type Team = {
  id: string
  name: string
  short_name: string | null
  slug: string
  category: string | null
  logo_url: string | null
  active: boolean
  sort_order: number | null
  season: string | null
}

export type TeamSeason = {
  team_id: string
  season: string
  facr_team_id: number
  facr_competition_id: number
  active: boolean
}

export type Match = {
  id: string
  team_id: string
  facr_match_id: number
  home_team_facr_id: number | null
  home_team_name: string
  home_team_logo: string | null
  away_team_facr_id: number | null
  away_team_name: string
  away_team_logo: string | null
  playing_at: string
  season: string | null
  facr_competition_id: number | null
  competition_name: string | null
  round: string | null
  round_position: number | null
  state: string | null
  final_score: string | null
  score_home: number | null
  score_away: number | null
  penalty_score_home: number | null
  penalty_score_away: number | null
  manual_override: boolean | null
  manual_score_home: number | null
  manual_score_away: number | null
  pitch_name: string | null
}

export type Standing = {
  id: string
  team_id: string
  facr_team_id: number
  team_name: string
  team_short_name: string | null
  club_name: string | null
  club_logo: string | null
  rank: number | null
  points: number | null
  matches_count: number | null
  wins_count: number | null
  draws_count: number | null
  losses_count: number | null
  goals_for: number | null
  goals_against: number | null
  season: string | null
}

export type Player = {
  id: string
  team_id: string
  facr_player_id: number | null
  first_name: string | null
  last_name: string | null
  birth_date: string | null
  number: number | null
  position: string | null
  photo_url: string | null
  facr_photo_url?: string | null
  bio: string | null
  matches_count: number | null
  goals_count: number | null
  yellow_cards: number | null
  red_cards: number | null
  active: boolean
  sort_order: number | null
}

export type Staff = {
  id: string
  team_id: string
  facr_person_id: number | null
  name: string
  role: string | null
  photo_url: string | null
  bio: string | null
  active: boolean
  sort_order: number | null
}

export type NewsArticle = {
  id: string
  team_id: string | null
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  category: string | null
  featured: boolean | null
  published: boolean | null
  published_at: string | null
  created_at: string
}

export type Gallery = {
  id: string
  title?: string | null
  slug?: string | null
  description?: string | null
  cover_image?: string | null
  created_at?: string | null
}

export type GalleryImage = {
  id: string
  gallery_id: string
  image_url?: string | null
  url?: string | null
  caption?: string | null
  sort_order?: number | null
}

export type TeamMatchSummary = {
  team: Team
  match: Match | null
  kind: 'result' | 'upcoming' | 'empty'
}
