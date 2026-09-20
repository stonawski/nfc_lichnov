import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createNewsDraft,
  deleteNewsArticle,
  fetchAdminNews,
  setNewsPublished,
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

export function AdminNewsPage() {
  const [creating, setCreating] = useState(false)
  const queryClient = useQueryClient()

  const newsQuery = useQuery({
    queryKey: ['admin-news'],
    queryFn: fetchAdminNews,
    retry: false,
  })

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      setNewsPublished(id, published),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-news'] })
      void queryClient.invalidateQueries({ queryKey: ['news'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      coverImage,
    }: {
      id: string
      coverImage: string | null
    }) => {
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
    },
  })

  const articles = newsQuery.data ?? []
  const publishedCount = articles.filter((article) => article.published).length
  const featuredCount = articles.filter((article) => article.featured).length

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
            Obsah
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
            Aktuality
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500">
            Piš klubové články, přidávej titulní fotografie a rozhoduj, kdy se zveřejní.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Plus size={17} />
          Nová aktualita
        </button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatCard label="Celkem článků" value={articles.length} />
        <StatCard label="Publikováno" value={publishedCount} />
        <StatCard label="Doporučené" value={featuredCount} />
      </div>

      {deleteMutation.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Aktualitu se nepodařilo smazat.
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-[30px] border border-sand-200 bg-[#fbfaf6]">
        <div className="flex items-center justify-between gap-4 border-b border-sand-200 px-5 py-4 sm:px-6">
          <div>
            <div className="text-sm font-extrabold text-brand-900">Přehled aktualit</div>
            <div className="mt-1 text-xs text-ink-500">
              Koncepty zůstávají pouze v administraci.
            </div>
          </div>
          <FileText size={20} className="text-brand-500" />
        </div>

        {newsQuery.isLoading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-[24px] bg-sand-100" />
            ))}
          </div>
        ) : newsQuery.isError ? (
          <div className="p-8 text-center">
            <div className="text-lg font-extrabold text-brand-900">
              Aktuality se nepodařilo načíst.
            </div>
            <p className="mt-2 text-sm text-ink-500">
              Zkontroluj přihlášení a RLS oprávnění tabulky news.
            </p>
          </div>
        ) : articles.length ? (
          <div className="divide-y divide-sand-200">
            {articles.map((article) => {
              const publishing =
                publishMutation.isPending && publishMutation.variables?.id === article.id
              const deleting =
                deleteMutation.isPending && deleteMutation.variables?.id === article.id

              return (
                <article
                  key={article.id}
                  className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[96px_1fr_auto] lg:items-center"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-sand-100">
                    {article.cover_image ? (
                      <img
                        src={article.cover_image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-ink-500">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-xl font-extrabold tracking-[-0.035em] text-brand-900">
                        {article.title}
                      </h2>

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
                    </div>

                    {article.excerpt && (
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-ink-500">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {formatDate(article.published_at || article.created_at)}
                      </span>
                      <span>/{article.slug}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/admin/aktuality/${article.id}`}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-xs font-bold text-brand-900 ring-1 ring-sand-200 transition hover:bg-sand-100"
                    >
                      Upravit
                    </Link>

                    {article.published && (
                      <Link
                        to={`/aktuality/${article.slug}`}
                        target="_blank"
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-xs font-bold text-ink-500 ring-1 ring-sand-200 transition hover:text-brand-900"
                      >
                        <ArrowUpRight size={14} />
                        Náhled
                      </Link>
                    )}

                    <button
                      type="button"
                      disabled={publishing || deleting}
                      onClick={() =>
                        publishMutation.mutate({
                          id: article.id,
                          published: !article.published,
                        })
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-900 px-3.5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-50"
                    >
                      {article.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      {publishing
                        ? 'Ukládám…'
                        : article.published
                          ? 'Skrýt'
                          : 'Publikovat'}
                    </button>

                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Opravdu chceš smazat aktualitu „${article.title}“?`,
                          )
                        ) {
                          deleteMutation.mutate({
                            id: article.id,
                            coverImage: article.cover_image,
                          })
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
              <FileText size={22} />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-brand-900">Zatím žádná aktualita</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
              Vytvoř první článek a otevři jeho editor.
            </p>
          </div>
        )}
      </section>

      {creating && <CreateNewsDialog onClose={() => setCreating(false)} />}
    </div>
  )
}

function CreateNewsDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const suggestedSlug = useMemo(() => slugify(title), [title])

  const createMutation = useMutation({
    mutationFn: createNewsDraft,
    onSuccess: async (article) => {
      await queryClient.invalidateQueries({ queryKey: ['admin-news'] })
      onClose()
      navigate(`/admin/aktuality/${article.id}`)
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
    })
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
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-brand-500">
              Nová aktualita
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-brand-900">
              Založit článek
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
              placeholder="Co se děje v NFC Lichnov"
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
              placeholder="co-se-deje-v-nfc-lichnov"
            />
          </Field>

          {createMutation.isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              Aktualitu se nepodařilo vytvořit. Zkontroluj, jestli už stejný slug neexistuje.
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
              {createMutation.isPending ? 'Vytvářím…' : 'Vytvořit koncept'}
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
      <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink-500">
        {label}
      </span>
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
