import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HeroFieldBackdrop } from '../components/HeroFieldBackdrop'
import { Seo } from '../components/Seo'
import { EmptyState, ErrorState, LoadingState } from '../components/LoadingState'
import { fetchNewsBySlug } from '../lib/data'
import { formatDate } from '../lib/format'

export function NewsDetailPage() {
  const { slug = '' } = useParams()
  const query = useQuery({
    queryKey: ['news', slug],
    queryFn: () => fetchNewsBySlug(slug),
    retry: false,
  })

  if (query.isLoading) {
    return (
      <Wrap>
        <LoadingState rows={4} />
      </Wrap>
    )
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
        <EmptyState
          title="Článek nebyl nalezen"
          text="Je možné, že už není publikovaný."
        />
      </Wrap>
    )
  }

  const article = query.data

  return (
    <main className="data-fade-in">
      <Seo
        title={article.title}
        description={article.excerpt || 'Aktualita z fotbalového klubu NFC Lichnov.'}
        image={article.cover_image}
        canonicalPath={`/aktuality/${article.slug}`}
        type="article"
      />
      <section className="site-hero-frame relative -mt-[84px] flex flex-col overflow-hidden px-5 pb-16 pt-[124px] sm:-mt-[88px] sm:pt-[136px] md:px-8 md:pb-20 md:pt-[144px]">
        <HeroFieldBackdrop tone="dark" />

        <div className="relative mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center py-6 text-white md:py-10">
          <Link
            to="/aktuality"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/65 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Zpět na aktuality
          </Link>

          <div className="mt-12 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
              <span>{article.category || 'Aktualita'}</span>
              <span className="h-1 w-1 rounded-full bg-white/35" />
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={12} />
                {formatDate(article.published_at)}
              </span>
            </div>

            <h1 className="mt-4 text-[clamp(3rem,7vw,6.3rem)] font-black leading-[.91] tracking-[-0.068em]">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-xl">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <article className="mx-auto max-w-[820px]">
          <div className="mb-10 flex items-center gap-3 border-b border-sand-200 pb-5">
            <div className="h-1.5 w-12 rounded-full bg-brand-500" />
            <div className="text-[10px] font-bold uppercase tracking-[0.17em] text-ink-500">
              NFC Lichnov
            </div>
          </div>

          <div className="prose-club whitespace-pre-wrap text-base leading-8 text-ink-900 sm:text-[17px] sm:leading-8">
            {article.content || 'Obsah článku zatím není doplněn.'}
          </div>

          <div className="mt-14 border-t border-sand-200 pt-7">
            <Link
              to="/aktuality"
              className="inline-flex items-center gap-2 rounded-[15px] bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-700"
            >
              <ArrowLeft size={15} />
              Všechny aktuality
            </Link>
          </div>
        </article>
      </section>
    </main>
  )
}

function Wrap({ children }: { children: ReactNode }) {
  return (
    <main className="bg-white px-5 py-20 md:px-8">
      <div className="mx-auto max-w-[900px]">{children}</div>
    </main>
  )
}
