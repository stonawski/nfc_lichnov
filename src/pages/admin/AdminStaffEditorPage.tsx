import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Check,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { MediaUploader } from '../../admin/MediaUploader'
import {
  deleteStaffMember,
  fetchAdminStaffById,
  setStaffPhoto,
  updateStaffMember,
  type UpdateStaffInput,
} from '../../lib/adminData'
import { fetchTeams } from '../../lib/data'
import { deleteMediaObjects, mediaObjectKeyFromUrl } from '../../lib/media'
import { safeReturnPath } from '../../lib/navigationState'

export function AdminStaffEditorPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const backTo = safeReturnPath(searchParams, '/admin/realizacni-tym')
  const queryClient = useQueryClient()

  const staffQuery = useQuery({
    queryKey: ['admin-staff-person', id],
    queryFn: () => fetchAdminStaffById(id),
    enabled: Boolean(id),
    retry: false,
  })

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })

  const person = staffQuery.data
  const team = teamsQuery.data?.find((item) => item.id === person?.team_id)
  const isManual = person?.facr_person_id == null

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [bio, setBio] = useState('')
  const [active, setActive] = useState(true)
  const [sortOrder, setSortOrder] = useState('')

  useEffect(() => {
    if (!person) return

    setName(person.name)
    setRole(person.role ?? '')
    setBio(person.bio ?? '')
    setActive(person.active)
    setSortOrder(person.sort_order == null ? '' : String(person.sort_order))
  }, [person])

  const payload = useMemo<UpdateStaffInput>(
    () => ({
      ...(isManual ? { name: name || null } : {}),
      role: role || null,
      photo_url: person?.photo_url ?? null,
      bio: bio || null,
      active,
      sort_order: sortOrder.trim() ? Number(sortOrder) : null,
    }),
    [active, bio, isManual, name, person?.photo_url, role, sortOrder],
  )

  const saveMutation = useMutation({
    mutationFn: () => updateStaffMember(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-staff-person', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-staff'] }),
        queryClient.invalidateQueries({ queryKey: ['staff'] }),
      ])
    },
  })

  const removePhotoMutation = useMutation({
    mutationFn: async () => {
      const previousPhoto = person?.photo_url
      await setStaffPhoto(id, null)

      if (previousPhoto) {
        const objectKey = mediaObjectKeyFromUrl(previousPhoto)
        if (objectKey.startsWith(`staff/${id}/`)) {
          try {
            await deleteMediaObjects({
              scope: 'staff',
              resourceId: id,
              objectKeys: [objectKey],
            })
          } catch (error) {
            console.warn('Old staff photo could not be removed from R2', error)
          }
        }
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-staff-person', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-staff'] }),
        queryClient.invalidateQueries({ queryKey: ['staff'] }),
      ])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const previousPhoto = person?.photo_url

      if (previousPhoto) {
        const objectKey = mediaObjectKeyFromUrl(previousPhoto)
        if (objectKey.startsWith(`staff/${id}/`)) {
          await deleteMediaObjects({
            scope: 'staff',
            resourceId: id,
            objectKeys: [objectKey],
          })
        }
      }

      await deleteStaffMember(id)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-staff'] }),
        queryClient.invalidateQueries({ queryKey: ['staff'] }),
      ])
      navigate(backTo, { replace: true })
    },
  })

  async function handlePhotoUploaded({ publicUrl }: { publicUrl: string }) {
    const previousPhoto = person?.photo_url
    await setStaffPhoto(id, publicUrl)

    if (previousPhoto) {
      const objectKey = mediaObjectKeyFromUrl(previousPhoto)
      if (objectKey.startsWith(`staff/${id}/`)) {
        try {
          await deleteMediaObjects({
            scope: 'staff',
            resourceId: id,
            objectKeys: [objectKey],
          })
        } catch (error) {
          console.warn('Old staff photo could not be removed from R2', error)
        }
      }
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-staff-person', id] }),
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] }),
      queryClient.invalidateQueries({ queryKey: ['staff'] }),
    ])
  }

  if (staffQuery.isLoading || teamsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <div className="h-10 w-56 animate-pulse rounded-2xl bg-sand-100" />
        <div className="mt-6 h-72 animate-pulse rounded-[30px] bg-sand-100" />
      </div>
    )
  }

  if (!person || staffQuery.isError) {
    return (
      <div className="mx-auto max-w-[900px] rounded-[32px] border border-sand-200 bg-[#fbfaf6] p-8 text-center">
        <h1 className="text-2xl font-black tracking-[-0.04em] text-brand-900">
          Člen realizačního týmu nebyl nalezen
        </h1>
        <Link
          to={backTo}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white"
        >
          <ArrowLeft size={16} />
          Zpět na realizační tým
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-brand-900"
          >
            <ArrowLeft size={16} />
            Realizační tým
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-brand-700">
              {team?.name || 'Tým'}
            </span>
            <span
              className={
                person.active
                  ? 'rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-brand-700'
                  : 'rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-red-700'
              }
            >
              {person.active ? 'Aktivní' : 'Neaktivní'}
            </span>
          </div>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
            {isManual ? name || person.name : person.name}
          </h1>
          <div className="mt-2 text-sm font-semibold text-ink-500">
            {role || person.role || 'Realizační tým'}
          </div>
        </div>

        <button
          type="button"
          disabled={saveMutation.isPending || (isManual && !name.trim())}
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
          Profil je uložený.
        </div>
      )}

      {saveMutation.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Profil se nepodařilo uložit. Zkontroluj editor RLS oprávnění tabulky staff.
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-7">
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-brand-500">
            Veřejný profil
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {isManual && (
              <Field label="Jméno">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="admin-input"
                  placeholder="Jan Novák"
                />
              </Field>
            )}

            <Field label="Role">
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="admin-input"
                placeholder="Hlavní trenér"
              />
            </Field>

            <Field label="Pořadí">
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
                  Aktivní člen
                </span>
                <span className="mt-1 block text-xs leading-5 text-ink-500">
                  Neaktivní osoba se nebude zobrazovat na veřejné týmové stránce.
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
                placeholder="Krátký text o trenérovi nebo členu vedení…"
              />
            </Field>
          </div>

          <div className="mt-7 rounded-[24px] border border-brand-900/10 bg-brand-50/60 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand-700" />
              <div>
                <div className="text-sm font-extrabold text-brand-900">
                  {isManual ? 'Ručně založený profil' : 'Synchronizované jméno'}
                </div>
                <p className="mt-1 text-xs leading-5 text-ink-500">
                  {isManual
                    ? 'Jméno lze upravovat přímo v administraci.'
                    : 'Jméno je svázané s externím záznamem. Role, fotografie, medailonek a viditelnost zůstávají ručně spravovatelné.'}
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
                {person.photo_url ? (
                  <img
                    src={person.photo_url}
                    alt={person.name}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="grid h-full place-items-center">
                    <div className="text-center text-ink-500">
                      <UserRound size={38} className="mx-auto" />
                      <div className="mt-3 text-xs font-semibold">Bez fotografie</div>
                    </div>
                  </div>
                )}
              </div>

              {person.photo_url && (
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
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5">
              <MediaUploader
                scope="staff"
                resourceId={person.id}
                multiple={false}
                onUploaded={handlePhotoUploaded}
              />
            </div>

            {removePhotoMutation.isError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                Fotografii se nepodařilo odstranit.
              </div>
            )}
          </section>

          {isManual && (
            <section className="rounded-[30px] border border-red-200 bg-red-50/60 p-5 sm:p-6">
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-red-600">
                Nebezpečná zóna
              </div>
              <p className="mt-2 text-xs leading-5 text-red-700/75">
                Ručně založený profil lze trvale odstranit včetně jeho fotografie v R2.
              </p>

              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (window.confirm(`Opravdu chceš smazat „${person.name}“?`)) {
                    deleteMutation.mutate()
                  }
                }}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-3.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 size={14} />
                {deleteMutation.isPending ? 'Mažu…' : 'Smazat profil'}
              </button>
            </section>
          )}
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
