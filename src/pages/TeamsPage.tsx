import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ClubLogo } from '../components/ClubLogo'
import { DataFade } from '../components/DataFade'
import { EmptyState, ErrorState, LoadingState } from '../components/LoadingState'
import { PublicPageHero } from '../components/PublicPageHero'
import { fetchTeams } from '../lib/data'

export function TeamsPage() {
  const { data: teams = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })

  return (
    <main>
      <PublicPageHero
        eyebrow="Týmy NFC Lichnov"
        title="Jeden klub."
        accent="Každá generace má své místo."
        text="Vyber kategorii a podívej se na zápasy, hráče, tabulku a realizační tým."
        aside={
          !isLoading ? (
            <DataFade>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-700 shadow-sm backdrop-blur-xl">
                <ShieldCheck size={13} />
                {teams.length} aktivních kategorií
              </div>
            </DataFade>
          ) : undefined
        }
      />

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          {isLoading ? (
            <LoadingState rows={4} />
          ) : isError ? (
            <ErrorState
              title="Týmy se nepodařilo načíst"
              text="Zkus načtení zopakovat. Pokud problém přetrvá, může být dočasně nedostupné spojení se sportovními daty."
              onRetry={() => void refetch()}
            />
          ) : teams.length ? (
            <DataFade className="stagger-children grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team, index) => (
                <Link
                  key={team.id}
                  to={`/tymy/${team.slug}`}
                  className={`group relative overflow-hidden rounded-[32px] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-soft sm:p-7 ${
                    index === 0
                      ? 'border-brand-900 bg-brand-900 text-white'
                      : 'border-sand-200 bg-[#fbfaf6] text-ink-900 hover:bg-white'
                  }`}
                >
                  {index === 0 && (
                    <>
                      <img
                        src="/hero-lichnov-field.webp"
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover opacity-[0.12]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(24,53,42,.98)_0%,rgba(24,53,42,.88)_65%,rgba(20,83,45,.82)_100%)]" />
                    </>
                  )}

                  <div className="relative flex min-h-[230px] flex-col">
                    <div className="flex items-start justify-between gap-5">
                      <div className={index === 0 ? 'rounded-[24px] bg-white p-2 shadow-lg' : ''}>
                        <ClubLogo src={team.logo_url} name={team.name} size="lg" />
                      </div>
                      <ArrowUpRight
                        size={19}
                        className={`transition group-hover:-translate-y-1 group-hover:translate-x-1 ${
                          index === 0 ? 'text-white/55 group-hover:text-white' : 'text-ink-500 group-hover:text-brand-500'
                        }`}
                      />
                    </div>

                    <div className="mt-auto pt-10">
                      <div
                        className={`flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-[0.14em] ${
                          index === 0 ? 'text-white/50' : 'text-brand-500'
                        }`}
                      >
                        {team.category && <span>{team.category}</span>}
                        {team.category && team.season && <span>·</span>}
                        {team.season && <span>Sezóna {team.season}</span>}
                      </div>
                      <h2
                        className={`mt-2 text-3xl font-black tracking-[-0.05em] ${
                          index === 0 ? 'text-white' : 'text-brand-900'
                        }`}
                      >
                        {team.name}
                      </h2>
                      <p className={`mt-2 text-sm ${
                        index === 0 ? 'text-white/60' : 'text-ink-500'
                      }`}>
                        Zápasy · hráči · tabulka · realizační tým
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </DataFade>
          ) : (
            <DataFade>
              <EmptyState
              title="Žádné týmy"
              text="V databázi zatím nejsou dostupné aktivní týmy."
              />
            </DataFade>
          )}
        </div>
      </section>
    </main>
  )
}
