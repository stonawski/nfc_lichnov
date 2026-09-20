import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Images,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  createGallery,
  deleteGalleryRecords,
  fetchAdminGalleries,
  fetchAdminGalleryImageCounts,
  fetchAdminGalleryImages,
  setGalleryPublished,
} from '../../lib/adminData'
import { formatDate } from '../../lib/format'
import { deleteMediaObjects, mediaObjectKeyFromUrl } from '../../lib/media'

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function AdminGalleriesPage() {
  const [creating, setCreating] = useState(false)
  const queryClient = useQueryClient()

  const galleriesQuery = useQuery({
    queryKey: ['admin-galleries'],
    queryFn: fetchAdminGalleries,
    retry: false,
  })

  const countsQuery = useQuery({
    queryKey: ['admin-gallery-image-counts'],
    queryFn: fetchAdminGalleryImageCounts,
    retry: false,
  })

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      setGalleryPublished(id, published),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-galleries'] })
      void queryClient.invalidateQueries({ queryKey: ['galleries'] })
    },
  })

  const deleteGalleryMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const images = await fetchAdminGalleryImages(id)
      const objectKeys = images.map((image) => mediaObjectKeyFromUrl(image.image_url))

      if (objectKeys.length) {
        await deleteMediaObjects({
          scope: 'gallery',
          resourceId: id,
          objectKeys,
        })
      }

      await deleteGalleryRecords(id)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-galleries'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-gallery-image-counts'] }),
        queryClient.invalidateQueries({ queryKey: ['galleries'] }),
        queryClient.invalidateQueries({ queryKey: ['gallery-images'] }),
      ])
    },
  })

  const galleries = galleriesQuery.data ?? []
  const publishedCount = galleries.filter((gallery) => gallery.published).length
  const totalPhotos = Object.values(countsQuery.data ?? {}).reduce((sum, value) => sum + value, 0)

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
            Obsah
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
            Galerie
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500">
            Vytvoř galerie, připrav jejich metadata a rozhodni, kdy se zobrazí na veřejném webu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Plus size={17} />
          Nová galerie
        </button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatCard label="Celkem galerií" value={galleries.length} />
        <StatCard label="Publikováno" value={publishedCount} />
        <StatCard label="Fotografií" value={totalPhotos} />
      </div>

      {deleteGalleryMutation.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Galerii se nepodařilo smazat. Zkontroluj, že je nasazená Edge Function
          <code className="mx-1">media-delete</code>.
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-[30px] border border-sand-200 bg-[#fbfaf6]">
        <div className="flex items-center justify-between gap-4 border-b border-sand-200 px-5 py-4 sm:px-6">
          <div>
            <div className="text-sm font-extrabold text-brand-900">Přehled galerií</div>
            <div className="mt-1 text-xs text-ink-500">
              Rozpracované galerie nejsou na veřejném webu vidět.
            </div>
          </div>
          <Images size={20} className="text-brand-500" />
        </div>

        {galleriesQuery.isLoading || countsQuery.isLoading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-[24px] bg-sand-100" />
            ))}
          </div>
        ) : galleriesQuery.isError || countsQuery.isError ? (
          <div className="p-8 text-center">
            <div className="text-lg font-extrabold text-brand-900">Galerie se nepodařilo načíst.</div>
            <p className="mt-2 text-sm text-ink-500">
              Zkontroluj přihlášení a RLS oprávnění editora.
            </p>
          </div>
        ) : galleries.length ? (
          <div className="divide-y divide-sand-200">
            {galleries.map((gallery) => {
              const photoCount = countsQuery.data?.[gallery.id] ?? 0
              const busy =
                publishMutation.isPending && publishMutation.variables?.id === gallery.id
              const deleting =
                deleteGalleryMutation.isPending &&
                deleteGalleryMutation.variables?.id === gallery.id

              return (
                <article
                  key={gallery.id}
                  className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-xl font-extrabold tracking-[-0.035em] text-brand-900">
                        {gallery.title}
                      </h2>
                      <span
                        className={
                          gallery.published
                            ? 'rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-brand-700'
                            : 'rounded-full bg-sand-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-ink-500'
                        }
                      >
                        {gallery.published ? 'Publikováno' : 'Koncept'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-500">
                      <span className="inline-flex items-center gap-1.5">
                        <ImagePlus size={14} />
                        {photoCount} {photoCount === 1 ? 'fotografie' : 'fotografií'}
                      </span>

                      {(gallery.event_date || gallery.created_at) && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDate(gallery.event_date || gallery.created_at)}
                        </span>
                      )}

                      <span className="truncate">/{gallery.slug}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/admin/galerie/${gallery.id}`}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-xs font-bold text-brand-900 ring-1 ring-sand-200 transition hover:bg-sand-100"
                    >
                      <Images size={14} />
                      Spravovat
                    </Link>

                    {gallery.published && (
                      <Link
                        to={`/galerie/${gallery.slug}`}
                        target="_blank"
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-xs font-bold text-ink-500 ring-1 ring-sand-200 transition hover:text-brand-900"
                      >
                        <ArrowUpRight size={14} />
                        Náhled
                      </Link>
                    )}

                    <button
                      type="button"
                      disabled={busy || deleting}
                      onClick={() =>
                        publishMutation.mutate({
                          id: gallery.id,
                          published: !gallery.published,
                        })
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-900 px-3.5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-50"
                    >
                      {gallery.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      {busy
                        ? 'Ukládám…'
                        : gallery.published
                          ? 'Skrýt'
                          : 'Publikovat'}
                    </button>

                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Opravdu chceš smazat galerii „${gallery.title}“? Smažou se i všechny její fotografie z Cloudflare R2.`,
                          )
                        ) {
                          deleteGalleryMutation.mutate({ id: gallery.id })
                        }
                      }}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-50 px-3.5 text-xs font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {deleting ? 'Mažu…' : 'Smazat'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Images size={22} />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-brand-900">Zatím žádná galerie</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
              Vytvoř první galerii. Fotografie do ní přidáme v následujícím kroku přes společný R2 uploader.
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-[30px] border border-dashed border-brand-900/15 bg-brand-50/50 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-brand-500">
              Další krok
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-brand-900">
              Společný Media Uploader
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">
              Upload do Cloudflare R2 bude společný pro galerie, hráče, aktuality i realizační tým.
              Tady se potom objeví drag & drop a správa fotografií konkrétní galerie.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-white px-4 py-3 text-xs font-bold text-brand-900 ring-1 ring-sand-200">
            R2 · nfclichnov
          </div>
        </div>
      </section>

      {creating && <CreateGalleryDialog onClose={() => setCreating(false)} />}
    </div>
  )
}

function CreateGalleryDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const queryClient = useQueryClient()

  const suggestedSlug = useMemo(() => slugify(title), [title])

  const createMutation = useMutation({
    mutationFn: createGallery,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-galleries'] })
      onClose()
    },
  })

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugEdited) setSlug(slugify(value))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    createMutation.mutate({
      title,
      slug: slug || suggestedSlug,
      description,
      event_date: eventDate,
    })
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-brand-900/30 p-3 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-[34px] border border-white/70 bg-[#fbfaf6] p-6 shadow-soft sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-brand-500">
              Nová galerie
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-brand-900">
              Založit fotogalerii
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white ring-1 ring-sand-200"
            aria-label="Zavřít"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field label="Název">
            <input
              required
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              className="admin-input"
              placeholder="Muži vs. ..."
            />
          </Field>

          <Field label="URL slug">
            <input
              required
              value={slug}
              onChange={(event) => {
                setSlugEdited(true)
                setSlug(slugify(event.target.value))
              }}
              className="admin-input"
              placeholder="muzi-vs-souper"
            />
          </Field>

          <Field label="Datum akce">
            <input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Popis">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="admin-input min-h-28 resize-y py-3"
              placeholder="Krátký popis galerie…"
            />
          </Field>

          {createMutation.isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              Galerii se nepodařilo vytvořit. Zkontroluj, jestli už stejný slug neexistuje.
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
              disabled={createMutation.isPending || !title.trim() || !(slug || suggestedSlug)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-brand-900 px-5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={16} />
              {createMutation.isPending ? 'Vytvářím…' : 'Vytvořit galerii'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink-500">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-sand-200 bg-[#fbfaf6] px-5 py-4">
      <div className="text-xs font-semibold text-ink-500">{label}</div>
      <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-brand-900">{value}</div>
    </div>
  )
}
