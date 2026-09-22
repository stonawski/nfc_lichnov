import {
  competitionMilestones,
  historicalPlayerStats,
  historicalSeasons,
} from '../data/clubHistory'
import { isSupabaseConfigured, supabase } from './supabase'

export type CompetitionOutcome = 'promotion' | 'relegation' | null

export type ClubPlayerStat = {
  id: number | string
  name: string
  goals: number
  matches: number
  sourceOrder: number
  facrPlayerId: number | null
  active: boolean
  needsReview: boolean
  updatedAt: string | null
}

export type ClubSeasonStat = {
  ordinal: number
  season: string
  matches: number
  record: string
  score: string
  points: number
  competition: string
  position: number
  incomplete: boolean
  outcome: CompetitionOutcome
  nextCompetition: string | null
  updatedAt: string | null
}

export type ClubStatsLastEdit = {
  entityType: 'player' | 'season'
  entityKey: string
  changedAt: string
  changedBy: string | null
  changedByEmail: string | null
}

export type ClubStatsAuditEntry = ClubStatsLastEdit & {
  id: number
  action: 'insert' | 'update' | 'delete'
  beforeData: Record<string, unknown> | null
  afterData: Record<string, unknown> | null
}

export type ClubStatsBundle = {
  players: ClubPlayerStat[]
  seasons: ClubSeasonStat[]
  usingFallback: boolean
}

export const PLAYER_STATS_SOURCE_UPDATED_AT = '2025-02-28'

export function getBundledClubStats(): ClubStatsBundle {
  return {
    players: fallbackPlayers(),
    seasons: fallbackSeasons(),
    usingFallback: true,
  }
}

const milestoneBySeason = new Map<
  string,
  {
    outcome: Exclude<CompetitionOutcome, null>
    nextCompetition: string
  }
>(
  competitionMilestones.map((milestone) => [
    milestone.afterSeason,
    {
      outcome: milestone.type as Exclude<CompetitionOutcome, null>,
      nextCompetition: milestone.to,
    },
  ]),
)

function fallbackPlayers(): ClubPlayerStat[] {
  return historicalPlayerStats.map((player) => ({
    id: `fallback-player-${player.sourceOrder}`,
    name: player.name,
    goals: player.goals,
    matches: player.matches,
    sourceOrder: player.sourceOrder,
    facrPlayerId: null,
    active: false,
    needsReview: false,
    updatedAt: null,
  }))
}

function fallbackSeasons(): ClubSeasonStat[] {
  return historicalSeasons.map((season) => {
    const milestone = milestoneBySeason.get(season.season)

    return {
      ordinal: season.ordinal,
      season: season.season,
      matches: season.matches,
      record: season.record,
      score: season.score,
      points: season.points,
      competition: season.competition,
      position: season.position,
      incomplete: season.incomplete === true,
      outcome: milestone?.outcome ?? null,
      nextCompetition: milestone?.nextCompetition ?? null,
      updatedAt: null,
    }
  })
}

function mapPlayerRow(row: Record<string, unknown>): ClubPlayerStat {
  return {
    id: row.id as number,
    name: String(row.name ?? ''),
    goals: Number(row.goals ?? 0),
    matches: Number(row.matches ?? 0),
    sourceOrder: Number(row.source_order ?? 0),
    facrPlayerId: row.facr_player_id == null ? null : Number(row.facr_player_id),
    active: row.active === true,
    needsReview: row.needs_review === true,
    updatedAt: (row.updated_at as string | null) ?? null,
  }
}

function mapSeasonRow(row: Record<string, unknown>): ClubSeasonStat {
  return {
    ordinal: Number(row.ordinal ?? 0),
    season: String(row.season ?? ''),
    matches: Number(row.matches ?? 0),
    record: String(row.record ?? ''),
    score: String(row.score ?? ''),
    points: Number(row.points ?? 0),
    competition: String(row.competition ?? ''),
    position: Number(row.position ?? 0),
    incomplete: row.incomplete === true,
    outcome:
      row.outcome === 'promotion' || row.outcome === 'relegation'
        ? row.outcome
        : null,
    nextCompetition: (row.next_competition as string | null) ?? null,
    updatedAt: (row.updated_at as string | null) ?? null,
  }
}

