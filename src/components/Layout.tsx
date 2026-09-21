import { useQuery } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'
import { fetchTeams } from '../lib/data'
import { Footer } from './Footer'
import { Navigation } from './Navigation'
import { PageMotion } from './PageMotion'

export function Layout() {
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })

  return (
    <div className="flex min-h-screen flex-col bg-sand-50 text-ink-900">
      <Navigation teams={teams} />
      <div className="flex-1">
        <PageMotion>
          <Outlet />
        </PageMotion>
      </div>
      <Footer />
    </div>
  )
}
