import { useQuery } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'
import { fetchTeams } from '../lib/data'
import { Footer } from './Footer'
import { Navigation } from './Navigation'
import { PageMotion } from './PageMotion'
import { PublicRouteSeo } from './PublicRouteSeo'

export function Layout() {
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })

  return (
    <div className="flex min-h-screen flex-col bg-sand-50 text-ink-900">
      <PublicRouteSeo />
      <a
        href="#main-content"
        className="skip-link fixed left-4 top-4 z-[100] rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-bold text-white"
      >
        Přeskočit na obsah
      </a>
      <Navigation teams={teams} loading={teamsLoading} />
      <div id="main-content" tabIndex={-1}>
        <PageMotion>
          <Outlet />
        </PageMotion>
      </div>
      <Footer />
    </div>
  )
}