function mapLastEditRow(row: Record<string, unknown>): ClubStatsLastEdit {
  return {
    entityType: row.entity_type === 'season' ? 'season' : 'player',
    entityKey: String(row.entity_key ?? ''),
    changedAt: String(row.changed_at ?? ''),
    changedBy: (row.changed_by as string | null) ?? null,
    changedByEmail: (row.changed_by_email as string | null) ?? null,
  }
}

function mapAuditRow(row: Record<string, unknown>): ClubStatsAuditEntry {
  return {
    id: Number(row.id),
    entityType: row.entity_type === 'season' ? 'season' : 'player',
    entityKey: String(row.entity_key ?? ''),
    action:
      row.action === 'insert' || row.action === 'delete' ? row.action : 'update',
    changedAt: String(row.changed_at ?? ''),
    changedBy: (row.changed_by as string | null) ?? null,
    changedByEmail: (row.changed_by_email as string | null) ?? null,
    beforeData: (row.before_data as Record<string, unknown> | null) ?? null,
    afterData: (row.after_data as Record<string, unknown> | null) ?? null,
  }
}

export async function fetchPublicClubStats(): Promise<ClubStatsBundle> {
  if (!isSupabaseConfigured) {
    return getBundledClubStats()
  }

  const [playersResult, seasonsResult] = await Promise.all([
    supabase
      .from('club_player_stats')
      .select('id,name,goals,matches,source_order,facr_player_id,active,needs_review,updated_at')
      .eq('needs_review', false)
      .order('source_order', { ascending: true }),
    supabase
      .from('club_seasons')
      .select(
        'ordinal,season,matches,record,score,points,competition,position,incomplete,outcome,next_competition,updated_at',
      )
      .order('ordinal', { ascending: true }),
  ])

  if (
    playersResult.error ||
    seasonsResult.error ||
    !playersResult.data?.length ||
    !seasonsResult.data?.length
  ) {
    if (playersResult.error || seasonsResult.error) {
      console.warn(
        'Club statistics are using the bundled fallback data.',
        playersResult.error ?? seasonsResult.error,
      )
    }

    return getBundledClubStats()
  }

  return {
    players: playersResult.data.map((row) => mapPlayerRow(row)),
    seasons: seasonsResult.data.map((row) => mapSeasonRow(row)),
    usingFallback: false,
  }
}

export async function fetchAdminClubStats() {
  const [playersResult, seasonsResult, lastEditResult, auditResult] = await Promise.all([
    supabase
      .from('club_player_stats')
      .select('id,name,goals,matches,source_order,facr_player_id,active,needs_review,updated_at')
      .order('source_order', { ascending: true }),
    supabase
      .from('club_seasons')
      .select(
        'ordinal,season,matches,record,score,points,competition,position,incomplete,outcome,next_competition,updated_at',
      )
      .order('ordinal', { ascending: true }),
    supabase
      .from('club_stats_last_edit')
      .select('entity_type,entity_key,changed_at,changed_by,changed_by_email'),
    supabase
      .from('club_stats_audit')
      .select(
        'id,entity_type,entity_key,action,changed_at,changed_by,changed_by_email,before_data,after_data',
      )
      .order('changed_at', { ascending: false })
      .limit(80),
  ])

  if (playersResult.error) throw playersResult.error
  if (seasonsResult.error) throw seasonsResult.error
  if (lastEditResult.error) throw lastEditResult.error
  if (auditResult.error) throw auditResult.error

  return {
    players: (playersResult.data ?? []).map((row) => mapPlayerRow(row)),
    seasons: (seasonsResult.data ?? []).map((row) => mapSeasonRow(row)),
    lastEdits: (lastEditResult.data ?? []).map((row) => mapLastEditRow(row)),
    audit: (auditResult.data ?? []).map((row) => mapAuditRow(row)),
  }
}

