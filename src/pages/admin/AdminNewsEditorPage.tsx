import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  Star,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MediaUploader } from '../../admin/MediaUploader'
import {
  deleteNewsArticle,
  fetchAdminNewsById,
  setNewsCover,
  setNewsPublished,
  updateNewsArticle,
  type UpdateNewsInput,
} from '../../lib/adminData'
import { fetchTeams } from '../../lib/data'
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

export function AdminNewsEditorPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const articleQuery = useQuery({
    queryKey: ['admin-news-article', id],
    queryFn: () => fetchAdminNewsById(id),
    enabled: Boolean(id),
    retry: false,
  })

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })

  const article = articleQuery.data

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [teamId, setTeamId] = useState('')
  const [featured, setFeatured] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)

  useEffect(() => {
    if (!article) return

    setTitle(article.title)
    setSlug(article.slug)
    setExcerpt(article.excerpt ?? '')
    setContent(article.content ?? '')
    setCategory(article.category ?? '')
    setTeamId(article.team_id ?? '')
    setFeatured(Boolean(article.featured))
  }, [article])

  const payload = useMemo<UpdateNewsInput>(
    () => ({
      title,
      slug,
      excerpt: excerpt || null,
      content: content || null,
      cover_image: article?.cover_image ?? null,
      category: category || null,
      team_id: teamId || null,
      featured,
    }),
    [article?.cover_image, category, content, excerpt, featured, slug, teamId, title],
  )

  const saveMutation = useMutation({
    mutationFn: () => updateNewsArticle(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-news-article', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-news'] }),
        queryClient.invalidateQueries({ queryKey: ['news'] }),
      ])
    },
  })

  const publishMutation = useMutation({
    mutationFn: async (published: boolean) => {
      await updateNewsArticle(id, payload)
      return setNewsPublished(id, published)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-news-article', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-news'] }),
        queryClient.invalidateQueries({ queryKey: ['news'] }),
      ])
    },
  })

  const removeCoverMutation = useMutation({
    mutationFn: async () => {
      const previousCover = article?.cover_image
      await setNewsCover(id, null)

      if (previousCover) {
        const objectKey = mediaObjectKeyFromUrl(previousCover)
        if (objectKey.startsWith(`news/${id}/`)) {
          try {
            await deleteMediaObjects({
              scope: 'news',
              resourceId: id,
              objectKeys: [objectKey],
            })
          } catch (error) {
            console.warn('Old news cover could not be removed from R2', error)
          }
        }
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-news-article', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-news'] }),
        queryClient.invalidateQueries({ queryKey: ['news'] }),
      ])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const coverImage = article?.cover_image

      if (coverImage) {
        const objectKey = mediaObjectKeyFromUrl(coverImage)
        if (objectKey.startsWith(`news/${id}/`)) {
          await deleteMediaObjects({
            scope: 'news',
            resourceId: id,
            objectKeys: [objectKey],
          })
        }
      }

      await deleteNewsArticle(id)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-news'] }),
        queryClient.invalidateQueries({ queryKey: ['news'] }),
      ])
      navigate('/admin/aktuality', { replace: true })
    },
  })

  async function handleCoverUploaded({ publicUrl }: { publicUrl: string }) {
    const previousCover = article?.cover_image
    await setNewsCover(id, publicUrl)

    if (previousCover) {
      const objectKey = mediaObjectKeyFromUrl(previousCover)
      if (objectKey.startsWith(`news/${id}/`)) {
        try {
          await deleteMediaObjects({
            scope: 'news',
            resourceId: id,
            objectKeys: [objectKey],
          })
        } catch (error) {
          console.warn('Old news cover could not be removed from R2', error)
        }
      }
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-news-article', id] }),
      queryClient.invalidateQueries({ queryKey: ['admin-news'] }),
      queryClient.invalidateQueries({ queryKey: ['news'] }),
    ])
  }

  if (articleQuery.isLoading) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <div className="h-10 w-52 animate-pulse rounded-2xl bg-sand-100" />
        <div className="mt-6 h-72 animate-pulse rounded-[30px] bg-sand-100" />
        <div className="mt-5 h-96 animate-pulse rounded-[30px] bg-sand-100" />
      </div>
    )
  }

  if (!article || articleQuery.isError) {
    return (
      <div className="mx-auto max-w-[900px] rounded-[32px] border border-sand-200 bg-[#fbfaf6] p-8 text-center">
        <h1 className="text-2xl font-black tracking-[-0.04em] text-brand-900">
          Aktualita nebyla nalezena
        </h1>
        <Link
          to="/admin/aktuality"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white"
        >
          <ArrowLeft size={16} />
          Zpět na aktuality
        </Link>
      </div>
    )
  }

  const busy = saveMutation.isPending || publishMutation.isPending

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            to="/admin/aktuality"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-brand-900"
          >
            <ArrowLeft size={16} />
            Aktuality
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className={
                article.published
                  ? 'rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-brand-700'
                  : 'rounded-full bg-sand-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-ink-500'
              }
            >
              {article.published ? 'Publikováno' : 'Koncept'}
            </span>

            {article.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-amber-700">
                <Star size={11} />
                Doporučené
              </span>
            )}

            <span className="text-xs text-ink-500">
              {formatDate(article.published_at || article.created_at)}
            </span>
          </div>

          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
            {article.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {article.published && (
            <Link
              to={`/aktuality/${article.slug}`}
              target="_blank"
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-brand-900 ring-1 ring-sand-200 transition hover:bg-sand-100"
            >
              <ExternalLink size={16} />
              Náhled
            </Link>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={() => saveMutation.mutate()}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-brand-900 ring-1 ring-sand-200 transition hover:bg-sand-100 disabled:cursor-wait disabled:opacity-50"
          >
            <Save size={16} />
            {saveMutation.isPending ? 'Ukládám…' : 'Uložit'}
          </button>

          <button
            type="button"
            disabled={busy || !title.trim() || !slug.trim()}
            onClick={() => publishMutation.mutate(!article.published)}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-brand-900 px-4 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-50"
          >
            {article.published ? <EyeOff size={16} /> : <Eye size={16} />}
            {publishMutation.isPending
              ? 'Ukládám…'
              : article.published
                ? 'Skrýt článek'
                : 'Publikovat'}
          </button>
        </div>
      </div>

      {(saveMutation.isSuccess || publishMutation.isSuccess) && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700">
          <Check size={16} />
          Změny jsou uložené.
        </div>
      )}

      {(saveMutation.isError || publishMutation.isError) && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Aktualitu se nepodařilo uložit. Zkontroluj slug a RLS oprávnění tabulky news.
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-7">
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-brand-500">
            Obsah článku
          </div>

          <div className="mt-6 space-y-5">
            <Field label="Nadpis">
              <input
                value={title}
                onChange={(event) => {
                  const value = event.target.value
                  setTitle(value)
                  if (!slugEdited) setSlug(slugify(value))
                }}
                className="admin-input"
              />
            </Field>

            <Field label="URL slug">
              <input
                value={slug}
                onChange={(event) => {
                  setSlugEdited(true)
                  setSlug(slugify(event.target.value))
                }}
                className="admin-input"
              />
            </Field>

            <Field label="Perex">
              <textarea
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                className="admin-input min-h-28 resize-y py-3"
                placeholder="Krátké shrnutí článku, které se zobrazí v přehledu…"
              />
            </Field>

            <Field label="Text aktuality">
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="admin-input min-h-[420px] resize-y py-4 leading-7"
                placeholder="Napiš obsah článku…"
              />
            </Field>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-6">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-brand-500">
              Nastavení
            </div>

            <div className="mt-5 space-y-5">
              <Field label="Kategorie">
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="admin-input"
                  placeholder="Klub, Muži, Mládež…"
                />
              </Field>

              <Field label="Tým">
                <select
                  value={teamId}
                  onChange={(event) => setTeamId(event.target.value)}
                  className="admin-input"
                >
                  <option value="">Celý klub</option>
                  {(teamsQuery.data ?? []).map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </Field>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-sand-200 bg-white p-4">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) => setFeatured(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-brand-700"
                />
                <span>
                  <span className="block text-sm font-bold text-brand-900">
                    Doporučená aktualita
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-ink-500">
                    Označí článek jako důležitý pro zvýraznění na webu.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-6">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-brand-500">
              Titulní fotografie
            </div>

            {article.cover_image ? (
              <div className="mt-5">
                <div className="aspect-[16/10] overflow-hidden rounded-[22px] bg-sand-100">
                  <img
                    src={article.cover_image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  disabled={removeCoverMutation.isPending}
                  onClick={() => {
                    if (window.confirm('Opravdu chceš odstranit titulní fotografii?')) {
                      removeCoverMutation.mutate()
                    }
                  }}
                  className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-red-50 px-3.5 text-xs font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {removeCoverMutation.isPending ? 'Odstraňuji…' : 'Odstranit fotografii'}
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] border border-dashed border-sand-200 bg-white p-5 text-center">
                <ImageIcon size={22} className="mx-auto text-ink-500" />
                <p className="mt-2 text-xs leading-5 text-ink-500">
                  Článek zatím nemá titulní fotografii.
                </p>
              </div>
            )}

            <div className="mt-5">
              <MediaUploader
                scope="news"
                resourceId={article.id}
                multiple={false}
                onUploaded={handleCoverUploaded}
              />
            </div>
          </section>

          <section className="rounded-[30px] border border-red-200 bg-red-50/60 p-5 sm:p-6">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-red-600">
              Nebezpečná zóna
            </div>
            <p className="mt-2 text-xs leading-5 text-red-700/75">
              Smazání článku je nevratné a odstraní i titulní fotografii uloženou v R2.
            </p>

            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (window.confirm(`Opravdu chceš smazat aktualitu „${article.title}“?`)) {
                  deleteMutation.mutate()
                }
              }}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-3.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {deleteMutation.isPending ? 'Mažu…' : 'Smazat aktualitu'}
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink-500">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  )
}
