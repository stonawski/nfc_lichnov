import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  ArrowUpRight,
  Pin,
  Search,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DataFade } from '../components/DataFade'
import { HeroFieldBackdrop } from '../components/HeroFieldBackdrop'
import { EmptyState, LoadingState } from '../components/LoadingState'
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
  const pinned =
    articles.find((article) => article.featured) ??
    articles[0] ??
    null

  const categories = useMemo(() => {
    const actual = articles
      .map((article) => article.category?.trim())
      .filter((value): value is string => Boolean(value))

    return [...new Set([...COMMON_CATEGORIES, ...actual])]
  }, [articles])

  const filtered = useMemo(() => {
    const needle = normalizeSearch(search)

    return articles.filter((article) => {
      if (article.id === pinned?.id) return false
      if (category !== 'all' && article.category !== category) return false
      if (teamId !== 'all' && article.team_id !== teamId) return false

      if (needle) {
        const haystack = normalizeSearch(
          [article.title, article.excerpt, article.category]
            .filter(Boolean)
            .join(' '),
        )
        if (!haystack.includes(needle)) return false
      }

      return true
    })
  }, [articles, category, pinned?.id, search, teamId])

  const hasFilters =
    search.trim().length > 0 || category !== 'all' || teamId !== 'all'

  const resetFilters = () => {
    setSearch('')
    setCategory('all')
    setTeamId('all')
  }

  return (
    <main>
      <section className="relative -mt-[84px] overflow-hidden px-5 pb-10 pt-[120px] sm:-mt-[88px] sm:pt-[132px] md:px-8 md:pb-12 md:pt-[140px]">
        <HeroFieldBackdrop />

        <div className="relative mx-auto w-full max-w-[1240px]">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,.78fr)_minmax(440px,1.22fr)] lg:items-end">
            <div className="max-w-[680px] py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
                Klubový deník
              </div>
              <h1 className="mt-4 text-[clamp(3.3rem,6.6vw,6.35rem)] font-black leading-[.88] tracking-[-0.072em] text-brand-900">
                Co se děje
                <span className="block text-brand-500">v NFC Lichnov.</span>
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-ink-500 sm:text-base sm:leading-8">
                Zápasy, turnaje, mládež i dění v klubu. Vyfiltruj si přesně to,
                co tě zajímá, nebo začni připnutou zprávou.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
                <span className="rounded-full border border-white/80 bg-white/65 px-3 py-2 backdrop-blur">
                  {articles.length} {articleCountLabel(articles.length)}
                </span>
                {pinned?.featured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/15 bg-brand-50/80 px-3 py-2 text-brand-700 backdrop-blur">
                    <Pin size={12} />
                    Připnutá aktualita
                  </span>
                )}
              </div>
            </div>

            <PinnedNewsCard article={pinned} />
          </div>

          <div className="mt-8 rounded-[24px] border border-white/80 bg-white/[0.84] px-5 py-5 shadow-[0_16px_42px_rgba(24,53,42,.06)] backdrop-blur-md sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(260px,.72fr)_1.28fr] lg:items-start">
              <label className="relative block">
                <span className="sr-only">Hledat v aktualitách</span>
                <Search
                  size={17}
                  className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ink-500"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Hledat v aktualitách"
                  className="h-11 w-full border-b border-brand-900/15 bg-transparent pl-7 pr-8 text-sm font-semibold text-brand-900 outline-none transition-colors placeholder:font-medium placeholder:text-ink-500/60 focus:border-brand-500"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-0 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-500 transition-colors hover:bg-white hover:text-brand-900"
                    aria-label="Vymazat hledání"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>

              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-sm font-extrabold text-brand-900">
                    Druh zprávy
                  </div>
                  <div className="text-[11px] font-semibold text-ink-500">
                    {filtered.length} {articleCountLabel(filtered.length)}
                  </div>
                </div>

                <div className="mt-3 flex gap-x-5 gap-y-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <FilterButton
                    active={category === 'all'}
                    onClick={() => setCategory('all')}
                    count={articles.filter((article) => article.id !== pinned?.id).length}
                  >
                    Všechny
                  </FilterButton>
                  {categories.map((item) => (
                    <FilterButton
                      key={item}
                      active={category === item}
                      onClick={() => setCategory(item)}
                      count={articles.filter((article) => article.id !== pinned?.id && article.category === item).length}
                    >
                      {item}
                    </FilterButton>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-brand-900/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="shrink-0 text-sm font-extrabold text-brand-900">
                  Tým
                </div>

                <div className="flex min-w-0 gap-x-4 gap-y-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <TeamFilter
                    active={teamId === 'all'}
                    onClick={() => setTeamId('all')}
                  >
                    Všechny
                  </TeamFilter>
                  {teams.map((team) => (
                    <TeamFilter
                      key={team.id}
                      active={teamId === team.id}
                      onClick={() => setTeamId(team.id)}
                    >
                      {team.short_name || team.name}
                    </TeamFilter>
                  ))}
                </div>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex shrink-0 items-center gap-1.5 self-start text-xs font-bold text-brand-700 transition-colors hover:text-brand-500 sm:self-auto"
                >
                  <X size={13} />
                  Zrušit filtry
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand-100 px-5 pb-14 pt-12 md:px-8 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-[1240px]">
          {query.isLoading || teamsQuery.isLoading ? (
            <LoadingState rows={5} />
          ) : query.isError ? (
            <EmptyState
              title="Aktuality se nepodařilo načíst"
              text="Zkus načtení zopakovat. Pokud problém přetrvá, může být dočasně nedostupné spojení s obsahem klubu."
            />
          ) : articles.length === 0 ? (
            <EmptyNewsState />
          ) : (
            <>
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
                    Přehled
                  </div>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-brand-900 sm:text-4xl">
                    Další aktuality
                  </h2>
                </div>
                <div className="text-xs font-semibold text-ink-500">
                  {filtered.length} {articleCountLabel(filtered.length)}
                </div>
              </div>

              {filtered.length ? (
                <DataFade
                  key={`${category}-${teamId}-${search}`}
                  className="stagger-children grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                >
                  {filtered.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </DataFade>
              ) : (
                <div className="rounded-[30px] border border-sand-200 bg-white p-7 text-center sm:p-10">
                  <div className="text-xl font-extrabold tracking-[-0.035em] text-brand-900">
                    Pro tento filtr tu zatím nic není.
                  </div>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink-500">
                    Zkus jiný druh zprávy, tým nebo vymaž hledání.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 inline-flex items-center gap-2 rounded-[14px] bg-brand-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
                  >
                    Zobrazit všechny aktuality
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function PinnedNewsCard({ article }: { article: NewsArticle | null }) {
  if (!article) {
    return (
      <div className="relative min-h-[300px] overflow-hidden rounded-[34px] bg-brand-900 p-6 text-white shadow-[0_22px_64px_rgba(24,53,42,.15)] sm:p-8">
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center] opacity-35"
        />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(24,53,42,.98)_0%,rgba(24,53,42,.84)_62%,rgba(20,83,45,.66)_100%)]" />

        <div className="relative flex h-full min-h-[252px] flex-col justify-between">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/60">
            <Pin size={12} />
            Připnutá aktualita
          </div>

          <div>
            <h2 className="max-w-lg text-3xl font-black leading-[.98] tracking-[-0.05em] sm:text-4xl">
              Hlavní zpráva dostane svoje místo tady.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/60">
              Jakmile zveřejníš první aktualitu, můžeš ji v administraci označit jako
              připnutou a hero ji automaticky vytáhne dopředu.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/zapasy"
                className="inline-flex items-center gap-2 rounded-[13px] bg-white px-4 py-2.5 text-xs font-bold text-brand-900 transition hover:bg-brand-50"
              >
                Program a výsledky <ArrowRight size={13} />
              </Link>
              <Link
                to="/tymy"
                className="inline-flex items-center gap-2 rounded-[13px] border border-white/15 bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/[0.12]"
              >
                Naše týmy
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link
      to={`/aktuality/${article.slug}`}
      className="group relative min-h-[300px] overflow-hidden rounded-[34px] bg-brand-900 text-white shadow-[0_22px_64px_rgba(24,53,42,.15)]"
    >
      {article.cover_image ? (
        <img
          src={article.cover_image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
        />
      ) : (
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center] opacity-55"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,53,42,.06)_0%,rgba(24,53,42,.38)_48%,rgba(24,53,42,.97)_100%)]" />

      <div className="relative flex min-h-[300px] flex-col justify-between p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-brand-900/30 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/75 backdrop-blur">
            <Pin size={12} />
            {article.featured ? 'Připnutá aktualita' : 'Nejnovější aktualita'}
          </div>
          <ArrowUpRight
            size={20}
            className="text-white/55 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
          />
        </div>

        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-white/50">
            <span>{article.category || 'Aktualita'}</span>
            <span>·</span>
            <span>{formatDate(article.published_at)}</span>
          </div>
          <h2 className="mt-3 text-3xl font-black leading-[.98] tracking-[-0.05em] sm:text-4xl">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-4 line-clamp-2 max-w-xl text-sm leading-6 text-white/65">
              {article.excerpt}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      to={`/aktuality/${article.slug}`}
      className="group overflow-hidden rounded-[30px] border border-sand-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="aspect-[16/10] overflow-hidden bg-sand-100">
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <img
            src="/hero-lichnov-field.webp"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-70"
          />
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-500">
            {article.category || 'Aktualita'}
          </span>
          <ArrowUpRight
            size={17}
            className="text-ink-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-500"
          />
        </div>
        <h3 className="mt-3 text-2xl font-extrabold leading-[1.05] tracking-[-0.04em] text-brand-900">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-500">
            {article.excerpt}
          </p>
        )}
        <div className="mt-5 border-t border-sand-200 pt-4 text-xs text-ink-500">
          {formatDate(article.published_at)}
        </div>
      </div>
    </Link>
  )
}

function FilterButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative shrink-0 pb-2 text-sm font-semibold transition-colors ${
        active ? 'text-brand-900' : 'text-ink-500 hover:text-brand-900'
      }`}
    >
      <span>{children}</span>
      <span
        className={`ml-1.5 text-[10px] font-bold tabular-nums ${
          active ? 'text-brand-500' : 'text-ink-500/55'
        }`}
      >
        {count}
      </span>
      <span
        className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-opacity ${
          active ? 'bg-brand-500 opacity-100' : 'bg-brand-500 opacity-0 group-hover:opacity-35'
        }`}
      />
    </button>
  )
}

function TeamFilter({
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
      aria-pressed={active}
      className={`shrink-0 text-xs font-semibold transition-colors ${
        active
          ? 'text-brand-900 underline decoration-brand-500 decoration-2 underline-offset-4'
          : 'text-ink-500 hover:text-brand-900'
      }`}
    >
      {children}
    </button>
  )
}

function EmptyNewsState() {
  return (
    <div className="grid overflow-hidden rounded-[38px] bg-brand-900 text-white shadow-soft lg:grid-cols-[1.08fr_.92fr]">
      <div className="relative min-h-[360px] overflow-hidden p-7 sm:min-h-[420px] sm:p-10 lg:p-12">
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-55"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,53,42,.96)_0%,rgba(24,53,42,.80)_58%,rgba(24,53,42,.48)_100%)]" />

        <div className="relative flex h-full min-h-[306px] flex-col justify-end sm:min-h-[340px]">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            Klubový deník
          </div>
          <h2 className="mt-3 max-w-xl text-4xl font-black leading-[.98] tracking-[-0.055em] sm:text-5xl">
            První zprávy připravujeme.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
            Jakmile zveřejníme první článek, připnutá aktualita i filtrování se
            naplní automaticky.
          </p>
        </div>
      </div>

      <div className="grid bg-[#143126] sm:grid-cols-2 lg:grid-cols-1">
        <Link
          to="/zapasy"
          className="group flex min-h-[170px] items-end justify-between gap-5 border-b border-white/10 p-7 transition hover:bg-white/[0.05] sm:border-b-0 sm:border-r lg:border-b lg:border-r-0"
        >
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
              Aktuálně
            </div>
            <div className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">
              Program a výsledky
            </div>
          </div>
          <ArrowRight
            size={18}
            className="shrink-0 text-white/45 transition group-hover:translate-x-1 group-hover:text-white"
          />
        </Link>

        <Link
          to="/tymy"
          className="group flex min-h-[170px] items-end justify-between gap-5 p-7 transition hover:bg-white/[0.05]"
        >
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
              NFC Lichnov
            </div>
            <div className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">
              Projít naše týmy
            </div>
          </div>
          <ArrowRight
            size={18}
            className="shrink-0 text-white/45 transition group-hover:translate-x-1 group-hover:text-white"
          />
        </Link>
      </div>
    </div>
  )
}

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase('cs-CZ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function articleCountLabel(count: number) {
  if (count === 1) return 'aktualita'
  if (count >= 2 && count <= 4) return 'aktuality'
  return 'aktualit'
}
