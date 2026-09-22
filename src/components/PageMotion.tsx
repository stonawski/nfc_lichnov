import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchPublicClubStats } from '../lib/clubStatsData'
import {
  fetchCurrentMatches,
  fetchDisplayPlayersByTeam,
  fetchGalleries,
  fetchGalleryBySlug,
  fetchGalleryImages,
  fetchHomepageMatchSummaries,
  fetchNewsBySlug,
  fetchMatchById,
  fetchMatchParticipants,
  fetchMatchTimeline,
  fetchMatchesByTeam,
  fetchPublishedNews,
  fetchStaffByTeam,
  fetchStandingsByTeam,
  fetchTeamBySlug,
  fetchTeams,
  fetchUpcomingMatches,
} from '../lib/data'
import type { Match, Team } from '../lib/types'

const ROUTE_EXIT_MS = 150

export function PageMotion({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const rootRef = useRef<HTMLDivElement>(null)
  const navigateRef = useRef(navigate)
  const transitionTimerRef = useRef<number | null>(null)
  const transitionActiveRef = useRef(false)

  navigateRef.current = navigate

  useEffect(() => {
    const clearTransitionTimer = () => {
      if (transitionTimerRef.current == null) return
      window.clearTimeout(transitionTimerRef.current)
      transitionTimerRef.current = null
    }

    const internalUrlFromTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null

      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (
        !anchor ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        anchor.dataset.noTransition === 'true'
      ) {
        return null
      }

      const url = new URL(anchor.href, window.location.href)
      return url.origin === window.location.origin ? url : null
    }

    const prefetchTeam = (team: Team) => {
      queryClient.setQueryData(['team', team.slug], team)

      void queryClient.prefetchQuery({
        queryKey: ['team-matches', team.id],
        queryFn: () => fetchMatchesByTeam(team.id),
      })
      void queryClient.prefetchQuery({
        queryKey: ['standings', team.id],
        queryFn: () => fetchStandingsByTeam(team.id),
      })
      void queryClient.prefetchQuery({
        queryKey: ['players', team.id],
        queryFn: () => fetchDisplayPlayersByTeam(team),
      })
      void queryClient.prefetchQuery({
        queryKey: ['staff', team.id],
        queryFn: () => fetchStaffByTeam(team.id),
      })
    }

    const prefetchMatchDetails = (match: Match) => {
      void queryClient.prefetchQuery({
        queryKey: ['match-participants', match.id],
        queryFn: () => fetchMatchParticipants(match),
      })
      void queryClient.prefetchQuery({
        queryKey: ['match-timeline', match.id],
        queryFn: () => fetchMatchTimeline(match),
      })
    }

    const prefetchPath = async (pathname: string) => {
      const parts = pathname.split('/').filter(Boolean)

      if (pathname === '/') {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ['teams'],
            queryFn: fetchTeams,
          }),
          queryClient.prefetchQuery({
            queryKey: ['home-match-summaries'],
            queryFn: fetchHomepageMatchSummaries,
          }),
          queryClient.prefetchQuery({
            queryKey: ['news', 'home'],
            queryFn: () => fetchPublishedNews(4),
          }),
          queryClient.prefetchQuery({
            queryKey: ['matches', 'upcoming'],
            queryFn: fetchUpcomingMatches,
          }),
          queryClient.prefetchQuery({
            queryKey: ['galleries', 'home'],
            queryFn: fetchGalleries,
          }),
        ])
        return
      }

      if (pathname === '/tymy') {
        await queryClient.prefetchQuery({
          queryKey: ['teams'],
          queryFn: fetchTeams,
        })
        return
      }

      if (parts[0] === 'tymy' && parts[1]) {
        const cachedTeams = queryClient.getQueryData<Team[]>(['teams'])
        const cachedTeam = cachedTeams?.find((team) => team.slug === parts[1])

        if (cachedTeam) {
          prefetchTeam(cachedTeam)
          return
        }

        const team = await queryClient.fetchQuery({
          queryKey: ['team', parts[1]],
          queryFn: () => fetchTeamBySlug(parts[1]),
        })

        if (team) prefetchTeam(team)
        return
      }

      if (pathname === '/zapasy') {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ['teams'],
            queryFn: fetchTeams,
          }),
          queryClient.prefetchQuery({
            queryKey: ['matches', 'current'],
            queryFn: fetchCurrentMatches,
          }),
        ])
        return
      }

      if (parts[0] === 'zapasy' && parts[1]) {
        const match = await queryClient.fetchQuery({
          queryKey: ['match', parts[1]],
          queryFn: () => fetchMatchById(parts[1]),
        })

        void queryClient.prefetchQuery({
          queryKey: ['teams'],
          queryFn: fetchTeams,
        })
        if (match) prefetchMatchDetails(match)
        return
      }

      if (pathname === '/aktuality') {
        await queryClient.prefetchQuery({
          queryKey: ['news'],
          queryFn: () => fetchPublishedNews(),
        })
        return
      }

      if (parts[0] === 'aktuality' && parts[1]) {
        await queryClient.prefetchQuery({
          queryKey: ['news', parts[1]],
          queryFn: () => fetchNewsBySlug(parts[1]),
        })
        return
      }

      if (pathname === '/galerie') {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ['galleries'],
            queryFn: fetchGalleries,
          }),
          queryClient.prefetchQuery({
            queryKey: ['gallery-images'],
            queryFn: () => fetchGalleryImages(),
          }),
        ])
        return
      }

      if (parts[0] === 'galerie' && parts[1]) {
        const gallery = await queryClient.fetchQuery({
          queryKey: ['gallery', parts[1]],
          queryFn: () => fetchGalleryBySlug(parts[1]),
        })

        if (gallery) {
          void queryClient.prefetchQuery({
            queryKey: ['gallery-images', gallery.id],
            queryFn: () => fetchGalleryImages(gallery.id),
          })
        }
        return
      }

      if (pathname === '/klub/statistiky') {
        await queryClient.prefetchQuery({
          queryKey: ['club-stats'],
          queryFn: fetchPublicClubStats,
        })
      }
    }

    const handleIntent = (event: Event) => {
      const url = internalUrlFromTarget(event.target)
      if (!url || url.pathname === window.location.pathname) return

      void prefetchPath(url.pathname).catch(() => {
        // Prefetch is opportunistic. The destination page owns its error state.
      })
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const url = internalUrlFromTarget(event.target)
      if (!url) return

      const current = new URL(window.location.href)
      if (url.pathname === current.pathname) return

      event.preventDefault()

      if (transitionActiveRef.current) return

      const root = rootRef.current
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const targetPath = `${url.pathname}${url.search}${url.hash}`

      if (!root || reducedMotion) {
        navigateRef.current(targetPath)
        return
      }

      transitionActiveRef.current = true
      root.classList.add('is-route-leaving')

      clearTransitionTimer()
      transitionTimerRef.current = window.setTimeout(() => {
        transitionTimerRef.current = null
        navigateRef.current(targetPath)
      }, ROUTE_EXIT_MS)
    }

    document.addEventListener('pointerover', handleIntent, { passive: true })
    document.addEventListener('focusin', handleIntent)
    document.addEventListener('touchstart', handleIntent, { passive: true })
    document.addEventListener('click', handleDocumentClick, true)

    return () => {
      document.removeEventListener('pointerover', handleIntent)
      document.removeEventListener('focusin', handleIntent)
      document.removeEventListener('touchstart', handleIntent)
      document.removeEventListener('click', handleDocumentClick, true)
      clearTransitionTimer()
    }
  }, [queryClient])

  useLayoutEffect(() => {
    const root = rootRef.current
    root?.classList.remove('is-route-leaving')
    transitionActiveRef.current = false

    const html = document.documentElement
    const previousScrollBehavior = html.style.scrollBehavior

    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    html.style.scrollBehavior = previousScrollBehavior
  }, [location.pathname])

  return (
    <div ref={rootRef} className="page-motion-shell">
      <div key={location.pathname} className="route-content-enter">
        {children}
      </div>
    </div>
  )
}
