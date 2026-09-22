import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
  Clock3,
  History,
  Plus,
  Save,
  Search,
  Trash2,
  Trophy,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createClubPlayerStat,
  createClubSeasonStat,
  deleteClubPlayerStat,
  deleteClubSeasonStat,
  fetchAdminClubStats,
  updateClubPlayerStat,
  updateClubSeasonStat,
  type ClubPlayerStat,
  type ClubSeasonInput,
  type ClubSeasonStat,
  type ClubStatsAuditEntry,
  type CompetitionOutcome,
} from '../../lib/clubStatsData'

type AdminMode = 'players' | 'seasons'

export function AdminClubStatsPage() {
  const [mode, setMode] = useState<AdminMode>('players')
  const [query, setQuery] = useState('')
  const [showAllPlayers, setShowAllPlayers] = useState(false)
  const [showAllSeasons, setShowAllSeasons] = useState(false)
  const [creatingPlayer, setCreatingPlayer] = useState(false)
  const [creatingSeason, setCreatingSeason] = useState(false)
  const queryClient = useQueryClient()

  const statsQuery = useQuery({
    queryKey: ['admin-club-stats'],
    queryFn: fetchAdminClubStats,
    retry: false,
  })

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-club-stats'] }),
      queryClient.invalidateQueries({ queryKey: ['club-stats'] }),
    ])
  }

  const players = statsQuery.data?.players ?? []
  const seasons = statsQuery.data?.seasons ?? []
  const audit = statsQuery.data?.audit ?? []

  const latestAudit = useMemo(() => {
    const map = new Map<string, ClubStatsAuditEntry>()

    for (const entry of audit) {
      const key = `${entry.entityType}:${entry.entityKey}`
      if (!map.has(key)) map.set(key, entry)
    }

    return map
  }, [audit])

  const normalizedQuery = normalizeSearch(query)
  const filteredPlayers = players.filter((player) =>
    normalizeSearch(player.name).includes(normalizedQuery),
  )
  const visiblePlayers =
    showAllPlayers || normalizedQuery ? filteredPlayers : filteredPlayers.slice(0, 40)
  const visibleSeasons = showAllSeasons
    ? [...seasons].reverse()
    : [...seasons].reverse().slice(0, 15)

  return (
    <div className="mx-auto max-w-[1260px]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
            Klub
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
            Historické statistiky
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500">
            Udržuj historické zápasy, góly a sezonní přehled. Každá změna se
            automaticky zapisuje s časem a přihlášeným editorem.
          </p>
        </div>

        <a
          href="/klub/statistiky"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center justify-center rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          Otevřít veřejnou stránku
        </a>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatCard label="Historických hráčů" value={players.length} />
        <StatCard label="Sezon" value={seasons.length} />
        <StatCard label="Zaznamenaných změn" value={audit.length} />
      </div>

      <div className="mt-6 inline-flex rounded-[18px] bg-white p-1 ring-1 ring-sand-200">
        <ModeButton active={mode === 'players'} onClick={() => setMode('players')}>
          <UserRound size={16} />
          Hráči
        </ModeButton>
        <ModeButton active={mode === 'seasons'} onClick={() => setMode('seasons')}>
          <CalendarDays size={16} />
          Sezony
        </ModeButton>
      </div>

      {statsQuery.isLoading ? (
        <div className="mt-6 h-80 animate-pulse rounded-[30px] bg-sand-100" />
      ) : statsQuery.isError ? (
        <section className="mt-6 rounded-[30px] border border-red-200 bg-red-50 p-8 text-center">
          <div className="text-lg font-extrabold text-brand-900">
            Statistiky se nepodařilo načíst.
          </div>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Nejdřív aplikuj migraci <code>20260922083000_club_stats.sql</code> v Supabase
            a zkontroluj RLS oprávnění.
          </p>
        </section>
      ) : mode === 'players' ? (
        <>
          <section className="mt-6 rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-extrabold text-brand-900">
                  Historická statistika hráčů
                </div>
                <div className="mt-1 text-xs text-ink-500">
                  Zápasy i góly se z této jedné tabulky automaticky přepočítají do
                  veřejných žebříčků.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCreatingPlayer(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                <Plus size={16} />
                Přidat hráče
              </button>
            </div>

            <label className="relative mt-5 block">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Hledat hráče…"
                className="admin-input !pl-11"
              />
            </label>
          </section>

          {creatingPlayer && (
            <NewPlayerCard
              onClose={() => setCreatingPlayer(false)}
              onSaved={async () => {
                setCreatingPlayer(false)
                await refresh()
              }}
            />
          )}

          <section className="mt-6 overflow-hidden rounded-[30px] border border-sand-200 bg-[#fbfaf6]">
            <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_120px] gap-3 border-b border-sand-200 px-5 py-3 text-[9px] font-black uppercase tracking-[0.13em] text-ink-500 sm:grid-cols-[minmax(220px,1fr)_110px_110px_minmax(210px,.8fr)_110px] sm:px-6">
              <div>Hráč</div>
              <div>Zápasy</div>
              <div>Góly</div>
              <div className="hidden sm:block">Poslední úprava</div>
              <div className="text-right">Akce</div>
            </div>

            {visiblePlayers.map((player) => (
              <PlayerEditorRow
                key={String(player.id)}
                player={player}
                audit={latestAudit.get(`player:${String(player.id)}`)}
                onSaved={refresh}
              />
            ))}

            {!visiblePlayers.length && (
              <div className="px-6 py-12 text-center text-sm text-ink-500">
                Žádný hráč neodpovídá hledání.
              </div>
            )}

            {!normalizedQuery && filteredPlayers.length > 40 && (
              <div className="border-t border-sand-200 p-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllPlayers((value) => !value)}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-brand-900 ring-1 ring-sand-200 transition hover:bg-sand-100"
                >
                  {showAllPlayers
                    ? 'Zobrazit prvních 40'
                    : `Zobrazit všech ${filteredPlayers.length} hráčů`}
                </button>
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-extrabold text-brand-900">
                  Minuty pravdy
                </div>
                <div className="mt-1 text-xs leading-5 text-ink-500">
                  U sezony můžeš označit postup nebo sestup a cílovou soutěž. Veřejná
                  časová osa se z těchto údajů vytvoří automaticky.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCreatingSeason(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                <Plus size={16} />
                Přidat sezonu
              </button>
            </div>
          </section>

          {creatingSeason && (
            <NewSeasonCard
              onClose={() => setCreatingSeason(false)}
              onSaved={async () => {
                setCreatingSeason(false)
                await refresh()
              }}
            />
          )}

          <div className="mt-6 space-y-3">
            {visibleSeasons.map((season) => (
              <SeasonEditorCard
                key={season.ordinal}
                season={season}
                audit={latestAudit.get(`season:${season.ordinal}`)}
                onSaved={refresh}
              />
            ))}
          </div>

          {seasons.length > 15 && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowAllSeasons((value) => !value)}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-brand-900 ring-1 ring-sand-200 transition hover:bg-sand-100"
              >
                {showAllSeasons ? 'Zobrazit posledních 15 sezon' : 'Zobrazit všechny sezony'}
              </button>
            </div>
          )}
        </>
      )}

      {!statsQuery.isError && (
        <AuditPanel audit={audit.slice(0, 24)} />
      )}
    </div>
  )
}

