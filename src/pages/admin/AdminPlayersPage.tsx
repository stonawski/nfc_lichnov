import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminPlayers } from '../../lib/adminData'
import { fetchTeams } from '../../lib/data'
import type { Player } from '../../lib/types'

function playerName(player: Player) {
  return [player.first_name, player.last_name].filter(Boolean).join(' ') || 'Neznámý hráč'
}

export function AdminPlayersPage() {
  const [teamId, setTeamId] = useState<string>('')
  const [query, setQuery] = useState('')

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
              Kategorie
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setTeamId('')}
                className={`shrink-0 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
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
                  className={`shrink-0 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                    teamId === team.id
                      ? 'bg-brand-900 text-white'
                      : 'bg-white text-ink-500 ring-1 ring-sand-200 hover:text-brand-900'
                  }`}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>

          <label className="relative block w-full lg:max-w-xs">
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
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[30px] border border-sand-200 bg-[#fbfaf6]">
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
