import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRight,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createPlayer, fetchAdminPlayers } from '../../lib/adminData'
import { fetchTeams } from '../../lib/data'
import type { Player } from '../../lib/types'

function playerName(player: Player) {
  return [player.first_name, player.last_name].filter(Boolean).join(' ') || 'Neznámý hráč'
}

export function AdminPlayersPage() {
  const [teamId, setTeamId] = useState<string>('')
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })

  const playersQuery = useQuery({
    queryKey: ['admin-players', teamId || 'all'],
    queryFn: () => fetchAdminPlayers(teamId || undefined),
    retry: false,
  })

  const teams = teamsQuery.data ?? []
  const players = playersQuery.data ?? []

  const teamById = useMemo(
    () => new Map(teams.map((team) => [team.id, team])),
    [teams],
  )

  const normalizedQuery = query.trim().toLocaleLowerCase('cs-CZ')
  const filteredPlayers = players.filter((player) => {
    if (!normalizedQuery) return true
    const name = playerName(player).toLocaleLowerCase('cs-CZ')
    return (
      name.includes(normalizedQuery) ||
      String(player.number ?? '').includes(normalizedQuery) ||
      (player.position ?? '').toLocaleLowerCase('cs-CZ').includes(normalizedQuery)
    )
  })

  const activeCount = players.filter((player) => player.active).length
  const withPhotoCount = players.filter((player) => player.photo_url).length

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="max-w-3xl">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
          Týmy
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
          Hráči
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500">
          Správa profilových fotografií, čísel, pozic a medailonků hráčů.
          Identita hráče a FACR údaje zůstávají oddělené od ručních úprav.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatCard label="Hráčů ve výběru" value={players.length} />
        <StatCard label="Aktivních" value={activeCount} />
        <StatCard label="S vlastní fotkou" value={withPhotoCount} />
      </div>

      <section className="mt-6 rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-6">
        <div className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
          Kategorie
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTeamId('')}
            className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
              teamId === ''
                ? 'bg-brand-900 text-white'
                : 'bg-white text-ink-500 ring-1 ring-sand-200 hover:text-brand-900'
            }`}
          >
            Všechny týmy
          </button>

          {teams.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => setTeamId(team.id)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                teamId === team.id
                  ? 'bg-brand-900 text-white'
                  : 'bg-white text-ink-500 ring-1 ring-sand-200 hover:text-brand-900'
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-sand-200 pt-5 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="admin-input pl-11"
              placeholder="Hledat hráče…"
            />
          </label>

          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-brand-900 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            <Plus size={16} />
            Nový hráč
          </button>
        </div>
      </section>

      <section className="mt-6 overflow-hidden<section className="mt-6 overflow-hidden rounded-[30px] border border-sand-200 bg-[#fbfaf6]">
        <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4 sm:px-6">
          <div>
            <div className="text-sm font-extrabold text-brand-900">Soupiska</div>
            <div className="mt-1 text-xs text-ink-500">
              Klikni na hráče a uprav jeho veřejný profil.
            </div>
          </div>
          <UsersRound size={20} className="text-brand-500" />
        </div>

        {playersQuery.isLoading || teamsQuery.isLoading ? (
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-40 animate-pulse rounded-[24px] bg-sand-100" />
            ))}
          </div>
        ) : playersQuery.isError || teamsQuery.isError ? (
          <div className="p-8 text-center">
            <div className="text-lg font-extrabold text-brand-900">
              Hráče se nepodařilo načíst.
            </div>
            <p className="mt-2 text-sm text-ink-500">
              Zkontroluj přihlášení a editor RLS oprávnění tabulky players.
            </p>
          </div>
        ) : filteredPlayers.length ? (
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
            {filteredPlayers.map((player) => {
              const team = teamById.get(player.team_id)

              return (
                <Link
                  key={player.id}
                  to={`/admin/hraci/${player.id}`}
                  className="group flex min-w-0 gap-4 rounded-[24px] border border-sand-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-[18px] bg-sand-100">
                    {player.photo_url ? (
                      <img
                        src={player.photo_url}
                        alt=""
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-ink-500">
                        <UserRound size={25} />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-lg font-extrabold tracking-[-0.035em] text-brand-900">
                          {playerName(player)}
                        </div>
                        <div className="mt-1 truncate text-xs font-semibold text-brand-500">
                          {team?.name || 'Tým'}
                        </div>
                      </div>
                      <ArrowRight
                        size={16}
                        className="mt-1 shrink-0 text-ink-500 transition group-hover:translate-x-1 group-hover:text-brand-500"
                      />
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                      {player.number != null && (
                        <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[10px] font-bold text-brand-900">
                          #{player.number}
                        </span>
                      )}
                      {player.position && (
                        <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[10px] font-bold text-ink-500">
                          {player.position}
                        </span>
                      )}
                      {!player.active && (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700">
                          Neaktivní
                        </span>
                      )}
                      {player.photo_url && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700">
                          <ShieldCheck size={10} />
                          Vlastní foto
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <UserRound size={22} />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-brand-900">
              Žádní hráči pro tento filtr
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
              Změň kategorii nebo hledaný výraz.
            </p>
          </div>
        )}
      </section>

      {creating && (
        <CreatePlayerDialog
          teams={teams}
          initialTeamId={teamId}
          onClose={() => setCreating(false)}
          onCreated={async (playerId) => {
            await queryClient.invalidateQueries({ queryKey: ['admin-players'] })
            setCreating(false)
            navigate(`/admin/hraci/${playerId}`)
          }}
        />
      )}
    </div>
  )
}

function CreatePlayerDialog({
  teams,
  initialTeamId,
  onClose,
  onCreated,
}: {
  teams: ReturnType<typeof fetchTeams> extends Promise<infer T> ? T : never
  initialTeamId: string
  onClose: () => void
  onCreated: (playerId: string) => Promise<void> | void
}) {
  const [selectedTeamId, setSelectedTeamId] = useState(
    initialTeamId || teams[0]?.id || '',
  )
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [number, setNumber] = useState('')

  const createMutation = useMutation({
    mutationFn: () =>
      createPlayer({
        team_id: selectedTeamId,
        first_name: firstName,
        last_name: lastName,
        number: number.trim() ? Number(number) : null,
      }),
    onSuccess: (player) => onCreated(player.id),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    createMutation.mutate()
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-brand-900/30 p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-[34px] border border-white/70 bg-[#fbfaf6] p-6 shadow-soft sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-brand-500">
            Nový hráč
          </div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-brand-900">
            Přidat hráče ručně
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            Ručně založený hráč nebude mít FAČR ID. Jméno pak půjde upravovat i v jeho profilu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink-500">
              Tým
            </span>
            <select
              required
              value={selectedTeamId}
              onChange={(event) => setSelectedTeamId(event.target.value)}
              className="admin-input mt-2"
            >
              <option value="">Vyber tým</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink-500">
                Jméno
              </span>
              <input
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="admin-input mt-2"
                placeholder="Jan"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink-500">
                Příjmení
              </span>
              <input
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="admin-input mt-2"
                placeholder="Novák"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink-500">
              Číslo dresu
            </span>
            <input
              type="number"
              min="0"
              max="999"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              className="admin-input mt-2"
              placeholder="Volitelné"
            />
          </label>

          {createMutation.isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              Hráče se nepodařilo vytvořit. Zkontroluj editor RLS oprávnění tabulky players.
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-2xl bg-white px-5 text-sm font-bold text-ink-500 ring-1 ring-sand-200"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                !selectedTeamId ||
                !firstName.trim() ||
                !lastName.trim()
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-brand-900 px-5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              {createMutation.isPending ? 'Vytvářím…' : 'Vytvořit hráče'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-sand-200 bg-[#fbfaf6] px-5 py-4">
      <div className="text-xs font-semibold text-ink-500">{label}</div>
      <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-brand-900">
        {value}
      </div>
    </div>
  )
}
