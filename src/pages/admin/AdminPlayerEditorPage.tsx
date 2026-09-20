import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MediaUploader } from '../../admin/MediaUploader'
import {
  fetchAdminPlayerById,
  setPlayerPhoto,
  updatePlayerProfile,
  type UpdatePlayerProfileInput,
} from '../../lib/adminData'
import { fetchTeams } from '../../lib/data'
import { formatDate } from '../../lib/format'
import { deleteMediaObjects, mediaObjectKeyFromUrl } from '../../lib/media'

function playerName(firstName: string | null, lastName: string | null) {
  return [firstName, lastName].filter(Boolean).join(' ') || 'Neznámý hráč'
}

export function AdminPlayerEditorPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()

  const playerQuery = useQuery({
    queryKey: ['admin-player', id],
    queryFn: () => fetchAdminPlayerById(id),
    enabled: Boolean(id),
    retry: false,
  })

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })

  const player = playerQuery.data
  const team = teamsQuery.data?.find((item) => item.id === player?.team_id)

  const [number, setNumber] = useState('')
  const [position, setPosition] = useState('')
  const [bio, setBio] = useState('')
  const [active, setActive] = useState(true)
  const [sortOrder, setSortOrder] = useState('')

  useEffect(() => {
    if (!player) return

    setNumber(player.number == null ? '' : String(player.number))
    setPosition(player.position ?? '')
    setBio(player.bio ?? '')
    setActive(player.active)
    setSortOrder(player.sort_order == null ? '' : String(player.sort_order))
  }, [player])

  const payload = useMemo<UpdatePlayerProfileInput>(
    () => ({
      number: number.trim() ? Number(number) : null,
      position: position || null,
      photo_url: player?.photo_url ?? null,
      bio: bio || null,
      active,
      sort_order: sortOrder.trim() ? Number(sortOrder) : null,
    }),
    [active, bio, number, player?.photo_url, position, sortOrder],
  )

  const saveMutation = useMutation({
    mutationFn: () => updatePlayerProfile(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-player', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-players'] }),
        queryClient.invalidateQueries({ queryKey: ['players'] }),
      ])
    },
  })

  const removePhotoMutation = useMutation({
    mutationFn: async () => {
      const previousPhoto = player?.photo_url
      await setPlayerPhoto(id, null)

      if (previousPhoto) {
        const objectKey = mediaObjectKeyFromUrl(previousPhoto)
        if (objectKey.startsWith(`players/${id}/`)) {
          try {
            await deleteMediaObjects({
              scope: 'player',
              resourceId: id,
              objectKeys: [objectKey],
            })
          } catch (error) {
            console.warn('Old player photo could not be removed from R2', error)
          }
        }
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-player', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-players'] }),
        queryClient.invalidateQueries({ queryKey: ['players'] }),
      ])
    },
  })

  async function handlePhotoUploaded({ publicUrl }: { publicUrl: string }) {
    const previousPhoto = player?.photo_url
    await setPlayerPhoto(id, publicUrl)

    if (previousPhoto) {
      const objectKey = mediaObjectKeyFromUrl(previousPhoto)
      if (objectKey.startsWith(`players/${id}/`)) {
        try {
          await deleteMediaObjects({
            scope: 'player',
            resourceId: id,
            objectKeys: [objectKey],
          })
        } catch (error) {
          console.warn('Old player photo could not be removed from R2', error)
        }
      }
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-player', id] }),
      queryClient.invalidateQueries({ queryKey: ['admin-players'] }),
      queryClient.invalidateQueries({ queryKey: ['players'] }),
    ])
  }

  if (playerQuery.isLoading || teamsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <div className="h-10 w-56 animate-pulse rounded-2xl bg-sand-100" />
        <div className="mt-6 h-72 animate-pulse rounded-[30px] bg-sand-100" />
      </div>
    )
  }

  if (!player || playerQuery.isError) {
    return (
      <div className="mx-auto max-w-[900px] rounded-[32px] border border-sand-200 bg-[#fbfaf6] p-8 text-center">
        <h1 className="text-2xl font-black tracking-[-0.04em] text-brand-900">
          Hráč nebyl nalezen
        </h1>
        <Link
          to="/admin/hraci"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white"
        >
          <ArrowLeft size={16} />
          Zpět na hráče
        </Link>
      </div>
    )
  }

  const name = playerName(player.first_name, player.last_name)

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            to="/admin/hraci"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-brand-900"
          >
            <ArrowLeft size={16} />
            Hráči
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-brand-700">
              {team?.name || 'Tým'}
            </span>
            <span
              className={
                player.active
                  ? 'rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-brand-700'
                  : 'rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-red-700'
              }
            >
              {player.active ? 'Aktivní' : 'Neaktivní'}
            </span>
          </div>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
            {name}
          </h1>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-500">
            {player.facr_player_id != null && <span>FAČR ID {player.facr_player_id}</span>}
            {player.birth_date && <span>Narozen {formatDate(player.birth_date)}</span>}
          </div>
        </div>

        <button
          type="button"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-brand-900 px-5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-50"
        >
          <Save size={16} />
          {saveMutation.isPending ? 'Ukládám…' : 'Uložit změny'}
        </button>
      </div>

      {saveMutation.isSuccess && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700">
          <Check size={16} />
          Profil hráče je uložený.
        </div>
      )}

      {saveMutation.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Profil se nepodařilo uložit. Zkontroluj editor RLS oprávnění tabulky players.
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-7">
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-brand-500">
            Veřejný profil
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Číslo dresu">
              <input
                type="number"
                min="0"
                max="999"
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                className="admin-input"
                placeholder="10"
              />
            </Field>

            <Field label="Pozice">
              <input
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                className="admin-input"
                placeholder="Záložník"
              />
            </Field>

            <Field label="Pořadí v týmu">
              <input
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="admin-input"
                placeholder="0"
              />
            </Field>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-sand-200 bg-white p-4">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-700"
              />
              <span>
                <span className="block text-sm font-bold text-brand-900">
                  Aktivní hráč
                </span>
                <span className="mt-1 block text-xs leading-5 text-ink-500">
                  Neaktivní hráč se nebude zobrazovat ve veřejné soupisce.
                </span>
              </span>
            </label>
          </div>

          <div className="mt-5">
            <Field label="Medailonek">
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                className="admin-input min-h-44 resize-y py-4 leading-7"
                placeholder="Krátký text o hráči…"
              />
            </Field>
          </div>

          <div className="mt-7 rounded-[24px] border border-brand-900/10 bg-brand-50/60 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand-700" />
              <div>
                <div className="text-sm font-extrabold text-brand-900">
                  Synchronizované údaje neupravujeme
                </div>
                <p className="mt-1 text-xs leading-5 text-ink-500">
                  Jméno, datum narození, FAČR identifikace a zápasové statistiky jsou
                  vedené jako zdrojová sportovní data. Tady upravujeme jen prezentaci hráče.
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-6">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-brand-500">
              Profilová fotografie
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-sand-200 bg-white">
              <div className="aspect-[4/5] bg-sand-100">
                {player.photo_url ? (
                  <img
                    src={player.photo_url}
                    alt={name}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="grid h-full place-items-center">
                    <div className="text-center text-ink-500">
                      <UserRound size={38} className="mx-auto" />
                      <div className="mt-3 text-xs font-semibold">Bez vlastní fotografie</div>
                    </div>
                  </div>
                )}
              </div>

              {player.photo_url && (
                <div className="flex items-center justify-between gap-4 border-t border-sand-200 px-4 py-3">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">
                    <ShieldCheck size={11} />
                    Používá se na webu
                  </div>

                  <button
                    type="button"
                    disabled={removePhotoMutation.isPending}
                    onClick={() => {
                      if (window.confirm('Opravdu chceš odstranit profilovou fotografii?')) {
                        removePhotoMutation.mutate()
                      }
                    }}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    aria-label="Odstranit profilovou fotografii"
                    title="Odstranit fotografii"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {player.facr_photo_url && !player.photo_url && (
              <div className="mt-3 rounded-2xl bg-sand-100 px-4 py-3 text-xs leading-5 text-ink-500">
                FAČR fotografie je v datech dostupná, ale veřejný web používá pouze
                fotografii nahranou administrátorem.
              </div>
            )}

            <div className="mt-5">
              <MediaUploader
                scope="player"
                resourceId={player.id}
                multiple={false}
                onUploaded={handlePhotoUploaded}
              />
            </div>

            {(removePhotoMutation.isError) && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                Fotografii se nepodařilo odstranit.
              </div>
            )}
          </section>

          <section className="rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-500">
              <ImageIcon size={14} />
              Statistiky
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Zápasy" value={player.matches_count} />
              <MiniStat label="Góly" value={player.goals_count} />
              <MiniStat label="Žluté" value={player.yellow_cards} />
              <MiniStat label="Červené" value={player.red_cards} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink-500">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

function MiniStat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-sand-200">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-brand-900">
        {value ?? '—'}
      </div>
    </div>
  )
}
