import { useQuery } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'
import { fetchTeams } from '../lib/data'
import { Footer } from './Footer'
import { Navigation } from './Navigation'
import { PageMotion } from './PageMotion'

export function Layout() {
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })

  return (
    <div className="flex min-h-screen flex-col bg-sand-50 text-ink-900">
      <Navigation teams={teams} loading={teamsLoading} />
      <div>
        <PageMotion>
          <Outlet />
        </PageMotion>
      </div>
      <Footer />
    </div>
  )
}