function PlayerEditorRow({
  player,
  audit,
  onSaved,
}: {
  player: ClubPlayerStat
  audit?: ClubStatsAuditEntry
  onSaved: () => Promise<void>
}) {
  const [name, setName] = useState(player.name)
  const [matches, setMatches] = useState(String(player.matches))
  const [goals, setGoals] = useState(String(player.goals))

  useEffect(() => {
    setName(player.name)
    setMatches(String(player.matches))
    setGoals(String(player.goals))
  }, [player])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateClubPlayerStat(Number(player.id), {
        name,
        matches: toNonNegativeInt(matches),
        goals: toNonNegativeInt(goals),
      }),
    onSuccess: onSaved,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteClubPlayerStat(Number(player.id)),
    onSuccess: onSaved,
  })

  const hasChanges =
    name.trim() !== player.name ||
    toNonNegativeInt(matches) !== player.matches ||
    toNonNegativeInt(goals) !== player.goals

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_120px] items-center gap-3 border-b border-sand-200 px-5 py-4 last:border-b-0 sm:grid-cols-[minmax(220px,1fr)_110px_110px_minmax(210px,.8fr)_110px] sm:px-6">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="admin-input min-w-0"
      />
      <input
        type="number"
        min="0"
        value={matches}
        onChange={(event) => setMatches(event.target.value)}
        className="admin-input"
      />
      <input
        type="number"
        min="0"
        value={goals}
        onChange={(event) => setGoals(event.target.value)}
        className="admin-input"
      />
      <LastEdited audit={audit} updatedAt={player.updatedAt} className="hidden sm:block" />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={!hasChanges || saveMutation.isPending || !name.trim()}
          onClick={() => saveMutation.mutate()}
          className="grid h-10 w-10 place-items-center rounded-xl bg-brand-900 text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Uložit hráče"
          title="Uložit"
        >
          {saveMutation.isSuccess && !hasChanges ? <Check size={15} /> : <Save size={15} />}
        </button>
        <button
          type="button"
          disabled={deleteMutation.isPending}
          onClick={() => {
            if (window.confirm(`Opravdu smazat historický záznam „${player.name}“?`)) {
              deleteMutation.mutate()
            }
          }}
          className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-40"
          aria-label="Smazat hráče"
          title="Smazat"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {(saveMutation.isError || deleteMutation.isError) && (
        <div className="col-span-full text-xs font-semibold text-red-700">
          Změnu se nepodařilo uložit.
        </div>
      )}
      <LastEdited audit={audit} updatedAt={player.updatedAt} className="col-span-full sm:hidden" />
    </div>
  )
}

