import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DataFade } from '../components/DataFade'
import { HeroFieldBackdrop } from '../components/HeroFieldBackdrop'
import { EmptyState, LoadingState } from '../components/LoadingState'
import { NewsSpotlight } from '../components/NewsSpotlight'
import { Seo } from '../components/Seo'
import { fetchPublishedNews, fetchTeams } from '../lib/data'
import { formatDate } from '../lib/format'
import type { NewsArticle } from '../lib/types'

const COMMON_CATEGORIES = ['Zápasy', 'Mládež', 'Klub', 'Turnaje', 'Rozhovory']

export function NewsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [teamId, setTeamId] = useState('all')

  const query = useQuery({
    queryKey: ['news'],
    queryFn: () => fetchPublishedNews(),
    retry: false,
  })
  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })

  const articles = query.data ?? []
  const teams = teamsQuery.data ?? []
  const categories = useMemo(() => [
    ...new Set([
      ...COMMON_CATEGORIES,
      ...articles.map((article) => article.category?.trim()).filter((value): value is string => Boolean(value)),
    ]),
  ], [articles])

  const filtered = useMemo(() => {
    const needle = normalizeSearch(search)
    return articles.filter((article) => {
      if (category !== 'all' && article.category !== category) return false
      if (teamId !== 'all' && article.team_id !== teamId) return false
      if (!needle) return true
      const text = [article.title, article.excerpt, article.category, article.content]
        .filter(Boolean).join(' ')
      return normalizeSearch(text).includes(needle)
    })
  }, [articles, category, search, teamId])

  const hasFilters = Boolean(search.trim()) || category !== 'all' || teamId !== 'all'
  const resetFilters = () => {
    setSearch('')
    setCategory('all')
    setTeamId('all')
  }

  return (
    <main>
      <Seo title="Aktuality" description="Aktuální zprávy z NFC Lichnov. Zápasy, mládež, turnaje i klubový život." canonicalPath="/aktuality" />
      <section className="relative -mt-[84px] overflow-hidden px-5 pb-14 pt-[122px] sm:-mt-[88px] sm:pt-[140px] md:px-8 md:pb-20">
        <HeroFieldBackdrop />
        <div className="relative mx-auto w-full max-w-[1320px]">
          <header className="mb-7 max-w-3xl sm:mb-9">
            <div className="text-[10px] font-black uppercase tracking-[0.19em] text-brand-500 sm:text-xs">
              Klubový deník
            </div>
            <h1 className="mt-3 text-[clamp(3rem,6.5vw,6rem)] font-black leading-[.9] tracking-[-0.065em] text-brand-900">
              Aktuality
            </h1>
            <p className="mt-4 text-sm leading-7 text-ink-500 sm:text-base">
              Co se děje na hřišti i mimo něj. Vyber si zprávu v přehledu a přečti si ji celou.
            </p>
          </header>

          {query.isLoading ? (
            <LoadingState rows={5} />
          ) : query.isError ? (
            <EmptyState title="Aktuality se nepodařilo načíst" text="Zkus stránku načíst znovu." />
          ) : articles.length ? (
            <DataFade>
              <NewsSpotlight articles={articles} />
            </DataFade>
          ) : (
            <div className="relative overflow-hidden rounded-[28px] bg-brand-900 p-8 text-white sm:p-12">
              <img src="/hero-lichnov-field.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
              <div className="relative">
                <h2 className="text-3xl font-black">První aktuality připravujeme.</h2>
                <p className="mt-4 max-w-lg text-sm leading-7 text-white/75">
                  Až publikujeme první zprávu, zobrazí se právě tady.
                </p>
                <Link to="/zapasy" className="mt-6 inline-flex items-center gap-2 text-sm font-bold">
                  Program a výsledky <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {articles.length > 0 && (
        <section className="bg-sand-100 px-5 py-14 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1320px]">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.17em] text-brand-500">
                  Archiv zpráv
                </div>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-brand-900 sm:text-4xl">
                  Všechny aktuality
                </h2>
              </div>
              <div className="text-xs font-semibold text-ink-500">
                {filtered.length} {articleCountLabel(filtered.length)}
              </div>
            </div>

            <div className="mb-8 space-y-5 border-y border-brand-900/10 py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <label className="flex h-12 min-w-0 items-center gap-3 rounded-[15px] border border-brand-900/10 bg-white px-4 md:w-[320px]">
                  <Search size={17} className="shrink-0 text-brand-900/50" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Hledat aktualitu…"
                    aria-label="Hledat aktualitu"
                    className="min-w-0 flex-1 bg-transparent text-sm text-brand-900 outline-none placeholder:text-ink-500/60"
                  />
                </label>
                <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Filtr kategorie">
                  <FilterButton active={category === 'all'} onClick={() => setCategory('all')}>Všechny</FilterButton>
                  {categories.map((item) => (
                    <FilterButton key={item} active={category === item} onClick={() => setCategory(item)}>{item}</FilterButton>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">Tým</span>
                <FilterButton active={teamId === 'all'} onClick={() => setTeamId('all')}>Všechny</FilterButton>
                {teams.map((team) => (
                  <FilterButton key={team.id} active={teamId === team.id} onClick={() => setTeamId(team.id)}>
                    {team.short_name || team.name}
                  </FilterButton>
                ))}
                {hasFilters && (
                  <button type="button" onClick={resetFilters} className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-500">
                    <X size={14} /> Zrušit filtry
                  </button>
                )}
              </div>
            </div>

            {filtered.length ? (
              <DataFade key={`${search}-${category}-${teamId}`} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((article) => <NewsCard key={article.id} article={article} />)}
              </DataFade>
            ) : (
              <div className="rounded-[24px] bg-white p-10 text-center">
                <p className="text-xl font-black text-brand-900">Pro tento filtr tu zatím nic není.</p>
                <button type="button" onClick={resetFilters} className="mt-5 rounded-full bg-brand-900 px-5 py-3 text-xs font-bold text-white">
                  Zobrazit všechny aktuality
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      to={`/aktuality/${article.slug}`}
      className="group overflow-hidden rounded-[24px] bg-white transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="aspect-[16/10] overflow-hidden bg-sand-200">
        <img
          src={article.cover_image || '/hero-lichnov-field.webp'}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-brand-500">
          {article.category || 'Aktualita'} <ArrowUpRight size={16} />
        </div>
        <h3 className="mt-3 line-clamp-3 text-2xl font-black leading-[1.08] tracking-[-0.045em] text-brand-900">
          {article.title}
        </h3>
        {article.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-500">{article.excerpt}</p>}
        <div className="mt-5 border-t border-sand-200 pt-4 text-xs text-ink-500">{formatDate(article.published_at)}</div>
      </div>
    </Link>
  )
}

function FilterButton({
  active, onClick, children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition-colors ${active ? 'bg-brand-900 text-white' : 'border border-brand-900/10 bg-white text-ink-500 hover:text-brand-900'}`}
    >
      {children}
    </button>
  )
}

function normalizeSearch(value: string) {
  return value.toLocaleLowerCase('cs-CZ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function articleCountLabel(count: number) {
  if (count === 1) return 'aktualita'
  if (count >= 2 && count <= 4) return 'aktuality'
  return 'aktualit'
}
