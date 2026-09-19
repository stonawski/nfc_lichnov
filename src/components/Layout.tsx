import { useQuery } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'
import { fetchTeams } from '../lib/data'
import { Footer } from './Footer'
import { Navigation } from './Navigation'

export function Layout() {
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: fetchTeams, retry: false })
  return (
    <div className="min-h-screen bg-sand-50 text-ink-900">
      <Navigation teams={teams} />
      <Outlet />
      <Footer />
    </div>
  )
}