function NewPlayerCard({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [name, setName] = useState('')
  const [matches, setMatches] = useState('0')
  const [goals, setGoals] = useState('0')

  const mutation = useMutation({
    mutationFn: () =>
      createClubPlayerStat({
        name,
        matches: toNonNegativeInt(matches),
        goals: toNonNegativeInt(goals),
      }),
    onSuccess: onSaved,
  })

  return (
    <section className="mt-4 rounded-[28px] border border-brand-900/10 bg-brand-50/70 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold text-brand-900">Nový historický hráč</div>
          <div className="mt-1 text-xs text-ink-500">
            Nový záznam se automaticky zařadí do obou veřejných žebříčků.
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink-500 ring-1 ring-sand-200"
          aria-label="Zavřít"
        >
          <X size={16} />
        </button>
      </div>

      <form
        className="mt-5 grid gap-3 sm:grid-cols-[1fr_150px_150px_auto]"
        onSubmit={(event) => {
          event.preventDefault()
          if (name.trim()) mutation.mutate()
        }}
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="admin-input"
          placeholder="Jméno hráče"
          required
        />
        <input
          type="number"
          min="0"
          value={matches}
          onChange={(event) => setMatches(event.target.value)}
          className="admin-input"
          placeholder="Zápasy"
        />
        <input
          type="number"
          min="0"
          value={goals}
          onChange={(event) => setGoals(event.target.value)}
          className="admin-input"
          placeholder="Góly"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          Přidat
        </button>
      </form>

      {mutation.isError && (
        <div className="mt-3 text-xs font-semibold text-red-700">
          Hráče se nepodařilo přidat.
        </div>
      )}
    </section>
  )
}

function SeasonEditorCard({
  season,
  audit,
  onSaved,
}: {
  season: ClubSeasonStat
  audit?: ClubStatsAuditEntry
  onSaved: () => Promise<void>
}) {
  const [draft, setDraft] = useState(() => seasonToDraft(season))

  useEffect(() => {
    setDraft(seasonToDraft(season))
  }, [season])

  const input = draftToSeasonInput(draft)
  const hasChanges = JSON.stringify(input) !== JSON.stringify(seasonToInput(season))

  const saveMutation = useMutation({
    mutationFn: () => updateClubSeasonStat(season.ordinal, input),
    onSuccess: onSaved,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteClubSeasonStat(season.ordinal),
    onSuccess: onSaved,
  })

  return (
    <section className="rounded-[28px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Trophy size={18} />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-[-0.035em] text-brand-900">
              {season.season}
            </div>
            <LastEdited audit={audit} updatedAt={season.updatedAt} />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={!hasChanges || saveMutation.isPending || !draft.season.trim()}
            onClick={() => saveMutation.mutate()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-900 px-4 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-30"
          >
            <Save size={14} />
            Uložit
          </button>
          <button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (window.confirm(`Opravdu smazat sezonu ${season.season}?`)) {
                deleteMutation.mutate()
              }
            }}
            className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-40"
            aria-label="Smazat sezonu"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <SeasonFields draft={draft} setDraft={setDraft} />

      {(saveMutation.isError || deleteMutation.isError) && (
        <div className="mt-4 text-xs font-semibold text-red-700">
          Změnu sezony se nepodařilo uložit.
        </div>
      )}
    </section>
  )
}

