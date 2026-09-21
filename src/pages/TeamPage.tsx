import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  MapPin,
  Trophy,
  UsersRound,
} from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ClubLogo } from '../components/ClubLogo'
import { EmptyState, LoadingState } from '../components/LoadingState'
import { PlayerStripCarousel } from '../components/PlayerStripCarousel'
import { StandingsTable } from '../components/StandingsTable'
import {
  fetchDisplayPlayersByTeam,
  fetchMatchesByTeam,
  fetchStaffByTeam,
  fetchStandingsByTeam,
  fetchTeamBySlug,
} from '../lib/data'
import {
  formatMatchDate,
  formatMatchDay,
  formatMatchTime,
  initials,
  isUpcomingMatch,
  matchScore,
} from '../lib/format'
import { locationPath, withReturnPath } from '../lib/navigationState'
import type { Match } from '../lib/types'

export function TeamPage() {
  const { slug = '' } = useParams()
  const location = useLocation()
  const returnTo = locationPath(location.pathname, location.search)

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

  if (teamQuery.isLoading) {
    return (
      <PageWrap>
        <LoadingState rows={4} />
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

  const upcoming = matches
    .filter((match) => isUpcomingMatch(match.playing_at))
    .sort((a, b) => +new Date(a.playing_at) - +new Date(b.playing_at))
  const results = matches
    .filter((match) => !isUpcomingMatch(match.playing_at))
    .sort((a, b) => +new Date(b.playing_at) - +new Date(a.playing_at))

  const standings = standingsQuery.data ?? []
  const lichnovStanding = standings.find((row) =>
    /lichnov/i.test(row.team_name || row.club_name || ''),
  )

  return (
    <main>
      <section className="px-5 pb-8 pt-14 md:px-8 md:pb-10 md:pt-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="relative overflow-hidden rounded-[42px] bg-brand-900 px-6 py-7 text-white shadow-soft sm:px-9 sm:py-10 lg:px-12 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(0,146,63,.5),transparent_28%),radial-gradient(circle_at_92%_78%,rgba(255,255,255,.09),transparent_30%)]" />
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -right-8 -top-10 h-52 w-52 rounded-full border border-white/[0.06]" />

            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(460px,.92fr)] lg:items-end">
              <div>
                <div className="flex items-center gap-4">
                  <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[28px] bg-white shadow-xl ring-1 ring-white/30 sm:h-28 sm:w-28">
                    <ClubLogo src={team.logo_url} name={team.name} size="lg" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                      NFC Lichnov
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {team.category && (
                        <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
                          {team.category}
                        </span>
                      )}
                      <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
                        Sezóna {team.season || 'aktuální'}
                      </span>
                    </div>
                  </div>
                </div>

                <h1 className="mt-8 max-w-3xl text-5xl font-black leading-[0.9] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                  {team.name}
                </h1>

                <div className="mt-8 flex flex-wrap gap-3">
                  <HeroStat
                    label="Hráči"
                    value={playersQuery.isLoading ? '—' : String(playersQuery.data?.length ?? 0)}
                  />
                  <HeroStat
                    label="Tabulka"
                    value={lichnovStanding?.rank != null ? `${lichnovStanding.rank}. místo` : '—'}
                  />
                  <HeroStat
                    label="Zápasy"
                    value={matchesQuery.isLoading ? '—' : String(matches.length)}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <HeroMatch
                  label="Poslední výsledek"
                  match={latest}
                  kind="result"
                  returnTo={returnTo}
                />
                <HeroMatch
                  label="Další zápas"
                  match={next}
                  kind="upcoming"
                  returnTo={returnTo}
                />
              </div>
            </div>
          </div>

          <nav
            aria-label="Sekce týmu"
            className="mt-4 flex gap-2 overflow-x-auto rounded-[24px] border border-sand-200 bg-[#fbfaf6] p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <SectionLink href="#zapasy">Zápasy</SectionLink>
            {standings.length > 0 && <SectionLink href="#tabulka">Tabulka</SectionLink>}
            <SectionLink href="#hraci">Hráči</SectionLink>
            <SectionLink href="#realizacni-tym">Realizační tým</SectionLink>
          </nav>
        </div>
      </section>

      <section id="zapasy" className="scroll-mt-28 px-5 py-12 md:px-8 md:py-18">
        <div className="mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="Program"
            title="Zápasy"
            aside={
              <Link
                to={`/zapasy?team=${team.slug}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition hover:text-brand-500"
              >
                Všechny zápasy
                <ArrowRight size={15} />
              </Link>
            }
          />

          {matchesQuery.isLoading ? (
            <LoadingState rows={4} />
          ) : matches.length ? (
            <div className="grid gap-5 lg:grid-cols-[1.08fr_.92fr]">
              <div>
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
                  Nejbližší program
                </div>

                {upcoming.length ? (
                  <div className="space-y-3">
                    {upcoming.slice(0, 4).map((match, index) => (
                      <TeamMatchCard
                        key={match.id}
                        match={match}
                        returnTo={returnTo}
                        featured={index === 0}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-7">
                    <div className="text-base font-extrabold text-brand-900">
                      Další zápas zatím není naplánovaný.
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-500">
                      Jakmile bude nový termín dostupný, objeví se tady.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
                  Poslední výsledky
                </div>

                {results.length ? (
                  <div className="space-y-3">
                    {results.slice(0, 4).map((match) => (
                      <TeamMatchCard
                        key={match.id}
                        match={match}
                        returnTo={returnTo}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-7">
                    <div className="text-base font-extrabold text-brand-900">
                      Výsledky zatím nejsou k dispozici.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Žádné zápasy"
              text="Pro tuto kategorii zatím nejsou k dispozici zápasy."
            />
          )}
        </div>
      </section>

      {standings.length > 0 && (
        <section
          id="tabulka"
          className="scroll-mt-28 bg-sand-100 px-5 py-16 md:px-8 md:py-24"
        >
          <div className="mx-auto max-w-[1100px]">
            <SectionHeading
              eyebrow="Soutěž"
              title="Tabulka"
              note={team.season ? `Sezóna ${team.season}` : undefined}
            />
            <StandingsTable rows={standings} />
          </div>
        </section>
      )}

      <section id="hraci" className="scroll-mt-28 py-14 md:py-20">
        <div className="px-5 md:px-8">
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
          <PlayerStripCarousel team={team} players={playersQuery.data} />
        ) : (
          <div className="px-5 md:px-8">
            <div className="mx-auto max-w-[1240px]">
              <EmptyState
                title="Soupiska zatím není k dispozici"
                text="Hráči se zobrazí po synchronizaci nebo ručním doplnění."
              />
            </div>
          </div>
        )}
      </section>

      <section
        id="realizacni-tym"
        className="scroll-mt-28 px-5 pb-16 pt-8 md:px-8 md:pb-24 md:pt-12"
      >
        <div className="mx-auto max-w-[1240px]">
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
            <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {staffQuery.data.map((person) => (
                <article
                  key={person.id}
                  className="group overflow-hidden rounded-[30px] border border-sand-200 bg-[#fbfaf6] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-soft"
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
            </div>
          ) : (
            <EmptyState
              title="Realizační tým zatím není doplněn"
              text="Trenéři a vedení se zobrazí po doplnění v administraci."
            />
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
      className="shrink-0 rounded-2xl px-4 py-2.5 text-sm font-bold text-ink-500 transition hover:bg-white hover:text-brand-900"
    >
      {children}
    </a>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[106px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-white">{value}</div>
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
      <div className="min-h-[190px] rounded-[28px] border border-white/10 bg-white/[0.07] p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
          {label}
        </div>
        <div className="mt-8 text-sm font-semibold text-white/45">
          Není k dispozici
        </div>
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
      className="group relative min-h-[190px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.07] p-5 transition hover:bg-white/[0.11]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
          {label}
        </div>
        <ChevronRight
          size={15}
          className="text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white/70"
        />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <HeroClub name={match.home_team_name} logo={match.home_team_logo} />
        <div className="px-1 text-center">
          {kind === 'result' ? (
            <div className="text-3xl font-black tracking-[-0.065em]">
              {score ?? '—'}
            </div>
          ) : (
            <>
              <div className="text-lg font-black tracking-[-0.04em]">
                {formatMatchDay(match.playing_at)}
              </div>
              <div className="mt-1 text-[11px] font-bold text-white/55">
                {formatMatchTime(match.playing_at)}
              </div>
            </>
          )}
        </div>
        <HeroClub name={match.away_team_name} logo={match.away_team_logo} />
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-3 text-[10px] font-medium text-white/45">
        <CalendarDays size={12} />
        {formatMatchDate(match.playing_at)}
      </div>
    </Link>
  )
}

function HeroClub({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="min-w-0 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white/95">
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-contain p-1.5" />
        ) : (
          <span className="text-[10px] font-black text-brand-900">{initials(name)}</span>
        )}
      </div>
      <div className="mt-2 line-clamp-2 text-[10px] font-bold leading-[1.15] text-white/80">
        {name}
      </div>
    </div>
  )
}

function TeamMatchCard({
  match,
  returnTo,
  featured = false,
}: {
  match: Match
  returnTo: string
  featured?: boolean
}) {
  const upcoming = isUpcomingMatch(match.playing_at)
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
      className={`group block overflow-hidden rounded-[28px] border transition duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
        featured
          ? 'border-brand-900 bg-brand-900 text-white'
          : 'border-sand-200 bg-[#fbfaf6] text-ink-900 hover:bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-4 px-5 pt-4">
        <div
          className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
            featured ? 'text-white/45' : 'text-ink-500'
          }`}
        >
          {upcoming ? 'Nadcházející utkání' : formatMatchDate(match.playing_at)}
        </div>
        <ChevronRight
          size={16}
          className={`transition group-hover:translate-x-0.5 ${
            featured ? 'text-white/40' : 'text-ink-500'
          }`}
        />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-5">
        <MatchClub
          name={match.home_team_name}
          logo={match.home_team_logo}
          featured={featured}
        />

        <div className="min-w-[76px] text-center">
          {upcoming ? (
            <div
              className={`rounded-2xl px-3 py-2 ${
                featured
                  ? 'bg-white/[0.09] ring-1 ring-white/10'
                  : 'bg-brand-50 ring-1 ring-brand-500/10'
              }`}
            >
              <div
                className={`text-lg font-black tracking-[-0.045em] ${
                  featured ? 'text-white' : 'text-brand-900'
                }`}
              >
                {formatMatchDay(match.playing_at)}
              </div>
              <div
                className={`mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold ${
                  featured ? 'text-white/55' : 'text-brand-500'
                }`}
              >
                <CalendarClock size={11} />
                {formatMatchTime(match.playing_at)}
              </div>
            </div>
          ) : (
            <div
              className={`text-3xl font-black tracking-[-0.06em] ${
                featured ? 'text-white' : 'text-brand-900'
              }`}
            >
              {score ?? '—'}
            </div>
          )}
        </div>

        <MatchClub
          name={match.away_team_name}
          logo={match.away_team_logo}
          featured={featured}
        />
      </div>

      {(match.competition_name || match.round || match.pitch_name) && (
        <div
          className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t px-5 py-3 text-[10px] ${
            featured
              ? 'border-white/10 text-white/45'
              : 'border-sand-200 text-ink-500'
          }`}
        >
          {match.competition_name && (
            <span className="inline-flex items-center gap-1.5">
              <Trophy size={11} />
              {match.competition_name}
            </span>
          )}
          {match.round && <span>{match.round}</span>}
          {match.pitch_name && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={11} />
              {match.pitch_name}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

function MatchClub({
  name,
  logo,
  featured,
}: {
  name: string
  logo: string | null
  featured: boolean
}) {
  return (
    <div className="min-w-0 text-center">
      <div
        className={`mx-auto grid h-11 w-11 place-items-center overflow-hidden rounded-xl ${
          featured ? 'bg-white/95' : 'bg-white ring-1 ring-sand-200'
        }`}
      >
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-contain p-1.5" />
        ) : (
          <span className="text-[10px] font-black text-brand-900">{initials(name)}</span>
        )}
      </div>
      <div
        className={`mt-2 line-clamp-2 text-xs font-bold leading-[1.15] ${
          featured ? 'text-white/85' : 'text-ink-900'
        }`}
      >
        {name}
      </div>
    </div>
  )
}
