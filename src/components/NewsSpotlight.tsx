import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../lib/format'
import type { NewsArticle } from '../lib/types'

const DEFAULT_IMAGE = '/hero-lichnov-field.webp'

/**
 * Shared, selectable lead-story treatment for homepage and news listing.
 * Hover, keyboard focus, or tapping a teaser changes the main story;
 * navigation happens only through the main CTA.
 */
export function NewsSpotlight({
  articles,
  maxItems = 5,
}: {
  articles: NewsArticle[]
  maxItems?: number
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  if (!articles.length) return null

  const lead = articles.find((article) => article.featured) ?? articles[0]
  const items = [lead, ...articles.filter((article) => article.id !== lead.id)].slice(0, maxItems)
  const active = items.find((article) => article.id === selectedId) ?? lead

  return (
    <div className="grid overflow-hidden rounded-[26px] bg-[#10271e] text-white shadow-[0_26px_64px_rgba(16,39,30,.16)] lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_370px]">
      <div className="relative flex min-h-[420px] flex-col justify-end overflow-hidden sm:min-h-[500px] lg:min-h-[540px]">
        <img
          key={active.id}
          src={active.cover_image || DEFAULT_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(9,25,19,.88)_0%,rgba(9,25,19,.58)_43%,rgba(9,25,19,.10)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(9,25,19,.94)_0%,rgba(9,25,19,.30)_50%,transparent_100%)]" />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-6 sm:p-9 lg:p-10 xl:p-12">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.17em] text-[#b1d4b8]">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            NFC Lichnov / Aktuality
          </div>

          <div className="max-w-[700px]">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
              <span className="text-[#a6d3b1]">{active.category || 'Klubové novinky'}</span>
              <span aria-hidden="true">/</span>
              <span>{formatDate(active.published_at)}</span>
            </div>
            <h2 key={`title-${active.id}`} className="mt-4 max-w-[680px] text-[clamp(2rem,4.7vw,4.4rem)] font-black leading-[.96] tracking-[-0.055em]">
              {active.title}
            </h2>
            {active.excerpt && (
              <p className="mt-4 line-clamp-2 max-w-[560px] text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                {active.excerpt}
              </p>
            )}
            <Link
              to={`/aktuality/${active.slug}`}
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-brand-500 px-6 py-3 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Přečíst <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col border-t border-white/10 bg-[#102018] lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 lg:px-6">
          <span className="text-[10px] font-black uppercase tracking-[0.17em] text-white/55">
            Další novinky
          </span>
          <span className="text-[10px] font-semibold text-white/45">{items.length} aktualit</span>
        </div>

        <div className="flex min-w-0 gap-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-1 lg:flex-col lg:overflow-y-auto">
          {items.map((article) => {
            const isActive = article.id === active.id
            return (
              <button
                type="button"
                key={article.id}
                onMouseEnter={() => setSelectedId(article.id)}
                onFocus={() => setSelectedId(article.id)}
                onClick={() => setSelectedId(article.id)}
                aria-pressed={isActive}
                aria-label={`Zobrazit v hlavním okně: ${article.title}`}
                className={`group relative flex w-[230px] shrink-0 items-center gap-3 border-r border-white/10 px-4 py-4 text-left transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#a6d3b1] sm:w-[285px] lg:min-h-[88px] lg:w-full lg:border-b lg:border-r-0 lg:px-5 ${isActive ? 'bg-white/[0.12]' : 'hover:bg-white/[0.06]'}`}
              >
                {isActive && (
                  <span aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] w-full bg-brand-500 lg:bottom-auto lg:h-full lg:w-[3px]" />
                )}
                <img
                  src={article.cover_image || DEFAULT_IMAGE}
                  alt=""
                  loading="lazy"
                  className="h-[58px] w-[78px] shrink-0 rounded-[7px] object-cover sm:h-[64px] sm:w-[92px]"
                />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-xs font-bold leading-5 text-white/90 sm:text-[13px]">
                    {article.title}
                  </span>
                  <span className="mt-1 block text-[10px] text-white/45">
                    {formatDate(article.published_at)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <Link
          to="/aktuality"
          className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-5 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.06]"
        >
          Všechny aktuality <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  )
}