function NewSeasonCard({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [draft, setDraft] = useState<SeasonDraft>(emptySeasonDraft)

  const mutation = useMutation({
    mutationFn: () => createClubSeasonStat(draftToSeasonInput(draft)),
    onSuccess: onSaved,
  })

  return (
    <section className="mt-4 rounded-[28px] border border-brand-900/10 bg-brand-50/70 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold text-brand-900">Nová sezona</div>
          <div className="mt-1 text-xs text-ink-500">
            Přidej kompletní řádek do „Minut pravdy“.
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink-500 ring-1 ring-sand-200"
          aria-label="Zavřít"
        >
          <X size={16} />
        </button>
      </div>

      <SeasonFields draft={draft} setDraft={setDraft} />

      <button
        type="button"
        disabled={mutation.isPending || !draft.season.trim()}
        onClick={() => mutation.mutate()}
        className="mt-5 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        Přidat sezonu
      </button>

      {mutation.isError && (
        <div className="mt-3 text-xs font-semibold text-red-700">
          Sezonu se nepodařilo přidat.
        </div>
      )}
    </section>
  )
}

type SeasonDraft = {
  season: string
  matches: string
  record: string
  score: string
  points: string
  competition: string
  position: string
  incomplete: boolean
  outcome: CompetitionOutcome
  nextCompetition: string
}

const emptySeasonDraft: SeasonDraft = {
  season: '',
  matches: '0',
  record: '',
  score: '',
  points: '0',
  competition: '',
  position: '0',
  incomplete: false,
  outcome: null,
  nextCompetition: '',
}

function SeasonFields({
  draft,
  setDraft,
}: {
  draft: SeasonDraft
  setDraft: (value: SeasonDraft) => void
}) {
  const set = <K extends keyof SeasonDraft>(key: K, value: SeasonDraft[K]) =>
    setDraft({ ...draft, [key]: value })

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Sezona">
        <input
          value={draft.season}
          onChange={(event) => set('season', event.target.value)}
          className="admin-input"
          placeholder="2026/27"
        />
      </Field>
      <Field label="Soutěž">
        <input
          value={draft.competition}
          onChange={(event) => set('competition', event.target.value)}
          className="admin-input"
          placeholder="Okresní přebor"
        />
      </Field>
      <Field label="Umístění">
        <input
          type="number"
          min="0"
          value={draft.position}
          onChange={(event) => set('position', event.target.value)}
          className="admin-input"
        />
      </Field>
      <Field label="Zápasy">
        <input
          type="number"
          min="0"
          value={draft.matches}
          onChange={(event) => set('matches', event.target.value)}
          className="admin-input"
        />
      </Field>
      <Field label="Bilance">
        <input
          value={draft.record}
          onChange={(event) => set('record', event.target.value)}
          className="admin-input"
          placeholder="10–2–4"
        />
      </Field>
      <Field label="Skóre">
        <input
          value={draft.score}
          onChange={(event) => set('score', event.target.value)}
          className="admin-input"
          placeholder="55:26"
        />
      </Field>
      <Field label="Body">
        <input
          type="number"
          value={draft.points}
          onChange={(event) => set('points', event.target.value)}
          className="admin-input"
        />
      </Field>
      <Field label="Výsledek sezony">
        <select
          value={draft.outcome ?? ''}
          onChange={(event) =>
            set(
              'outcome',
              event.target.value === 'promotion' || event.target.value === 'relegation'
                ? event.target.value
                : null,
            )
          }
          className="admin-input"
        >
          <option value="">Bez změny soutěže</option>
          <option value="promotion">Postup</option>
          <option value="relegation">Sestup</option>
        </select>
      </Field>

      <Field label="Následující soutěž">
        <input
          value={draft.nextCompetition}
          onChange={(event) => set('nextCompetition', event.target.value)}
          className="admin-input"
          placeholder="Vyplň při postupu / sestupu"
          disabled={!draft.outcome}
        />
      </Field>

      <label className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white px-4 py-3 lg:col-span-3">
        <input
          type="checkbox"
          checked={draft.incomplete}
          onChange={(event) => set('incomplete', event.target.checked)}
          className="h-4 w-4 accent-brand-700"
        />
        <span className="text-sm font-bold text-brand-900">Nedokončená sezona</span>
      </label>
    </div>
  )
}

