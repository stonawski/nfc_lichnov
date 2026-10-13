import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/LoadingState'
import { Seo } from '../components/Seo'
import { NewsMatchCard } from '../components/NewsMatchCard'
import { NewsArticleMedia } from '../components/NewsArticleMedia'
import { fetchNewsBySlug, fetchPublishedNews, fetchPublishedNewsMedia } from '../lib/data'
import { formatDate } from '../lib/format'
import type { NewsArticle } from '../lib/types'

const DEFAULT_IMAGE = '/hero-lichnov-field.webp'

export function NewsDetailPage() {
  const { slug = '' } = useParams()
  const relatedRail = useRef<HTMLDivElement>(null)
  const query = useQuery({
    queryKey: ['news', slug],
    queryFn: () => fetchNewsBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  })
  const mediaQuery = useQuery({
    queryKey: ['news-media', query.data?.id],
    queryFn: () => fetchPublishedNewsMedia(query.data!.id),
    enabled: Boolean(query.data?.id),
    retry: false,
  })

  const relatedQuery = useQuery({
    queryKey: ['news', 'related'],
    queryFn: () => fetchPublishedNews(16),
    retry: false,
  })

  if (query.isLoading) {
    return <Wrap><LoadingState rows={4} /></Wrap>
  }
  if (query.isError) {
    return (
      <Wrap>
        <ErrorState
          title="Článek se nepodařilo načíst"
          text="Zkus načtení zopakovat."
          onRetry={() => void query.refetch()}
        />
      </Wrap>
    )
  }
  if (!query.data) {
    return (
      <Wrap>
        <EmptyState title="Článek nebyl nalezen" text="Je možné, že už není publikovaný." />
      </Wrap>
    )
  }

  const article = query.data
  const related = (relatedQuery.data ?? []).filter((item) => item.id !== article.id)

  const scrollRelated = (direction: -1 | 1) => {
    const rail = relatedRail.current
    if (!rail) return
    rail.scrollBy({ left: direction * Math.max(rail.clientWidth * 0.8, 260), behavior: 'smooth' })
  }

  return (
    <main className="data-fade-in">
      <Seo
        title={article.title}
        description={article.excerpt || 'Aktualita z fotbalového klubu NFC Lichnov.'}
        image={article.cover_image}
        canonicalPath={`/aktuality/${article.slug}`}
        type="article"
      />

      <section className="relative -mt-[84px] flex min-h-[530px] flex-col justify-end overflow-hidden bg-brand-900 px-5 pb-12 pt-[160px] text-white sm:-mt-[88px] sm:min-h-[610px] sm:pb-16 sm:pt-[170px] md:px-8 lg:min-h-[690px] lg:pb-20">
        <img
          src={article.cover_image || DEFAULT_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(9,25,19,.84)_0%,rgba(9,25,19,.36)_58%,rgba(9,25,19,.12)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(9,25,19,.96)_0%,rgba(9,25,19,.36)_55%,transparent_100%)]" />

        <div className="relative mx-auto w-full max-w-[1240px]">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.17em] text-white/70 sm:text-xs">
            <span className="text-[#b1d4b8]">{article.category || 'Aktualita'}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/60" />
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={14} />
              {formatDate(article.published_at)}
            </span>
          </div>
          <h1 className="mt-5 max-w-[1020px] text-[clamp(2.7rem,6.3vw,6.4rem)] font-black leading-[.94] tracking-[-0.06em]">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/80 sm:text-xl sm:leading-8">
              {article.excerpt}
            </p>
          )}
        </div>
      </section>

      <section className="bg-white px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-20">
        <article className="mx-auto max-w-[860px]">
          <div className="mb-9 flex items-center gap-3 border-b border-sand-200 pb-5">
            <div className="h-1.5 w-12 rounded-full bg-brand-500" />
            <div className="text-[10px] font-black uppercase tracking-[0.17em] text-ink-500">
              NFC Lichnov / Klubový deník
            </div>
          </div>

          {article.match_id && <NewsMatchCard matchId={article.match_id} />}

          <div className="prose-club whitespace-pre-wrap break-words text-base leading-8 text-ink-900 sm:text-[17px] sm:leading-9">
            {article.content || 'Obsah článku zatím není doplněn.'}
          </div>

          {mediaQuery.data && <NewsArticleMedia items={mediaQuery.data} />}

          {mediaQuery.isError && (
            <p className="mt-6 text-sm text-ink-500">Další fotografie a videa se nepodařilo načíst.</p>
          )}

          <div className="mt-14 border-t border-sand-200 pt-8">
            <Link
              to="/aktuality"
              className="inline-flex items-center gap-3 rounded-[15px] bg-brand-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-500"
            >
              <ArrowLeft size={17} />
              Zpět na aktuality
            </Link>
          </div>
        </article>
      </section>

      {related.length > 0 && (
        <section className="overflow-hidden bg-sand-100 px-5 py-14 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1240px]">
            <div className="mb-7 flex items-end justify-between gap-5">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.17em] text-brand-500">
                  Čti dál
                </div>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-brand-900 sm:text-4xl">
                  Další aktuality
                </h2>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => scrollRelated(-1)}
                  aria-label="Předchozí aktuality"
                  className="grid h-10 w-10 place-items-center rounded-full border border-brand-900/15 bg-white text-brand-900 transition hover:bg-brand-900 hover:text-white sm:h-12 sm:w-12"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRelated(1)}
                  aria-label="Další aktuality"
                  className="grid h-10 w-10 place-items-center rounded-full border border-brand-900/15 bg-white text-brand-900 transition hover:bg-brand-900 hover:text-white sm:h-12 sm:w-12"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div
              ref={relatedRail}
              role="region"
              aria-label="Carousel dalších aktualit"
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
            >
              {related.map((item) => <RelatedArticleCard key={item.id} article={item} />)}
            </div>

            <Link
              to="/aktuality"
              className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.11em] text-brand-900 transition hover:text-brand-500"
            >
              Zobrazit všechny aktuality <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}

function RelatedArticleCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      to={`/aktuality/${article.slug}`}
      className="group w-[min(82vw,330px)] shrink-0 snap-start overflow-hidden rounded-[24px] bg-white shadow-[0_12px_30px_rgba(24,53,42,.06)] transition hover:shadow-soft sm:w-[330px]"
    >
      <div className="aspect-[16/10] overflow-hidden bg-sand-200">
        <img
          src={article.cover_image || DEFAULT_IMAGE}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.13em] text-brand-500">
          <span>{article.category || 'Aktualita'}</span>
          <ArrowUpRight size={17} />
        </div>
        <h3 className="mt-3 line-clamp-3 min-h-[3.75rem] text-xl font-black leading-[1.15] tracking-[-0.045em] text-brand-900">
          {article.title}
        </h3>
        <div className="mt-5 border-t border-sand-200 pt-4 text-xs text-ink-500">
          {formatDate(article.published_at)}
        </div>
      </div>
    </Link>
  )
}

function Wrap({ children }: { children: ReactNode }) {
  return (
    <main className="bg-white px-5 py-20 md:px-8">
      <div className="mx-auto max-w-[900px]">{children}</div>
    </main>
  )
}
