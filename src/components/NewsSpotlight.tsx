import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../lib/format'
import type { NewsArticle } from '../lib/types'

const FALLBACK_IMAGE = '/hero-lichnov-field.webp'

/**
 * Immersive editorial news stage: the photographs fade into the same dark
 * green as the surrounding homepage section instead of being boxed in a card.
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

  const featured = articles.find((article) => article.featured) ?? articles[0]
  const items = [
    featured,
    ...articles.filter((article) => article.id !== featured.id),
  ].slice(0, maxItems)
  const active = items.find((article) => article.id === selectedId) ?? featured

  return (
    <div className="grid w-full min-w-0 bg-[#102b22] text-white lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="relative flex min-h-[450px] min-w-0 flex-col justify-end overflow-hidden bg-[#102b22] sm:min-h-[520px] lg:min-h-[600px]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {items.map((article) => (
            <img
              key={article.id}
              src={article.cover_image || FALLBACK_IMAGE}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out ${article.id === active.id ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}

          {/* Fade the photograph into the same green at every edge. */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#102b22_0%,rgba(16,43,34,.68)_13%,rgba(16,43,34,.16)_52%,#102b22_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#102b22_0%,rgba(16,43,34,.14)_22%,rgba(16,43,34,.3)_55%,#102b22_100%)]" />
        </div>

        <div className="relative z-10 flex min-h-[450px] flex-1 flex-col justify-between px-5 py-8 sm:min-h-[520px] sm:px-9 sm:py-10 lg:min-h-[600px] lg:px-[max(2.5rem,calc((100vw_-_1240px)/2))] lg:pr-10 lg:py-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">
            NFC Lichnov <span className="mx-2 text-brand-500">/</span> Klubový deník
          </div>

          <div className="max-w-[720px]">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#91d3a6] sm:text-xs">
              <span>{active.category || 'Aktualita'}</span>
              <span className="text-white/45">·</span>
              <span className="text-white/70">{formatDate(active.published_at)}</span>
            </div>
            <h3 className="mt-4 max-w-[700px] text-[clamp(2.35rem,4.6vw,4.7rem)] font-black leading-[.93] tracking-[-0.055em]">
              {active.title}
            </h3>
            {active.excerpt && (
              <p className="mt-4 line-clamp-2 max-w-[580px] text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                {active.excerpt}
              </p>
            )}
            <Link
              to={`/aktuality/${active.slug}`}
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.1em] text-brand-900 transition-colors hover:bg-[#cbead2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Přečíst <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col bg-[#102b22] lg:border-l lg:border-white/10">
        <div className="flex items-center justify-between gap-4 border-y border-white/10 px-5 py-4 lg:border-t-0 lg:px-6 lg:py-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/55">
            Vyber aktualitu
          </span>
          <span className="text-[10px] font-semibold text-white/45">
            {items.length} {items.length === 1 ? 'zpráva' : items.length < 5 ? 'zprávy' : 'zpráv'}
          </span>
        </div>

        <div className="flex min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-1 lg:flex-col lg:overflow-y-auto">
          {items.map((article) => {
            const selected = article.id === active.id
            return (
              <button
                key={article.id}
                type="button"
                onMouseEnter={() => setSelectedId(article.id)}
                onFocus={() => setSelectedId(article.id)}
                onClick={() => setSelectedId(article.id)}
                aria-pressed={selected}
                aria-label={`Zobrazit aktualitu: ${article.title}`}
                className={`group relative flex w-[235px] shrink-0 items-center gap-3 border-r border-white/10 px-4 py-4 text-left transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white sm:w-[295px] lg:min-h-[100px] lg:w-full lg:border-b lg:border-r-0 lg:px-5 ${selected ? 'bg-white/[0.09]' : 'hover:bg-white/[0.05]'}`}
              >
                {selected && (
                  <span aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] w-full bg-[#67bd84] lg:bottom-auto lg:h-full lg:w-[3px]" />
                )}
                <img
                  src={article.cover_image || FALLBACK_IMAGE}
                  alt=""
                  loading="lazy"
                  className="h-[58px] w-[78px] shrink-0 object-cover sm:h-[64px] sm:w-[92px]"
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
          Více aktualit <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  )
}
