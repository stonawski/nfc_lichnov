import { useQuery } from '@tanstack/react-query'
import { Outlet, useLocation } from 'react-router-dom'
import { fetchTeams } from '../lib/data'
import { Footer } from './Footer'
import {
  PersistentHeroFieldBackdrop,
  type HeroBackdropTone,
} from './HeroFieldBackdrop'
import { Navigation } from './Navigation'
import { PageMotion } from './PageMotion'
import { PublicRouteSeo } from './PublicRouteSeo'
import { PublicRouteWarmup } from './PublicRouteWarmup'

function heroBackdropForPath(pathname: string): {
  visible: boolean
  tone: HeroBackdropTone
} {
  const parts = pathname.split('/').filter(Boolean)
  const section = parts[0]

  const knownPublicPath =
    pathname === '/' ||
    pathname === '/kontakt' ||
    section === 'tymy' ||
    section === 'zapasy' ||
    section === 'aktuality' ||
    section === 'galerie' ||
    section === 'klub'

  const detailIsDark =
    (section === 'aktuality' && parts.length > 1) ||
    (section === 'galerie' && parts.length > 1)

  return {
    visible: knownPublicPath,
    tone: detailIsDark ? 'dark' : 'light',
  }
}

export function Layout() {
  const location = useLocation()
  const heroBackdrop = heroBackdropForPath(location.pathname)
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    retry: false,
  })

  return (
    <div className="flex min-h-screen flex-col bg-sand-50 text-ink-900">
      <PublicRouteSeo />
      <PublicRouteWarmup />
      <a
        href="#main-content"
        className="skip-link fixed left-4 top-4 z-[100] rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-bold text-white"
      >
        Přeskočit na obsah
      </a>
      <Navigation teams={teams} loading={teamsLoading} />
      <div id="main-content" className="relative isolate" tabIndex={-1}>
        <div className="persistent-hero-layer" aria-hidden="true">
          <PersistentHeroFieldBackdrop
            visible={heroBackdrop.visible}
            tone={heroBackdrop.tone}
          />
        </div>

        <PageMotion>
          <Outlet />
        </PageMotion>
      </div>
      <Footer />
    </div>
  )
}
