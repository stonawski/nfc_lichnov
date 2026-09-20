import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ClubLogo } from '../components/ClubLogo'
import { EmptyState, LoadingState } from '../components/LoadingState'
import { fetchTeams } from '../lib/data'

export function TeamsPage() {
  const { data: teams = [], isLoading } = useQuery({ queryKey: ['teams'], queryFn: fetchTeams, retry: false })
  return (
    <main className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1240px]">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">Týmy</div>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.06em] text-brand-900 sm:text-6xl">Jeden klub. Každá generace má své místo.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink-500">Vyber kategorii a podívej se na zápasy, hráče, tabulku a realizační tým.</p>
        </div>
        <div className="mt-12">
          {isLoading ? <LoadingState rows={4} /> : teams.length ? (
            <div className="stagger-children grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <Link key={team.id} to={`/tymy/${team.slug}`} className="group rounded-5xl border border-sand-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-soft">
                  <div className="flex items-start justify-between">
                    <ClubLogo src={team.logo_url} name={team.name} size="lg" />
                    <ArrowUpRight size={19} className="text-ink-500 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-500" />
                  </div>
                  <div className="mt-10 text-3xl font-extrabold tracking-[-0.05em] text-brand-900">{team.name}</div>
                  <div className="mt-2 text-sm text-ink-500">Zápasy · hráči · statistiky</div>
                </Link>
              ))}
            </div>
          ) : <EmptyState title="Žádné týmy" text="V databázi zatím nejsou dostupné aktivní týmy." />}
        </div>
      </div>
    </main>
  )
}
