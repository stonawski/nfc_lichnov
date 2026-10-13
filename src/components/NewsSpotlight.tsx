import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../lib/format'
import type { NewsArticle } from '../lib/types'

const FALLBACK_IMAGE = '/hero-lichnov-field.webp'

// Mask the image itself to blend organically into the homepage's dark-green stage.
// The image fills the entire editorial panel; no separate header can clip its edge.
const PHOTO_SIDE_MASK =
  'radial-gradient(ellipse 86% 85% at 43% 51%, #000 24%, rgba(0,0,0,.82) 52%, rgba(0,0,0,.24) 82%, transparent 100%)'
const PHOTO_VERTICAL_MASK =
  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.34) 14%, #000 30%, #000 61%, rgba(0,0,0,.48) 78%, transparent 100%)'

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
    <section className="relative isolate overflow-hidden bg-[#102b22] pb-7 text-white" aria-label="Aktuálně z Lichnova">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{ maskImage: PHOTO_SIDE_MASK, WebkitMaskImage: PHOTO_SIDE_MASK }}
      >
        {items.map((article) => (
          <img
            key={article.id}
            src={article.cover_image || FALLBACK_IMAGE}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out ${article.id === active.id ? 'opacity-100' : 'opacity-0'}`}
            style={{
              maskImage: PHOTO_VERTICAL_MASK,
              WebkitMaskImage: PHOTO_VERTICAL_MASK,
            }}
          />
        ))}
      </div>
      {/* Soft emerald glow on the left, inspired by the editorial lighting in the reference.
          Keep the rest of the image legible and melt the right edge into the panel. */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background: [
            'radial-gradient(ellipse 85% 115% at -15% 54%, rgba(39,138,89,.48) 0%, rgba(25,109,73,.30) 38%, rgba(18,74,50,.12) 74%, transparent 100%)',
            'radial-gradient(ellipse 76% 78% at 24% 105%, rgba(7,43,28,.44) 0%, transparent 75%)',
            'linear-gradient(90deg, rgba(7,35,23,.52) 0%, rgba(9,37,25,.22) 43%, transparent 67%, #102b22 100%)',
            'linear-gradient(0deg, rgba(9,35,24,.26), transparent 38%)',
          ].join(', '),
        }}
      />

      {/* Almost imperceptible fabric-like grain connects this editorial stage
          with the softer, layered design of the rest of the homepage. */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.11]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(128deg,rgba(232,255,234,.14) 0px,rgba(232,255,234,.14) .6px,transparent .6px,transparent 8px)',
          maskImage: 'linear-gradient(90deg,#000 0%,rgba(0,0,0,.35) 57%,transparent 83%)',
          WebkitMaskImage: 'linear-gradient(90deg,#000 0%,rgba(0,0,0,.35) 57%,transparent 83%)',
        }}
      />

      <div className="relative z-10 grid min-w-0 lg:min-h-[800px] lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="flex min-h-[430px] min-w-0 flex-col justify-end px-5 pb-12 pt-14 sm:min-h-[530px] sm:px-9 sm:pb-16 lg:min-h-[800px] lg:px-[max(2.5rem,calc((100vw_-_1240px)/2))] lg:pb-20 lg:pr-10">
          <div className="max-w-[720px]">
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] sm:text-xs">
              <span aria-hidden="true" className="h-[2px] w-9 rounded-full bg-[#6ad094]" />
              <span className="rounded-full border border-[#a3e9b8]/25 bg-[#174d35]/55 px-3 py-1.5 text-[#baf0c7] backdrop-blur-sm">
                {active.category || 'Aktualita'}
              </span>
              <span className="text-white/75">{formatDate(active.published_at)}</span>
            </div>
            <h3 className="mt-5 max-w-[760px] text-[clamp(2.6rem,5vw,5.1rem)] font-black leading-[.94] tracking-[-0.058em] [text-shadow:0_3px_20px_rgba(0,0,0,.22)]">
              {active.title}
            </h3>
            {active.excerpt && (
              <p className="mt-5 line-clamp-2 max-w-[590px] text-sm leading-7 text-white/85 sm:text-[17px]">
                {active.excerpt}
              </p>
            )}
            <Link
              to={`/aktuality/${active.slug}`}
              className="mt-7 inline-flex items-center gap-3 rounded-[16px] border border-white/20 bg-white px-6 py-3.5 text-xs font-black uppercase tracking-[0.09em] text-brand-900 shadow-[0_10px_28px_rgba(4,30,17,.2)] transition-colors hover:bg-[#def2e3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Přečíst <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="flex min-w-0 flex-col bg-[#102b22]/95 lg:h-full lg:min-h-[800px] lg:border-l lg:border-white/[0.12]">
          <div className="flex items-center justify-between gap-4 border-y border-white/10 bg-white/[0.025] px-5 py-4 lg:border-t-0 lg:px-6 lg:py-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/55">
              Vyber aktualitu
            </span>
            <span className="text-[10px] font-semibold text-white/45">
              {items.length} {items.length === 1 ? 'zpráva' : items.length < 5 ? 'zprávy' : 'zpráv'}
            </span>
          </div>

          <div className="flex min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto">
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
                  className={`group relative flex w-[245px] shrink-0 items-center gap-3 border-r border-white/[0.08] px-4 py-4 text-left transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white sm:w-[295px] lg:min-h-[112px] lg:w-full lg:border-b lg:border-r-0 lg:px-5 ${selected ? 'bg-[linear-gradient(90deg,rgba(41,108,74,.62),rgba(255,255,255,.045))]' : 'hover:bg-white/[0.055]'}`}
                >
                  {selected && (
                    <span aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] w-full bg-[#7bd19a] shadow-[0_0_18px_rgba(95,219,138,.4)] lg:bottom-auto lg:h-full lg:w-[3px]" />
                  )}
                  <img
                    src={article.cover_image || FALLBACK_IMAGE}
                    alt=""
                    loading="lazy"
                    className={`h-[64px] w-[90px] shrink-0 rounded-[10px] object-cover ring-1 ring-white/[0.16] transition-transform duration-300 group-hover:scale-[1.02] sm:h-[74px] sm:w-[108px] ${selected ? 'ring-[#a5e2b6]/50' : ''}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 block text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#9bd9ad]">
                      {article.category || 'Aktualita'}
                    </span>
                    <span className={`line-clamp-2 text-xs font-extrabold leading-[1.35] sm:text-[13px] ${selected ? 'text-white' : 'text-white/85'}`}>
                      {article.title}
                    </span>
                    <span className="mt-1.5 block text-[10px] text-white/50">
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
    </section>
  )
}