function AuditPanel({ audit }: { audit: ClubStatsAuditEntry[] }) {
  return (
    <section className="mt-8 overflow-hidden rounded-[30px] border border-sand-200 bg-[#fbfaf6]">
      <div className="flex items-center justify-between gap-4 border-b border-sand-200 px-5 py-4 sm:px-6">
        <div>
          <div className="text-sm font-extrabold text-brand-900">Poslední změny</div>
          <div className="mt-1 text-xs text-ink-500">
            Auditní stopa ukládá editora, čas i stav před a po změně.
          </div>
        </div>
        <History size={20} className="text-brand-500" />
      </div>

      {audit.length ? (
        <div className="divide-y divide-sand-200">
          {audit.map((entry) => (
            <div
              key={entry.id}
              className="grid gap-2 px-5 py-4 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:px-6"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-brand-700">
                {entry.entityType === 'player' ? <UserRound size={14} /> : <CalendarDays size={14} />}
                {entry.entityType === 'player' ? 'Hráč' : 'Sezona'}
              </div>
              <div>
                <div className="text-sm font-bold text-brand-900">
                  {auditEntityLabel(entry)}
                </div>
                <div className="mt-1 text-xs text-ink-500">
                  {actionLabel(entry.action)} · {entry.changedByEmail || 'Přihlášený editor'}
                </div>
              </div>
              <div className="text-xs font-semibold text-ink-500">
                {formatTimestamp(entry.changedAt)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-10 text-center text-sm text-ink-500">
          Zatím nebyla provedena žádná změna přes administraci.
        </div>
      )}
    </section>
  )
}

function LastEdited({
  audit,
  updatedAt,
  className = '',
}: {
  audit?: ClubStatsAuditEntry
  updatedAt: string | null
  className?: string
}) {
  if (!audit && !updatedAt) {
    return (
      <div className={`text-[11px] leading-5 text-ink-500 ${className}`}>
        Import ze starého webu · dosud neupraveno
      </div>
    )
  }

  return (
    <div className={`text-[11px] leading-5 text-ink-500 ${className}`}>
      <span className="font-semibold text-brand-900">
        {audit?.changedByEmail || 'Editor'}
      </span>
      <br />
      {formatTimestamp(audit?.changedAt || updatedAt)}
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-sm font-bold transition ${
        active ? 'bg-brand-900 text-white' : 'text-ink-500 hover:text-brand-900'
      }`}
    >
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-ink-500">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-sand-200 bg-[#fbfaf6] p-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-ink-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-black tracking-[-0.05em] text-brand-900">
        {value}
      </div>
    </div>
  )
}

function seasonToDraft(season: ClubSeasonStat): SeasonDraft {
  return {
    season: season.season,
    matches: String(season.matches),
    record: season.record,
    score: season.score,
    points: String(season.points),
    competition: season.competition,
    position: String(season.position),
    incomplete: season.incomplete,
    outcome: season.outcome,
    nextCompetition: season.nextCompetition ?? '',
  }
}

function seasonToInput(season: ClubSeasonStat): ClubSeasonInput {
  return {
    season: season.season,
    matches: season.matches,
    record: season.record,
    score: season.score,
    points: season.points,
    competition: season.competition,
    position: season.position,
    incomplete: season.incomplete,
    outcome: season.outcome,
    nextCompetition: season.nextCompetition,
  }
}

function draftToSeasonInput(draft: SeasonDraft): ClubSeasonInput {
  return {
    season: draft.season.trim(),
    matches: toNonNegativeInt(draft.matches),
    record: draft.record.trim(),
    score: draft.score.trim(),
    points: toInt(draft.points),
    competition: draft.competition.trim(),
    position: toNonNegativeInt(draft.position),
    incomplete: draft.incomplete,
    outcome: draft.outcome,
    nextCompetition: draft.outcome ? draft.nextCompetition.trim() || null : null,
  }
}

function toNonNegativeInt(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function toInt(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase('cs')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function formatTimestamp(value?: string | null) {
  if (!value) return 'Bez času'

  return new Intl.DateTimeFormat('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function actionLabel(action: ClubStatsAuditEntry['action']) {
  if (action === 'insert') return 'Přidáno'
  if (action === 'delete') return 'Smazáno'
  return 'Upraveno'
}

function auditEntityLabel(entry: ClubStatsAuditEntry) {
  const data = entry.afterData ?? entry.beforeData
  if (!data) return `Záznam #${entry.entityKey}`

  if (entry.entityType === 'player') {
    return String(data.name ?? `Hráč #${entry.entityKey}`)
  }

  return String(data.season ?? `Sezona #${entry.entityKey}`)
}
