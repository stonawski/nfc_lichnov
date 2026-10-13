import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CalendarDays,
  Search,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Film,
  Images,
  Plus,
  Save,
  Star,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MediaUploader } from '../../admin/MediaUploader'
import {
  addNewsMedia,
  deleteNewsArticle,
  deleteNewsMedia,
  fetchAdminNewsMedia,
  fetchNewsMatchOptions,
  fetchAdminNewsById,
  setNewsCover,
  setNewsPublished,
  updateNewsArticle,
  type UpdateNewsInput,
} from '../../lib/adminData'
import { fetchTeams } from '../../lib/data'
import { formatDate, formatMatchDate } from '../../lib/format'
import { deleteMediaObjects, mediaObjectKeyFromUrl } from '../../lib/media'
import type { NewsMatchOption } from '../../lib/types'

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
  const [matchId, setMatchId] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [featured, setFeatured] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)

  const matchOptionsQuery = useQuery({
    queryKey: ['admin-news-match-options', teamId],
    queryFn: () => fetchNewsMatchOptions(teamId || undefined),
    retry: false,
  })

  const mediaQuery = useQuery({
    queryKey: ['admin-news-media', id],
    queryFn: () => fetchAdminNewsMedia(id),
    enabled: Boolean(id),
    retry: false,
  })
  const media = mediaQuery.data ?? []


  useEffect(() => {
    if (!article) return

    setTitle(article.title)
    setSlug(article.slug)
    setExcerpt(article.excerpt ?? '')
    setContent(article.content ?? '')
    setCategory(article.category ?? '')
    setTeamId(article.team_id ?? '')
    setMatchId(article.match_id ?? '')
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
      match_id: matchId || null,
      featured,
    }),
    [article?.cover_image, category, content, excerpt, featured, matchId, slug, teamId, title],
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

  const mediaMutation = useMutation({
    mutationFn: async ({ url, type }: { url: string; type: 'image' | 'video' }) =>
      addNewsMedia(id, type, url),
    onSuccess: async () => {
      setVideoUrl('')
      await queryClient.invalidateQueries({ queryKey: ['admin-news-media', id] })
      await queryClient.invalidateQueries({ queryKey: ['news-media', id] })
    },
  })

  const deleteMediaMutation = useMutation({
    mutationFn: async ({ id: mediaId, url }: { id: string; url: string }) => {
      await deleteNewsMedia(mediaId)
      try {
        const key = mediaObjectKeyFromUrl(url)
        if (key.startsWith(`news/${id}/`)) {
          await deleteMediaObjects({ scope: 'news', resourceId: id, objectKeys: [key] })
        }
      } catch (error) {
        console.warn('Article media could not be deleted from R2', error)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-news-media', id] })
      await queryClient.invalidateQueries({ queryKey: ['news-media', id] })
    },
  })

  async function handleAdditionalMediaUploaded({
    publicUrl, originalFile,
  }: {
    publicUrl: string
    originalFile: File
  }) {
    await mediaMutation.mutateAsync({
      url: publicUrl,
      type: originalFile.type.startsWith('video/') ? 'video' : 'image',
    })
  }

  function saveVideoLink() {
    try {
      const url = new URL(videoUrl.trim())
      const hostname = url.hostname.toLowerCase()
      const validHost =
        hostname === 'youtube.com' || hostname === 'www.youtube.com' ||
        hostname === 'youtu.be' || hostname === 'vimeo.com' ||
        hostname === 'www.vimeo.com' ||
        /\\.(mp4|webm)$/i.test(url.pathname)
      if (url.protocol !== 'https:' || !validHost) throw new Error('Unsupported URL')
      mediaMutation.mutate({ type: 'video', url: url.toString() })
    } catch {
      window.alert('Vlož platnou HTTPS adresu YouTube, Vimeo nebo MP4/WebM videa.')
    }
  }

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

      // Also remove media owned by this news item from R2.
      const objectKeys = media
        .map((item) => {
          try {
            const key = mediaObjectKeyFromUrl(item.media_url)
            return key.startsWith(`news/${id}/`) ? key : null
          } catch {
            return null
          }
        })
        .filter((key): key is string => Boolean(key))
      if (objectKeys.length) {
        try {
          await deleteMediaObjects({ scope: 'news', resourceId: id, objectKeys })
        } catch (error) {
          console.warn('News media cleanup failed', error)
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
                  onChange={(event) => {
                    setTeamId(event.target.value)
                    setMatchId('')
                  }}
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

              <MatchPicker
                value={matchId}
                onChange={setMatchId}
                matches={matchOptionsQuery.data ?? []}
                loading={matchOptionsQuery.isLoading}
                error={matchOptionsQuery.isError}
              />

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

          <section className="rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-500">
              <Images size={15} /> Galerie článku
            </div>
            <p className="mt-2 text-xs leading-5 text-ink-500">
              Fotografie a videa se zobrazí pod obsahem článku, před dalšími aktualitami.
            </p>

            {media.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                {media.map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
                    <div className="relative aspect-[4/3] bg-sand-100">
                      {item.media_type === 'image' ? (
                        <img src={item.media_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 px-2 text-center">
                          <Film size={26} className="text-brand-700" />
                          <span className="line-clamp-2 break-all text-[10px] text-ink-500">{item.media_url}</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={deleteMediaMutation.isPending}
                      onClick={() => {
                        if (window.confirm('Odstranit toto médium z aktuality?')) {
                          deleteMediaMutation.mutate({ id: item.id, url: item.media_url })
                        }
                      }}
                      className="flex w-full items-center justify-center gap-1.5 px-2 py-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={13} /> Odstranit
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5">
              <MediaUploader
                scope="news"
                resourceId={id}
                allowVideo
                onUploaded={handleAdditionalMediaUploaded}
              />
            </div>

            <div className="mt-5 border-t border-sand-200 pt-5">
              <Field label="Nebo vložit odkaz na video">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  className="admin-input"
                />
              </Field>
              <button
                type="button"
                disabled={!videoUrl.trim() || mediaMutation.isPending}
                onClick={saveVideoLink}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
              >
                <Plus size={14} /> Přidat video
              </button>
            </div>
            {(mediaQuery.isError || mediaMutation.isError || deleteMediaMutation.isError) && (
              <p className="mt-3 text-xs font-semibold text-red-600">
                Média se nepodařilo načíst nebo uložit. Zkontroluj databázovou migraci a oprávnění.
              </p>
            )}
          </section>

          <section className="rounded-[30px] border border-red-200 bg-red-50/60 p-5 sm:p-6">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-red-600">
              Nebezpečná zóna
            </div>
            <p className="mt-2 text-xs leading-5 text-red-700/75">
              Smazání článku je nevratné a odstraní také připojené fotografie a videa.
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


function MatchPicker({
  value,
  onChange,
  matches,
  loading,
  error,
}: {
  value: string
  onChange: (id: string) => void
  matches: NewsMatchOption[]
  loading: boolean
  error: boolean
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [search, setSearch] = useState('')
  const selected = matches.find((match) => match.id === value)
  const normalized = search.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const filtered = matches.filter((match) =>
    [match.home_team_name, match.away_team_name, formatMatchDate(match.playing_at)]
      .join(' ')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .includes(normalized),
  )
  const now = Date.now()
  const upcoming = filtered.filter((match) => new Date(match.playing_at).getTime() > now)
  const played = filtered.filter((match) => new Date(match.playing_at).getTime() <= now)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) {
        detailsRef.current?.removeAttribute('open')
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') detailsRef.current?.removeAttribute('open')
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const choose = (id: string) => {
    onChange(id)
    setSearch('')
    detailsRef.current?.removeAttribute('open')
  }

  const buttonRows = (rows: NewsMatchOption[]) => rows.map((match) => {
    const active = match.id === value
    return (
      <button
        key={match.id}
        type="button"
        onClick={() => choose(match.id)}
        className={`flex w-full items-center justify-between gap-3 rounded-[13px] px-3 py-3 text-left transition-colors ${active
          ? 'bg-brand-900 text-white'
          : 'text-brand-900 hover:bg-brand-50'}`}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold leading-5">
            {match.home_team_name} – {match.away_team_name}
          </span>
          <span className={`mt-0.5 block text-[10px] ${active ? 'text-white/70' : 'text-ink-500'}`}>
            {formatMatchDate(match.playing_at)}
            {match.final_score ? ` · ${match.final_score}` : ''}
          </span>
        </span>
        {active && <Check size={16} className="shrink-0 text-[#80dba1]" />}
      </button>
    )
  })

  return (
    <div className="relative">
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.13em] text-ink-500">
        Přiřadit k zápasu (nepovinné)
      </div>
      <details ref={detailsRef} className="group relative">
        <summary
          className="flex min-h-[48px] w-full cursor-pointer list-none items-center justify-between gap-3 rounded-[16px] border border-brand-900/10 bg-white px-4 py-3 text-left text-sm font-bold text-brand-900 shadow-[0_6px_24px_rgba(24,53,42,.04)] outline-none transition hover:border-brand-500/30 focus-visible:ring-2 focus-visible:ring-brand-500/30 [&::-webkit-details-marker]:hidden"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <CalendarDays size={17} className="shrink-0 text-brand-500" />
            <span className="min-w-0 truncate">
              {loading ? 'Načítám zápasy…' : selected
                ? `${selected.home_team_name} – ${selected.away_team_name}`
                : value ? 'Dříve přiřazený zápas' : 'Bez přiřazeného zápasu'}
            </span>
          </span>
          <ChevronDown size={17} className="shrink-0 text-brand-500 transition-transform group-open:rotate-180" />
        </summary>
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-[20px] border border-brand-900/10 bg-[#fbfaf6] p-2 shadow-[0_18px_45px_rgba(24,53,42,.16)]">
          <label className="flex h-10 items-center gap-2 rounded-[12px] border border-brand-900/10 bg-white px-3">
            <Search size={15} className="shrink-0 text-ink-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault()
              }}
              placeholder="Najít soupeře nebo datum…"
              aria-label="Hledat zápas"
              className="min-w-0 flex-1 bg-transparent text-xs text-brand-900 outline-none"
            />
          </label>
          <div className="mt-2 max-h-[300px] overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={() => choose('')}
              className={`flex w-full items-center justify-between rounded-[13px] px-3 py-2.5 text-left text-xs font-bold ${!value
                ? 'bg-brand-900 text-white'
                : 'text-ink-500 hover:bg-brand-50 hover:text-brand-900'}`}
            >
              Bez přiřazeného zápasu {!value && <Check size={15} className="text-[#80dba1]" />}
            </button>
            {value && !selected && (
              <button type="button" onClick={() => choose(value)} className="w-full rounded-[13px] px-3 py-2.5 text-left text-xs font-bold text-brand-900 hover:bg-brand-50">
                Dříve přiřazený zápas
              </button>
            )}
            {upcoming.length > 0 && (
              <>
                <div className="px-3 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.14em] text-brand-500">
                  Nadcházející zápasy
                </div>
                {buttonRows(upcoming)}
              </>
            )}
            {played.length > 0 && (
              <>
                <div className="px-3 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.14em] text-brand-500">
                  Odehrané zápasy
                </div>
                {buttonRows(played)}
              </>
            )}
            {!loading && upcoming.length === 0 && played.length === 0 && (
              <p className="px-3 py-4 text-xs text-ink-500">Žádný zápas neodpovídá hledání.</p>
            )}
          </div>
        </div>
      </details>
      <p className="mt-2 text-xs leading-5 text-ink-500">
        V aktualitě se zobrazí oba týmy, loga, termín a případně výsledek.
      </p>
      {error && <p className="mt-2 text-xs text-red-600">Zápasy se nepodařilo načíst.</p>}
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