export async function updateClubPlayerStat(
  id: number,
  input: Pick<ClubPlayerStat, 'name' | 'matches' | 'goals' | 'active'>,
) {
  const { data, error } = await supabase
    .from('club_player_stats')
    .update({
      name: input.name.trim(),
      matches: input.matches,
      goals: input.goals,
      active: input.active,
      needs_review: false,
    })
    .eq('id', id)
    .select('id,name,goals,matches,source_order,facr_player_id,active,needs_review,updated_at')
    .single()

  if (error) throw error
  return mapPlayerRow(data)
}

export async function createClubPlayerStat(
  input: Pick<ClubPlayerStat, 'name' | 'matches' | 'goals' | 'active'>,
) {
  const { data: latest, error: latestError } = await supabase
    .from('club_player_stats')
    .select('source_order')
    .order('source_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) throw latestError

  const { data, error } = await supabase
    .from('club_player_stats')
    .insert({
      name: input.name.trim(),
      matches: input.matches,
      goals: input.goals,
      active: input.active,
      needs_review: false,
      source_order:
        typeof latest?.source_order === 'number' ? latest.source_order + 1 : 1,
    })
    .select('id,name,goals,matches,source_order,facr_player_id,active,needs_review,updated_at')
    .single()

  if (error) throw error
  return mapPlayerRow(data)
}


export async function syncCurrentPlayersIntoClubStats() {
  const { data, error } = await supabase.rpc('sync_club_player_stats_current')
  if (error) throw error
  return typeof data === 'number' ? data : Number(data ?? 0)
}

export async function deleteClubPlayerStat(id: number) {
  const { error } = await supabase.from('club_player_stats').delete().eq('id', id)
  if (error) throw error
}

export type ClubSeasonInput = Omit<
  ClubSeasonStat,
  'ordinal' | 'updatedAt'
>

export async function updateClubSeasonStat(
  ordinal: number,
  input: ClubSeasonInput,
) {
  const { data, error } = await supabase
    .from('club_seasons')
    .update({
      season: input.season.trim(),
      matches: input.matches,
      record: input.record.trim(),
      score: input.score.trim(),
      points: input.points,
      competition: input.competition.trim(),
      position: input.position,
      incomplete: input.incomplete,
      outcome: input.outcome,
      next_competition: input.nextCompetition?.trim() || null,
    })
    .eq('ordinal', ordinal)
    .select(
      'ordinal,season,matches,record,score,points,competition,position,incomplete,outcome,next_competition,updated_at',
    )
    .single()

  if (error) throw error
  return mapSeasonRow(data)
}

export async function createClubSeasonStat(input: ClubSeasonInput) {
  const { data: latest, error: latestError } = await supabase
    .from('club_seasons')
    .select('ordinal')
    .order('ordinal', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) throw latestError

  const { data, error } = await supabase
    .from('club_seasons')
    .insert({
      ordinal: typeof latest?.ordinal === 'number' ? latest.ordinal + 1 : 1,
      season: input.season.trim(),
      matches: input.matches,
      record: input.record.trim(),
      score: input.score.trim(),
      points: input.points,
      competition: input.competition.trim(),
      position: input.position,
      incomplete: input.incomplete,
      outcome: input.outcome,
      next_competition: input.nextCompetition?.trim() || null,
    })
    .select(
      'ordinal,season,matches,record,score,points,competition,position,incomplete,outcome,next_competition,updated_at',
    )
    .single()

  if (error) throw error
  return mapSeasonRow(data)
}

export async function deleteClubSeasonStat(ordinal: number) {
  const { error } = await supabase.from('club_seasons').delete().eq('ordinal', ordinal)
  if (error) throw error
}
