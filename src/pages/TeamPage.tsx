import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Images,
  UsersRound,
} from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ClubLogo } from '../components/ClubLogo'
import { DataFade } from '../components/DataFade'
import { EmptyState, ErrorState, LoadingState, PublicDataPageLoading } from '../components/LoadingState'
import { PlayerStripCarousel } from '../components/PlayerStripCarousel'
import { Seo } from '../components/Seo'
import { StandingsTable } from '../components/StandingsTable'
import {
  fetchDisplayPlayersByTeam,
  fetchGalleries,
  fetchMatchesByTeam,
  fetchStaffByTeam,
  fetchStandingsByTeam,
  fetchTeamBySlug,
} from '../lib/data'
import {
  formatMatchDay,
  formatMatchTime,
  initials,
  matchScore,
} from '../lib/format'
import { locationPath, withReturnPath } from '../lib/navigationState'
import type { Match } from '../lib/types'

export function TeamPage() {
  const { slug = '' } = useParams()
  const location = useLocation()
  const returnTo = locationPath(location.pathname, location.search)
  const [seasonStatMetric, setSeasonStatMetric] =
    useState<SeasonStatMetric>('goals')
  const [showAllSeasonStats, setShowAllSeasonStats] = useState(false)
  const [galleryPanelPhase, setGalleryPanelPhase] =
    useState<'front' | 'to-back' | 'back' | 'to-front'>('front')
  const galleryPhotoFront =
    galleryPanelPhase === 'back' || galleryPanelPhase === 'to-front'
  const galleryPhotoEmphasized =
    galleryPanelPhase === 'to-back' || galleryPanelPhase === 'back'
  const galleryAnimating =
    galleryPanelPhase === 'to-back' || galleryPanelPhase === 'to-front'

  const toggleGalleryLayers = () => {
    if (galleryPanelPhase === 'front') {
      setGalleryPanelPhase('to-back')
      return
    }

    if (galleryPanelPhase === 'back') {
      setGalleryPanelPhase('to-front')
    }
  }

  const finishGalleryPanelMotion = () => {
    if (galleryPanelPhase === 'to-back') {
      setGalleryPanelPhase('back')
    } else if (galleryPanelPhase === 'to-front') {
      setGalleryPanelPhase('front')
    }
  }

  const teamQuery = useQuery({
    queryKey: ['team', slug],
    queryFn: () => fetchTeamBySlug(slug),
    retry: false,
  })
  const team = teamQuery.data

  const matchesQuery = useQuery({
    queryKey: ['team-matches', team?.id],
    queryFn: () => fetchMatchesByTeam(team!.id),
    enabled: Boolean(team?.id),
    retry: false,
  })
  const standingsQuery = useQuery({
    queryKey: ['standings', team?.id],
    queryFn: () => fetchStandingsByTeam(team!.id),
    enabled: Boolean(team?.id),
    retry: false,
  })
  const playersQuery = useQuery({
    queryKey: ['players', team?.id],
    queryFn: () => fetchDisplayPlayersByTeam(team!),
    enabled: Boolean(team?.id),
    retry: false,
  })
  const staffQuery = useQuery({
    queryKey: ['staff', team?.id],
    queryFn: () => fetchStaffByTeam(team!.id),
    enabled: Boolean(team?.id),
    retry: false,
  })
  const galleriesQuery = useQuery({
    queryKey: ['galleries', 'team-hero', team?.id],
    queryFn: fetchGalleries,
    enabled: Boolean(team?.id),
    retry: false,
  })

  if (teamQuery.isLoading) {
    return <PublicDataPageLoading sections={4} />
  }

  if (teamQuery.isError) {
    return (
      <PageWrap>
        <ErrorState
          title="Tým se nepodařilo načíst"
          text="Zkus načtení zopakovat. Pokud problém přetrvá, může být dočasně nedostupné spojení se sportovními daty."
          onRetry={() => void teamQuery.refetch()}
        />
      </PageWrap>
    )
  }

  if (!team) {
    return (
      <PageWrap>
        <EmptyState
          title="Tým nebyl nalezen"
          text="Zkontroluj adresu nebo vyber tým z navigace."
        />
      </PageWrap>
    )
  }

  const matches = matchesQuery.data ?? []
  const now = Date.now()
  const latest = matches
    .filter((match) => new Date(match.playing_at).getTime() <= now)
    .sort((a, b) => +new Date(b.playing_at) - +new Date(a.playing_at))[0]
  const next = matches
    .filter((match) => new Date(match.playing_at).getTime() > now)
    .sort((a, b) => +new Date(a.playing_at) - +new Date(b.playing_at))[0]

  const standings = standingsQuery.data ?? []
  const lichnovStanding = standings.find((row) =>
    /lichnov/i.test(row.team_name || row.club_name || ''),
  )

  const players = playersQuery.data ?? []
  const topScorer = [...players]
    .filter((player) => (player.goals_count ?? 0) > 0)
    .sort((a, b) => {
      const goalDifference = (b.goals_count ?? 0) - (a.goals_count ?? 0)
      if (goalDifference !== 0) return goalDifference
      return (b.matches_count ?? 0) - (a.matches_count ?? 0)
    })[0]

  const seasonStats = [...players].sort((a, b) => {
    const difference =
      seasonStatValue(b, seasonStatMetric) -
      seasonStatValue(a, seasonStatMetric)

    if (difference !== 0) return difference

    const goalDifference = (b.goals_count ?? 0) - (a.goals_count ?? 0)
    if (goalDifference !== 0) return goalDifference

    const matchDifference = (b.matches_count ?? 0) - (a.matches_count ?? 0)
    if (matchDifference !== 0) return matchDifference

    return playerName(a).localeCompare(playerName(b), 'cs')
  })
  const selectedStat = SEASON_STAT_OPTIONS.find(
    (option) => option.id === seasonStatMetric,
  )!
  const statLeader = seasonStats[0]
  const statLeaderValue = statLeader
    ? formatSeasonStatValue(statLeader, seasonStatMetric)
    : '—'
  const visibleSeasonStats = showAllSeasonStats
    ? seasonStats
    : seasonStats.slice(0, 6)

  const teamGalleries = (galleriesQuery.data ?? []).filter(
    (gallery) => gallery.team_id === team.id,
  )
  const teamGallery = teamGalleries[0]
  const teamHeroImage =
    team.hero_image_url || teamGallery?.cover_image || '/hero-lichnov-field.webp'
  const hasTeamPhoto = Boolean(team.hero_image_url || teamGallery?.cover_image)
  const galleryHref = teamGallery
    ? `/galerie?album=${encodeURIComponent(teamGallery.slug || teamGallery.id)}`
    : null
  const competitionName =
    next?.competition_name ||
    latest?.competition_name ||
    matches.find((match) => match.competition_name)?.competition_name ||
    null
  const heroStatsReady =
    !matchesQuery.isLoading &&
    !standingsQuery.isLoading &&
    !playersQuery.isLoading
  const heroMatchesReady = !matchesQuery.isLoading
  const form = matches
    .filter((match) => {
      if (new Date(match.playing_at).getTime() > now) return false
      const [home, away] = resolvedMatchScore(match)
      return home != null && away != null
    })
    .sort((a, b) => +new Date(b.playing_at) - +new Date(a.playing_at))
    .slice(0, 5)
    .map((match) => teamMatchOutcome(match))
    .filter((result): result is 'V' | 'R' | 'P' => result != null)

  return (
    <main className="data-fade-in">
      <Seo
        title={team.name}
        description={`${team.name} NFC Lichnov — zápasy, hráči, tabulka a realizační tým.`}
        image={teamHeroImage || team.logo_url}
        canonicalPath={`/tymy/${team.slug}`}
      />
      <section className="site-hero-frame relative -mt-[84px] flex flex-col overflow-hidden bg-sand-50 pb-10 pt-[126px] sm:-mt-[88px] sm:pt-[136px] md:pb-14 md:pt-[144px]">
        <TeamHeroPhoto
          src={teamHeroImage}
          alt={hasTeamPhoto ? `${team.name} NFC Lichnov` : ''}
          hasTeamPhoto={hasTeamPhoto}
          galleryHref={galleryHref}
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_96%,rgba(0,146,63,.105),transparent_34%)]" />

        <div className="relative mx-auto flex min-h-[720px] w-full max-w-[1240px] flex-1 flex-col px-5 md:px-8">
          <div className="flex flex-1 flex-col justify-between py-8 sm:py-10 lg:py-12 xl:py-14">
            <div className="flex items-start justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[24px] bg-white shadow-xl ring-1 ring-white/30 sm:h-24 sm:w-24">
                  <ClubLogo src={team.logo_url} name={team.name} size="lg" />
                </div>

                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-900/50">
                    NFC Lichnov
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {team.category && (
                      <span className="rounded-full border border-brand-900/10 bg-white/68 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-900/75 backdrop-blur-sm">
                        {team.category}
                      </span>
                    )}
                    <span className="rounded-full border border-brand-900/10 bg-white/68 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-900/75 backdrop-blur-sm">
                      Sezóna {team.season || 'aktuální'}
                    </span>
                  </div>
                </div>
              </div>

              {galleryHref && (
                <Link
                  to={galleryHref}
                  className="group hidden shrink-0 items-center gap-2 rounded-full border border-brand-900/10 bg-brand-900 px-4 py-2.5 text-xs font-bold text-white shadow-[0_10px_26px_rgba(24,53,42,.14)] transition hover:bg-brand-700 sm:inline-flex"
                >
                  <Images size={14} />
                  Fotogalerie
                  <ArrowUpRight
                    size={13}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              )}
            </div>

            <div className="mt-20 max-w-[650px] lg:mt-28">
              {competitionName && (
                <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
                  {competitionName}
                </div>
              )}

              <h1 className="text-5xl font-black leading-[0.88] tracking-[-0.07em] text-brand-900 sm:text-6xl lg:text-[82px]">
                {team.name}
              </h1>

              <div
                className={`mt-8 min-h-[78px] flex flex-wrap items-start gap-x-8 gap-y-5 border-t border-brand-900/12 pt-6 transition-all duration-700 ease-out ${
                  heroStatsReady
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-2 opacity-0'
                }`}
              >
                <EditorialStat
                  label="Tabulka"
                  value={
                    lichnovStanding?.rank != null
                      ? `${lichnovStanding.rank}. místo`
                      : '—'
                  }
                  detail={
                    lichnovStanding?.points != null
                      ? `${lichnovStanding.points} bodů`
                      : undefined
                  }
                />
                <EditorialStat
                  label="Střelec sezony"
                  value={topScorer ? playerName(topScorer) : '—'}
                  detail={
                    topScorer
                      ? `${topScorer.goals_count ?? 0} gólů`
                      : undefined
                  }
                />
                <EditorialStat
                  label="Bilance"
                  value={
                    lichnovStanding
                      ? `${lichnovStanding.wins_count ?? 0}–${lichnovStanding.draws_count ?? 0}–${lichnovStanding.losses_count ?? 0}`
                      : '—'
                  }
                  detail="výhry – remízy – prohry"
                />
                <EditorialForm form={form} />
              </div>

              {galleryHref && (
                <Link
                  to={galleryHref}
                  className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-brand-900 sm:hidden"
                >
                  <Images size={14} />
                  Otevřít fotogalerii
                  <ArrowUpRight size={13} />
                </Link>
              )}
            </div>
          </div>

          <div className="min-h-[92px] border-t border-brand-900/10 bg-white/72 px-0 py-5 backdrop-blur-md">
            <div
              className={`grid gap-5 transition-all duration-700 ease-out lg:grid-cols-[minmax(0,1fr)_150px_minmax(0,1fr)] lg:items-start ${
                heroMatchesReady
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-2 opacity-0'
              }`}
            >
              <HeroMatch
                label="Poslední výsledek"
                match={latest}
                kind="result"
                returnTo={returnTo}
              />

              <Link
                to={`/zapasy?team=${team.slug}`}
                className="hidden h-10 items-center justify-center gap-2 self-start whitespace-nowrap pt-[18px] text-[10px] font-bold uppercase tracking-[0.15em] text-ink-500 transition hover:text-brand-900 lg:inline-flex"
              >
                Všechna utkání
                <ArrowRight size={13} />
              </Link>

              <HeroMatch
                label="Další zápas"
                match={next}
                kind="upcoming"
                returnTo={returnTo}
              />
            </div>
          </div>

          <nav
            aria-label="Sekce týmu"
            className="relative z-20 mt-4 flex gap-2 overflow-x-auto rounded-[24px] border border-white/75 bg-white/82 p-2 shadow-[0_14px_40px_rgba(24,53,42,.07)] backdrop-blur-xl [scrollbar-width:none] md:sticky md:top-24 [&::-webkit-scrollbar]:hidden"
          >
            {standings.length > 0 && <SectionLink href="#tabulka">Tabulka</SectionLink>}
            {players.length > 0 && <SectionLink href="#statistiky">Statistiky</SectionLink>}
            <SectionLink href="#fotogalerie">Galerie</SectionLink>
            <SectionLink href="#hraci">Hráči</SectionLink>
            <SectionLink href="#realizacni-tym">Realizační tým</SectionLink>
            <Link
              to={`/zapasy?team=${team.slug}`}
              className="shrink-0 rounded-2xl px-4 py-2.5 text-sm font-bold text-ink-500 transition hover:bg-brand-50 hover:text-brand-900"
            >
              Všechna utkání
            </Link>
          </nav>
        </div>
      </section>

      {standings.length > 0 && (
        <section
          id="tabulka"
          className="data-fade-in relative scroll-mt-28 overflow-hidden bg-sand-100 px-5 py-10 md:px-8 md:py-12"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              src="/hero-lichnov-field.webp"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover opacity-[0.24]"
              style={{ filter: 'saturate(.55) contrast(.92) brightness(1.04)' }}
            />
            <div className="absolute inset-0 bg-sand-100/[0.64]" />
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,.12)_0%,rgba(245,243,236,.02)_48%,rgba(255,255,255,.16)_100%)]" />
          </div>

          <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[38px] bg-brand-900 p-5 text-white shadow-soft sm:p-6 md:p-7">
            <div className="relative grid gap-6 lg:grid-cols-[.52fr_1.48fr] lg:items-start">
              <div className="lg:sticky lg:top-28">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">
                  Soutěž
                </div>
                {competitionName && (
                  <div className="mt-2 max-w-sm text-sm font-extrabold leading-5 text-white/70">
                    {competitionName}
                  </div>
                )}
                <h2 className="mt-3 text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                  Tabulka
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/[0.58]">
                  Aktuální pořadí týmu v soutěži. NFC Lichnov je zvýrazněný,
                  abys jeho pozici našel okamžitě.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {team.season && (
                    <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/65">
                      Sezóna {team.season}
                    </span>
                  )}
                  {lichnovStanding?.rank != null && (
                    <span className="rounded-full bg-brand-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                      {lichnovStanding.rank}. místo
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-[26px] bg-[#fbfaf6] p-1.5 text-ink-900 shadow-[0_18px_55px_rgba(0,0,0,.12)] sm:p-2">
                <StandingsTable rows={standings} dense />
              </div>
            </div>
          </div>
        </section>
      )}

      {players.length > 0 && (
        <section
          id="statistiky"
          className="relative scroll-mt-28 overflow-hidden bg-white px-5 py-14 md:px-8 md:py-20"
        >
          <div className="relative mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[.62fr_1.38fr] lg:items-start">
            <div className="relative z-20 lg:sticky lg:top-28">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">
                Sezóna {team.season || 'aktuální'}
              </div>
              <h2 className="mt-3 text-4xl font-black leading-[.96] tracking-[-0.055em] text-brand-900 sm:text-5xl">
                Statistiky sezony.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-ink-500">
                Přepni metriku a porovnej hráče podle výkonů v aktuální sezoně.
              </p>

              <div className="relative z-20 mt-6 flex max-w-md flex-wrap gap-2">
                {SEASON_STAT_OPTIONS.map((option) => {
                  const active = seasonStatMetric === option.id

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSeasonStatMetric(option.id)
                        setShowAllSeasonStats(false)
                      }}
                      className={`rounded-full px-3.5 py-2 text-[10px] font-bold transition ${
                        active
                          ? 'bg-brand-900 text-white'
                          : 'border border-brand-900/10 bg-white text-ink-500 shadow-[0_6px_20px_rgba(24,53,42,.035)] hover:border-brand-500/25 hover:text-brand-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>

              <div className="relative z-20 mt-7 grid max-w-sm grid-cols-2 gap-3">
                <div className="rounded-[22px] border border-sand-200 bg-white p-4 shadow-[0_10px_28px_rgba(24,53,42,.045)]">
                  <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-500">
                    Lídr
                  </div>
                  <div className="mt-2 truncate text-lg font-black tracking-[-0.04em] text-brand-900">
                    {statLeader ? playerName(statLeader) : '—'}
                  </div>
                </div>
                <div className="rounded-[22px] border border-sand-200 bg-white p-4 shadow-[0_10px_28px_rgba(24,53,42,.045)]">
                  <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-500">
                    {selectedStat.shortLabel}
                  </div>
                  <div className="mt-2 text-3xl font-black tracking-[-0.05em] text-brand-900">
                    {statLeaderValue}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative isolate">
              <div
                className="pointer-events-none absolute -left-[300px] bottom-[-290px] -z-10 h-[900px] w-[900px] rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(0,146,63,.31) 0%, rgba(0,146,63,.20) 20%, rgba(0,146,63,.115) 39%, rgba(0,146,63,.05) 58%, rgba(0,146,63,.018) 68%, transparent 78%)',
                  filter: 'blur(20px)',
                }}
              />
              <div
                className="pointer-events-none absolute -right-[150px] top-[-145px] -z-10 h-[500px] w-[500px] rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(0,146,63,.22) 0%, rgba(20,83,45,.13) 28%, rgba(0,146,63,.055) 50%, transparent 73%)',
                  filter: 'blur(18px)',
                }}
              />

              <div className="relative z-10 overflow-hidden rounded-[30px] border border-sand-200 bg-[#fbfaf6]/95 shadow-[0_24px_60px_rgba(24,53,42,.08)] backdrop-blur-[1px]">
                <div className="border-b border-sand-200 px-5 py-4">
                <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-500">
                  Řazení podle
                </div>
                <div className="mt-1 text-sm font-extrabold text-brand-900">
                  {selectedStat.title}
                </div>
              </div>

              <div className="overflow-x-auto [scrollbar-width:thin]">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[46px_minmax(220px,1fr)_58px_58px_58px_58px_68px] items-center gap-2 border-b border-sand-200 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.15em] text-ink-500">
                    <div>#</div>
                    <div>Hráč</div>
                    <StatHeader
                      label="Z"
                      active={seasonStatMetric === 'matches'}
                      title="Odehrané zápasy"
                    />
                    <StatHeader
                      label="G"
                      active={seasonStatMetric === 'goals'}
                      title="Góly"
                    />
                    <StatHeader
                      label="ŽK"
                      active={seasonStatMetric === 'yellow'}
                      title="Žluté karty"
                    />
                    <StatHeader
                      label="ČK"
                      active={seasonStatMetric === 'red'}
                      title="Červené karty"
                    />
                    <StatHeader
                      label="G / Z"
                      active={seasonStatMetric === 'rate'}
                      title="Góly na zápas"
                      align="right"
                    />
                  </div>

                  {visibleSeasonStats.map((player, index) => {
                    const matchesCount = player.matches_count ?? 0
                    const goalsCount = player.goals_count ?? 0
                    const yellowCards = player.yellow_cards ?? 0
                    const redCards = player.red_cards ?? 0
                    const rate =
                      matchesCount > 0 ? (goalsCount / matchesCount).toFixed(2) : '—'
                    const playerMeta = [
                      player.number != null ? `#${player.number}` : null,
                      player.position,
                    ]
                      .filter(Boolean)
                      .join(' · ')

                    return (
                      <div
                        key={player.id}
                        className={`grid grid-cols-[46px_minmax(220px,1fr)_58px_58px_58px_58px_68px] items-center gap-2 border-b border-sand-200/70 px-5 py-3.5 text-sm last:border-b-0 ${
                          index < 3 ? 'bg-brand-50/45' : 'bg-white'
                        }`}
                      >
                        <div
                          className={`font-black ${
                            index === 0
                              ? 'text-brand-500'
                              : index < 3
                                ? 'text-brand-900'
                                : 'text-ink-500'
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-sand-200 bg-sand-100">
                            {player.photo_url ? (
                              <img
                                src={player.photo_url}
                                alt=""
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.onerror = null
                                  event.currentTarget.src = '/player-placeholder.webp'
                                  event.currentTarget.className =
                                    'h-full w-full scale-[0.72] object-contain object-center'
                                }}
                                className="h-full w-full object-cover object-top"
                              />
                            ) : (
                              <img
                                src="/player-placeholder.webp"
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                className="h-full w-full scale-[0.72] object-contain object-center"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-extrabold text-brand-900">
                              {playerName(player)}
                            </div>
                            {playerMeta && (
                              <div className="mt-0.5 truncate text-[10px] font-semibold text-ink-500">
                                {playerMeta}
                              </div>
                            )}
                          </div>
                        </div>

                        <StatValue
                          value={matchesCount || '—'}
                          active={seasonStatMetric === 'matches'}
                        />
                        <StatValue
                          value={goalsCount}
                          active={seasonStatMetric === 'goals'}
                        />
                        <StatValue
                          value={yellowCards}
                          active={seasonStatMetric === 'yellow'}
                          tone="yellow"
                        />
                        <StatValue
                          value={redCards}
                          active={seasonStatMetric === 'red'}
                          tone="red"
                        />
                        <StatValue
                          value={rate}
                          active={seasonStatMetric === 'rate'}
                          align="right"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

                {seasonStats.length > 6 && (
                  <div className="flex justify-center border-t border-sand-200 bg-[#fbfaf6] px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setShowAllSeasonStats((current) => !current)}
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-brand-900/10 bg-white px-4 py-2.5 text-xs font-bold text-brand-900 transition hover:border-brand-500/25 hover:bg-brand-50"
                    >
                      {showAllSeasonStats
                        ? 'Zobrazit méně'
                        : `Zobrazit všechny (${seasonStats.length})`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        id="fotogalerie"
        className="relative scroll-mt-28 overflow-hidden bg-sand-100 px-5 py-16 md:px-8 md:py-24"
      >
        <div className="relative mx-auto max-w-[1180px]">
          <div className="mb-6 flex items-end justify-between gap-5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">
                Fotogalerie
              </div>
              <div className="mt-2 text-sm font-semibold text-brand-900/55">
                {teamGalleries.length > 0
                  ? `${teamGalleries.length} ${teamGalleries.length === 1 ? 'album' : teamGalleries.length < 5 ? 'alba' : 'alb'} týmu ${team.name}`
                  : `Momentky týmu ${team.name}`}
              </div>
            </div>

            <div className="hidden text-right sm:block">
              <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-500">
                Sezóna
              </div>
              <div className="mt-1 text-sm font-extrabold text-brand-900">
                {team.season || 'aktuální'}
              </div>
            </div>
          </div>

          <div
            className="relative min-h-[610px] lg:min-h-[650px]"
            style={{ perspective: '1800px', transformStyle: 'preserve-3d' }}
          >
            <button
              type="button"
              aria-pressed={galleryPhotoFront}
              aria-label={
                galleryPanelPhase === 'back' || galleryPanelPhase === 'to-front'
                  ? 'Vrátit informace galerie do popředí'
                  : 'Přesunout týmovou fotografii do popředí'
              }
              onClick={toggleGalleryLayers}
              disabled={galleryAnimating}
              className={`team-gallery-photo group absolute inset-y-0 right-0 w-full overflow-hidden rounded-[42px] bg-brand-900 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4 focus-visible:ring-offset-sand-100 lg:w-[84%] ${
                galleryPanelPhase === 'to-back'
                  ? 'team-gallery-photo-to-front shadow-[0_34px_90px_rgba(24,53,42,.24)]'
                  : galleryPanelPhase === 'back'
                    ? 'team-gallery-photo-front shadow-[0_34px_90px_rgba(24,53,42,.24)]'
                    : galleryPanelPhase === 'to-front'
                      ? 'team-gallery-photo-to-back shadow-[0_34px_90px_rgba(24,53,42,.24)]'
                      : 'shadow-[0_24px_70px_rgba(24,53,42,.12)]'
              }`}
            >
              <img
                src={teamHeroImage}
                alt={hasTeamPhoto ? `${team.name} NFC Lichnov` : ''}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center transition-[filter] duration-500 motion-reduce:transition-none"
                style={{
                  filter: galleryPhotoEmphasized
                    ? 'saturate(.98) contrast(.99) brightness(1)'
                    : 'saturate(.94) contrast(.97) brightness(.96)',
                }}
              />
              <div
                className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
                  galleryPhotoEmphasized ? 'opacity-35' : 'opacity-100'
                }`}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,53,42,.52)_0%,rgba(24,53,42,.16)_28%,rgba(24,53,42,0)_58%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,53,42,0)_48%,rgba(24,53,42,.18)_72%,rgba(24,53,42,.46)_100%)]" />
              </div>

              <div
                className={`absolute bottom-6 right-6 flex items-center gap-2 rounded-full border border-white/25 bg-brand-900/40 px-3.5 py-2 text-[10px] font-bold text-white backdrop-blur-md transition-all duration-500 motion-reduce:transition-none ${
                  galleryPanelPhase === 'back' || galleryPanelPhase === 'to-front'
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100'
                }`}
              >
                <Images size={13} />
                {galleryPanelPhase === 'back' || galleryPanelPhase === 'to-front'
                  ? 'Vrátit info dopředu'
                  : 'Fotku do popředí'}
              </div>
            </button>

            <div
              className="pointer-events-none relative flex min-h-[610px] items-end pb-7 pt-56 lg:min-h-[650px] lg:items-center lg:pb-0 lg:pt-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                onAnimationEnd={finishGalleryPanelMotion}
                className={`team-gallery-panel relative w-full rounded-[34px] border border-white/10 bg-brand-900 p-7 text-white shadow-[0_24px_70px_rgba(24,53,42,.22)] sm:p-9 lg:w-[430px] lg:p-10 ${
                  galleryPanelPhase === 'to-back'
                    ? 'team-gallery-panel-to-back pointer-events-none'
                    : galleryPanelPhase === 'back'
                      ? 'team-gallery-panel-back pointer-events-none shadow-[0_14px_38px_rgba(24,53,42,.10)]'
                      : galleryPanelPhase === 'to-front'
                        ? 'team-gallery-panel-to-front pointer-events-none'
                        : 'pointer-events-auto'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
                    <Images size={18} />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">
                    Klub očima fotografií
                  </div>
                </div>

                <h2 className="mt-7 text-4xl font-black leading-[.92] tracking-[-0.06em] sm:text-5xl">
                  {team.name}
                  <span className="block text-white/48">mimo tabulku.</span>
                </h2>

                <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
                  Zápasy, týmové fotografie a momenty kolem mužstva v jednom přehledném archivu.
                </p>

                {teamGallery?.title && (
                  <div className="mt-7 border-t border-white/12 pt-5">
                    <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
                      Poslední album
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm font-extrabold leading-5 text-white/82">
                      {teamGallery.title}
                    </div>
                  </div>
                )}

                <Link
                  to={`/galerie?team=${encodeURIComponent(team.slug)}#gallery-albums`}
                  className="group mt-8 inline-flex min-h-12 items-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-brand-900 transition hover:bg-brand-50"
                >
                  Otevřít fotogalerii
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="hraci" className="relative scroll-mt-28 bg-white py-16 md:py-24">
        <div className="relative px-5 md:px-8">
          <div className="mx-auto max-w-[1240px]">
            <SectionHeading
              eyebrow="Kabina"
              title="Hráči"
              note={
                playersQuery.data?.length
                  ? `${playersQuery.data.length} hráčů v soupisce`
                  : undefined
              }
            />
          </div>
        </div>

        {playersQuery.isLoading ? (
          <div className="px-5 md:px-8">
            <div className="mx-auto max-w-[1240px]">
              <LoadingState rows={4} />
            </div>
          </div>
        ) : playersQuery.data?.length ? (
          <DataFade>
            <PlayerStripCarousel team={team} players={playersQuery.data} />
          </DataFade>
        ) : (
          <DataFade className="px-5 md:px-8">
            <div className="mx-auto max-w-[1240px]">
              <EmptyState
                title="Soupiska zatím není k dispozici"
                text="Hráči se zobrazí po synchronizaci nebo ručním doplnění."
              />
            </div>
          </DataFade>
        )}
      </section>

      <section
        id="realizacni-tym"
        className="relative scroll-mt-28 bg-sand-100 px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24"
      >
        <div className="relative mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="Realizační tým"
            title="Trenéři a vedení týmu"
            note={
              staffQuery.data?.length
                ? `${staffQuery.data.length} členů`
                : undefined
            }
          />

          {staffQuery.isLoading ? (
            <LoadingState rows={3} />
          ) : staffQuery.data?.length ? (
            <DataFade className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {staffQuery.data.map((person) => (
                <article
                  key={person.id}
                  className="group overflow-hidden rounded-[30px] border border-white/80 bg-white/[0.82] shadow-[0_12px_34px_rgba(24,53,42,.055)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-soft"
                >
                  <div className="grid grid-cols-[116px_1fr] sm:block">
                    <div className="relative min-h-[156px] overflow-hidden bg-sand-100 sm:aspect-[4/3] sm:min-h-0">
                      {person.photo_url ? (
                        <img
                          src={person.photo_url}
                          alt={person.name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(0,146,63,.2),transparent_40%)]">
                          <UsersRound size={34} className="text-brand-700/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-500">
                        {person.role || 'Realizační tým'}
                      </div>
                      <div className="mt-2 text-xl font-extrabold tracking-[-0.035em] text-brand-900">
                        {person.name}
                      </div>
                      {person.bio && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-500">
                          {person.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </DataFade>
          ) : (
            <DataFade>
              <EmptyState
              title="Realizační tým zatím není doplněn"
              text="Trenéři a vedení se zobrazí po doplnění v administraci."
              />
            </DataFade>
          )}
        </div>
      </section>
    </main>
  )
}

function PageWrap({ children }: { children: ReactNode }) {
  return (
    <main className="px-5 py-20 md:px-8">
      <div className="mx-auto max-w-[1000px]">{children}</div>
    </main>
  )
}

function SectionHeading({
  eyebrow,
  title,
  note,
  aside,
}: {
  eyebrow: string
  title: string
  note?: string
  aside?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
          {eyebrow}
        </div>
        <h2 className="mt-2 text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
          {title}
        </h2>
      </div>

      {(note || aside) && (
        <div className="flex items-center gap-4">
          {note && (
            <div className="text-xs font-semibold text-ink-500">
              {note}
            </div>
          )}
          {aside}
        </div>
      )}
    </div>
  )
}

function SectionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      data-no-transition="true"
      className="shrink-0 rounded-2xl px-4 py-2.5 text-sm font-bold text-ink-500 transition hover:bg-brand-50 hover:text-brand-900"
    >
      {children}
    </a>
  )
}

function playerName(player: { first_name: string | null; last_name: string | null }) {
  return [player.first_name, player.last_name].filter(Boolean).join(' ') || 'Hráč NFC'
}

function resolvedMatchScore(match: Match): [number | null, number | null] {
  const manual =
    match.manual_override &&
    match.manual_score_home != null &&
    match.manual_score_away != null

  return manual
    ? [match.manual_score_home, match.manual_score_away]
    : [match.score_home, match.score_away]
}

function teamMatchOutcome(match: Match): 'V' | 'R' | 'P' | null {
  const [home, away] = resolvedMatchScore(match)
  if (home == null || away == null) return null

  const isHome = /lichnov/i.test(match.home_team_name)
  const isAway = /lichnov/i.test(match.away_team_name)
  if (!isHome && !isAway) return null

  const scored = isHome ? home : away
  const conceded = isHome ? away : home

  if (scored > conceded) return 'V'
  if (scored < conceded) return 'P'
  return 'R'
}

type SeasonStatMetric = 'goals' | 'yellow' | 'red' | 'matches' | 'rate'

const SEASON_STAT_OPTIONS: Array<{
  id: SeasonStatMetric
  label: string
  title: string
  shortLabel: string
}> = [
  { id: 'goals', label: 'Góly', title: 'Nejvíce gólů', shortLabel: 'Góly' },
  {
    id: 'yellow',
    label: 'Žluté karty',
    title: 'Nejvíce žlutých karet',
    shortLabel: 'ŽK',
  },
  {
    id: 'red',
    label: 'Červené karty',
    title: 'Nejvíce červených karet',
    shortLabel: 'ČK',
  },
  {
    id: 'matches',
    label: 'Zápasy',
    title: 'Nejvíce odehraných zápasů',
    shortLabel: 'Zápasy',
  },
  {
    id: 'rate',
    label: 'Góly / zápas',
    title: 'Nejlepší gólový průměr',
    shortLabel: 'G / Z',
  },
]

function seasonStatValue(
  player: {
    matches_count: number | null
    goals_count: number | null
    yellow_cards: number | null
    red_cards: number | null
  },
  metric: SeasonStatMetric,
) {
  const matches = player.matches_count ?? 0
  const goals = player.goals_count ?? 0

  if (metric === 'goals') return goals
  if (metric === 'yellow') return player.yellow_cards ?? 0
  if (metric === 'red') return player.red_cards ?? 0
  if (metric === 'matches') return matches
  return matches > 0 ? goals / matches : 0
}

function formatSeasonStatValue(
  player: {
    matches_count: number | null
    goals_count: number | null
    yellow_cards: number | null
    red_cards: number | null
  },
  metric: SeasonStatMetric,
) {
  const value = seasonStatValue(player, metric)
  return metric === 'rate' ? value.toFixed(2) : String(value)
}

function StatHeader({
  label,
  active,
  title,
  align = 'center',
}: {
  label: string
  active: boolean
  title: string
  align?: 'center' | 'right'
}) {
  return (
    <div
      title={title}
      className={`${align === 'right' ? 'text-right' : 'text-center'} ${
        active ? 'font-black text-brand-500' : ''
      }`}
    >
      {label}
    </div>
  )
}

function StatValue({
  value,
  active,
  tone,
  align = 'center',
}: {
  value: string | number
  active: boolean
  tone?: 'yellow' | 'red'
  align?: 'center' | 'right'
}) {
  const toneClass =
    tone === 'yellow'
      ? 'bg-amber-50 text-amber-700'
      : tone === 'red'
        ? 'bg-red-50 text-red-700'
        : ''

  return (
    <div className={align === 'right' ? 'text-right' : 'text-center'}>
      <span
        className={`inline-flex min-w-7 items-center justify-center rounded-lg px-2 py-1 tabular-nums ${
          toneClass || (active ? 'bg-brand-50 text-brand-900' : 'text-ink-500')
        } ${active ? 'font-black ring-1 ring-brand-500/20' : 'font-semibold'}`}
      >
        {value}
      </span>
    </div>
  )
}

function TeamHeroPhoto({
  src,
  alt,
  hasTeamPhoto,
  galleryHref,
}: {
  src: string
  alt: string
  hasTeamPhoto: boolean
  galleryHref: string | null
}) {
  const [loaded, setLoaded] = useState(!hasTeamPhoto)

  useEffect(() => {
    setLoaded(!hasTeamPhoto)
  }, [hasTeamPhoto, src])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-0 top-0 h-[min(74svh,620px)] w-full sm:h-[min(78svh,660px)] lg:h-[min(72svh,650px)] lg:w-[82%] xl:w-[80%]">
        <div className="absolute inset-0 overflow-hidden">
          {!hasTeamPhoto && (
            <img
              src="/hero-lichnov-field.webp"
              alt=""
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[66%_center]"
              style={{ filter: 'saturate(.82) contrast(.92) brightness(1.08)' }}
            />
          )}

          {hasTeamPhoto && (
            <img
              key={src}
              src={src}
              alt={alt}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onLoad={() => setLoaded(true)}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-[opacity,transform] duration-1000 ease-out ${
                loaded ? 'scale-100 opacity-100' : 'scale-[1.012] opacity-0'
              }`}
              style={{ filter: 'saturate(.94) contrast(.96) brightness(1.04)' }}
            />
          )}

          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(250,248,243,.98) 0%, rgba(250,248,243,.86) 12%, rgba(250,248,243,.58) 26%, rgba(250,248,243,.28) 42%, rgba(250,248,243,.08) 58%, rgba(250,248,243,0) 72%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(250,248,243,0) 0%, rgba(250,248,243,.02) 58%, rgba(250,248,243,.30) 78%, rgba(250,248,243,.95) 100%)',
            }}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 -left-[280px] hidden w-[620px] lg:block"
          style={{
            background:
              'linear-gradient(90deg, #faf8f3 0%, #faf8f3 30%, rgba(250,248,243,.94) 43%, rgba(250,248,243,.72) 57%, rgba(250,248,243,.38) 72%, rgba(250,248,243,.12) 86%, transparent 100%)',
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 -bottom-10 h-32 bg-gradient-to-b from-transparent via-sand-50/60 to-sand-50 blur-[2px]" />

        {hasTeamPhoto && galleryHref && loaded && (
          <Link
            to={galleryHref}
            aria-label="Otevřít týmovou fotogalerii"
            className="group pointer-events-auto absolute inset-y-0 right-0 z-[2] w-[62%] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
          >
            <span className="absolute bottom-8 right-8 inline-flex translate-y-1 items-center gap-2 rounded-full border border-white/45 bg-white/80 px-3.5 py-2 text-[10px] font-bold text-brand-900 opacity-0 shadow-[0_10px_30px_rgba(24,53,42,.10)] backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              <Images size={13} />
              Otevřít galerii
              <ArrowUpRight size={12} />
            </span>
          </Link>
        )}
      </div>

      <div className="hero-glow absolute inset-0 opacity-20" />
    </div>
  )
}

function EditorialStat({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="min-w-[116px]">
      <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-ink-500">
        {label}
      </div>
      <div className="mt-1.5 text-lg font-black tracking-[-0.035em] text-brand-900">
        {value}
      </div>
      {detail && (
        <div className="mt-1 text-[10px] font-semibold text-ink-500">{detail}</div>
      )}
    </div>
  )
}

function EditorialForm({ form }: { form: Array<'V' | 'R' | 'P'> }) {
  return (
    <div>
      <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-ink-500">
        Forma
      </div>
      <div className="mt-2 flex gap-1.5">
        {form.length ? (
          form.map((result, index) => (
            <span
              key={`${result}-${index}`}
              title={result === 'V' ? 'Výhra' : result === 'R' ? 'Remíza' : 'Prohra'}
              className={`grid h-7 w-7 place-items-center rounded-full border text-[10px] font-black ${
                result === 'V'
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : result === 'R'
                    ? 'border-brand-900/12 bg-white/70 text-brand-900'
                    : 'border-brand-900/10 bg-sand-100/70 text-ink-500'
              }`}
            >
              {result}
            </span>
          ))
        ) : (
          <span className="text-lg font-black text-brand-900">—</span>
        )}
      </div>
    </div>
  )
}

function HeroMatch({
  label,
  match,
  kind,
  returnTo,
}: {
  label: string
  match?: Match
  kind: 'result' | 'upcoming'
  returnTo: string
}) {
  if (!match) {
    return (
      <div>
        <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-ink-500">
          {label}
        </div>
        <div className="mt-2 text-sm font-semibold text-ink-500">Není k dispozici</div>
      </div>
    )
  }

  const score = matchScore(
    match.score_home,
    match.score_away,
    match.manual_override,
    match.manual_score_home,
    match.manual_score_away,
    match.playing_at,
  )

  return (
    <Link
      to={withReturnPath(`/zapasy/${match.id}`, returnTo)}
      className="group grid min-h-[58px] w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-4"
    >
      <div className="grid min-w-0 grid-rows-[12px_38px]">
        <div className="text-[8px] font-bold uppercase leading-3 tracking-[0.15em] text-ink-500">
          {label}
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <HeroClub name={match.home_team_name} logo={match.home_team_logo} />
          <div className="shrink-0 text-center">
            {kind === 'result' ? (
              <div className="text-2xl font-black tracking-[-0.055em] text-brand-900">
                {score ?? '—'}
              </div>
            ) : (
              <>
                <div className="text-base font-black tracking-[-0.035em] text-brand-900">
                  {formatMatchDay(match.playing_at)}
                </div>
                <div className="mt-0.5 text-[10px] font-bold text-ink-500">
                  {formatMatchTime(match.playing_at)}
                </div>
              </>
            )}
          </div>
          <HeroClub name={match.away_team_name} logo={match.away_team_logo} />
        </div>
      </div>

      <ChevronRight
        size={15}
        className="mt-[22px] shrink-0 text-ink-500/70 transition group-hover:translate-x-0.5 group-hover:text-brand-900"
      />
    </Link>
  )
}

function HeroClub({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/95">
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-contain p-1" />
        ) : (
          <span className="text-[8px] font-black text-brand-900">{initials(name)}</span>
        )}
      </div>
      <div className="line-clamp-2 max-w-[120px] text-[10px] font-bold leading-[1.15] text-brand-900/78">
        {name}
      </div>
    </div>
  )
}
