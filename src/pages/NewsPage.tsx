import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState, LoadingState } from '../components/LoadingState'
import { PublicPageHero } from '../components/PublicPageHero'
import { fetchPublishedNews } from '../lib/data'
import { formatDate } from '../lib/format'

export function NewsPage() {
  const query = useQuery({
    queryKey: ['news'],
    queryFn: () => fetchPublishedNews(),
    retry: false,
  })

  const articles = query.data ?? []
  const featured = articles[0]
  const rest = articles.slice(1)

  return (
    <main>
      <PublicPageHero
        eyebrow="Klubový deník"
        title="Co se děje"
        accent="v NFC Lichnov."
        text="Zápasy, turnaje, mládež, dění v klubu a všechno podstatné na jednom místě."
      />

      <section className="bg-sand-100 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          {query.isLoading ? (
            <LoadingState rows={5} />
          ) : query.isError ? (
            <EmptyState
              title="Aktuality se nepodařilo načíst"
              text="Zkontroluj přístup k publikovaným článkům v Supabase."
            />
          ) : featured ? (
            <>
              <Link
                to={`/aktuality/${featured.slug}`}
                className="group relative block min-h-[430px] overflow-hidden rounded-[38px] bg-brand-900 text-white shadow-soft sm:min-h-[500px]"
              >
                {featured.cover_image ? (
                  <img
                    src={featured.cover_image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                  />
                ) : (
                  <img
                    src="/hero-lichnov-field.webp"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover opacity-50"
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,53,42,.10)_0%,rgba(24,53,42,.34)_42%,rgba(24,53,42,.96)_100%)]" />

                <div className="relative flex min-h-[430px] flex-col justify-between p-6 sm:min-h-[500px] sm:p-9 lg:p-10">
                  <div className="flex items-start justify-between gap-5">
                    <span className="rounded-full border border-white/15 bg-brand-900/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
                      {featured.category || 'Aktualita'}
                    </span>
                    <ArrowUpRight
                      size={21}
                      className="text-white/60 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"
                    />
                  </div>

                  <div className="max-w-4xl">
                    <div className="text-xs font-semibold text-white/55">
                      {formatDate(featured.published_at)}
                    </div>
                    <h2 className="mt-3 text-4xl font-black leading-[.96] tracking-[-0.055em] sm:text-5xl md:text-6xl">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                        {featured.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </Link>

              {rest.length > 0 && (
                <div className="stagger-children mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <Link
                      key={article.id}
                      to={`/aktuality/${article.slug}`}
                      className="group overflow-hidden rounded-[30px] border border-sand-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-sand-100">
                        {article.cover_image ? (
                          <img
                            src={article.cover_image}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
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
                        <h2 className="mt-3 text-2xl font-extrabold leading-[1.05] tracking-[-0.04em] text-brand-900">
                          {article.title}
                        </h2>
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
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="overflow-hidden rounded-[38px] bg-brand-900 text-white shadow-soft">
              <div className="grid lg:grid-cols-[1.08fr_.92fr]">
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
                      Jakmile zveřejníme první článek, objeví se tady. Do té doby
                      můžeš sledovat aktuální program, výsledky a jednotlivé týmy.
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
                    <ArrowRight size={18} className="shrink-0 text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
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
                    <ArrowRight size={18} className="shrink-0 text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
