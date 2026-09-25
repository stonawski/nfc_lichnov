import { useQuery } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Goal,
  Search,
  Trophy,
  Users,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import {
  fetchPublicClubStats,
  getBundledClubStats,
  PLAYER_STATS_SOURCE_UPDATED_AT,
  type ClubPlayerStat,
} from '../lib/clubStatsData'
import { DataFade } from '../components/DataFade'
import { HeroFieldBackdrop } from '../components/HeroFieldBackdrop'

type RankingMode = 'matches' | 'goals'

export function ClubStatsPage() {
  const [rankingMode, setRankingMode] = useState<RankingMode>('matches')
  const [query, setQuery] = useState('')
  const [showAllPlayers, setShowAllPlayers] = useState(false)
  const [showAllSeasons, setShowAllSeasons] = useState(false)
  const [activeOnly, setActiveOnly] = useState(false)

  const statsQuery = useQuery({
    queryKey: ['club-stats'],
    queryFn: fetchPublicClubStats,
    placeholderData: getBundledClubStats,
    staleTime: 60_000,
  })

  const stats = statsQuery.data ?? getBundledClubStats()
  const players = stats.players
  const seasons = stats.seasons

  const appearanceRanking = useMemo(
    () =>
      [...players].sort(
        (a, b) => b.matches - a.matches || b.goals - a.goals || a.sourceOrder - b.sourceOrder,
      ),
    [players],
  )

  const scoringRanking = useMemo(
    () =>
      [...players].sort(
        (a, b) => b.goals - a.goals || b.matches - a.matches || a.sourceOrder - b.sourceOrder,
      ),
    [players],
  )

  const activeRanking = rankingMode === 'matches' ? appearanceRanking : scoringRanking
  const rankedPlayers = useMemo(
    () => activeRanking.map((player, index) => ({ player, rank: index + 1 })),
    [activeRanking],
  )

  const filteredRanking = useMemo(() => {
    const normalizedQuery = normalizeSearch(query)

    return rankedPlayers.filter(({ player }) => {
      if (activeOnly && !player.active) return false
      if (!normalizedQuery) return true
      return normalizeSearch(player.name).includes(normalizedQuery)
    })
  }, [activeOnly, rankedPlayers, query])

  const visiblePlayers =
    showAllPlayers || query.trim() ? filteredRanking : filteredRanking.slice(0, 30)

  const visibleSeasons = showAllSeasons
    ? [...seasons].reverse()
    : [...seasons].reverse().slice(0, 12)

  const milestones = seasons.filter(
    (season) => season.outcome && season.nextCompetition,
  )
  const promotionCount = milestones.filter((season) => season.outcome === 'promotion').length
  const relegationCount = milestones.filter((season) => season.outcome === 'relegation').length

  const appearanceLeader = appearanceRanking[0]
  const scoringLeader = scoringRanking[0]
  const firstSeason = seasons[0]?.season ?? '1964/65'
  const lastSeason = seasons[seasons.length - 1]?.season ?? '2022/23'
  const latestPlayerUpdate = latestUpdate(players.map((player) => player.updatedAt))

  return (
    <main>
      <StatsHero
        appearanceLeader={appearanceLeader}
        scoringLeader={scoringLeader}
        seasonCount={seasons.length}
        firstSeason={firstSeason}
        lastSeason={lastSeason}
      />

      <section className="data-fade-in bg-sand-100 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <SectionIntro
            eyebrow="Historické pořadí"
            title="Kompletní klubová statistika."
            text={`Obě pořadí vznikají z jedné společné databáze ${players.length} hráčských záznamů. Při další aktualizaci stačí změnit zápasy nebo góly hráče na jednom místě a oba žebříčky se přepočítají.`}
          />

          <div className="mt-9 overflow-hidden rounded-[32px] border border-sand-200 bg-white">
            <div className="border-b border-sand-200 p-4 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex w-fit rounded-[16px] bg-sand-100 p-1">
                  <RankingTab
                    active={rankingMode === 'matches'}
                    onClick={() => {
                      setRankingMode('matches')
                      setShowAllPlayers(false)
                    }}
                  >
                    Odehrané zápasy
                  </RankingTab>
                  <RankingTab
                    active={rankingMode === 'goals'}
                    onClick={() => {
                      setRankingMode('goals')
                      setShowAllPlayers(false)
                    }}
                  >
                    Střelci
                  </RankingTab>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveOnly((value) => !value)
                      setShowAllPlayers(false)
                    }}
                    className={`rounded-[14px] px-4 py-2.5 text-sm font-bold transition ${
                      activeOnly
                        ? 'bg-brand-900 text-white'
                        : 'bg-white text-ink-500 ring-1 ring-sand-200 hover:text-brand-900'
                    }`}
                  >
                    Pouze aktivní
                  </button>
                </div>

                <label className="relative block w-full lg:max-w-[340px]">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Hledat hráče…"
                    aria-label="Hledat hráče v historických statistikách"
                    className="h-11 w-full rounded-[15px] border border-sand-200 bg-[#fbfaf6] pl-11 pr-4 text-sm font-semibold text-brand-900 outline-none transition placeholder:text-ink-500/60 focus:border-brand-500"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xl font-extrabold tracking-[-0.035em] text-brand-900">
                    {rankingMode === 'matches'
                      ? 'Odehrané zápasy'
                      : 'Historická tabulka střelců'}
                  </div>
                  <div className="mt-1 text-xs text-ink-500">
                    {filteredRanking.length}{' '}
                    {filteredRanking.length === 1 ? 'záznam' : 'záznamů'}
                  </div>
                </div>
                <div className="text-right text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">
                  {latestPlayerUpdate
                    ? `Naposledy upraveno ${formatPublicDate(latestPlayerUpdate)}`
                    : 'Zdroj aktualizován 28. 2. 2025'}
                </div>
              </div>
            </div>

            <PlayerTable
              key={`${rankingMode}-${activeOnly ? 'active' : 'all'}-${showAllPlayers ? 'expanded' : 'compact'}`}
              rows={visiblePlayers}
              mode={rankingMode}
            />

            {!query.trim() && filteredRanking.length > 30 && (
              <div className="border-t border-sand-200 p-4 text-center sm:p-5">
                <button
                  type="button"
                  onClick={() => setShowAllPlayers((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-[15px] bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  {showAllPlayers
                    ? 'Zobrazit prvních 30'
                    : `Zobrazit všech ${filteredRanking.length} hráčů`}
                  <ChevronDown
                    size={15}
                    className={`transition ${showAllPlayers ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="data-fade-in bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
            <SectionIntro
              eyebrow="Minuty pravdy"
              title="Postupy, sestupy a zlomové sezony."
              text="U každé historické sezony lze v administraci označit postup nebo sestup a následující soutěž. Tato časová osa se z těchto údajů skládá automaticky."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              {milestones.map((season) => {
                const promotion = season.outcome === 'promotion'

                return (
                  <article
                    key={season.ordinal}
                    className="rounded-[26px] border border-sand-200 bg-[#fbfaf6] p-5"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${
                            promotion
                              ? 'bg-brand-50 text-brand-700'
                              : 'bg-sand-200 text-brand-900'
                          }`}
                        >
                          {promotion ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          {promotion ? 'Postup' : 'Sestup'}
                        </div>
                        <div className="mt-4 text-2xl font-black tracking-[-0.045em] text-brand-900">
                          {season.season}
                        </div>
                      </div>
                      {promotion ? (
                        <Trophy size={19} className="text-brand-500" />
                      ) : (
                        <ArrowDown size={20} className="text-brand-900" />
                      )}
                    </div>

                    <div className="mt-5 text-sm font-bold text-brand-900">
                      {season.competition}
                      <span className="mx-2 text-ink-500">→</span>
                      {season.nextCompetition}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-sand-200 pt-4">
                      <MiniStat value={`${season.position}.`} label="místo" />
                      <MiniStat value={season.score} label="skóre" />
                      <MiniStat value={String(season.points)} label="body" />
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="data-fade-in bg-sand-100 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-7 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
                {firstSeason} — {lastSeason}
              </div>
              <h2 className="mt-3 text-4xl font-black leading-[.98] tracking-[-0.055em] text-brand-900 md:text-5xl">
                Celá soutěžní historie v jedné tabulce.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-ink-500 sm:text-base">
                Zápasy, bilance, skóre, body, soutěž a konečné umístění podle
                historického přehledu „Minuty pravdy“. Nedokončené ročníky zůstávají
                označené přímo v tabulce.
              </p>
              <a
                href="https://nfclichnov.wbs.cz/Minuty-pravdy.html"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-[14px] border border-sand-200 bg-white px-4 py-2.5 text-sm font-bold text-brand-900 transition hover:-translate-y-0.5 hover:border-brand-500/20 hover:shadow-soft"
              >
                Otevřít původní přehled <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="rounded-[28px] bg-brand-900 p-5 text-white shadow-soft">
              <div className="grid grid-cols-3 gap-4">
                <DarkStat value={String(seasons.length)} label="sezon" />
                <DarkStat value={String(promotionCount)} label="postupů" />
                <DarkStat value={String(relegationCount)} label="sestupů" />
              </div>
              <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-6 text-white/45">
                Postupy a sestupy jsou vedené přímo u jednotlivých sezon a lze je
                upravovat v administraci společně s cílovou soutěží.
              </p>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-[30px] border border-white/10 bg-[#143126]">
            <div
              key={showAllSeasons ? 'all-seasons' : 'recent-seasons'}
              className="component-swap-enter overflow-x-auto"
            >
              <table className="w-full min-w-[900px] border-collapse text-left">
                <caption className="sr-only">Historie sezon NFC Lichnov</caption>
                <thead>
                  <tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-[0.14em] text-white/40">
                    <th className="px-5 py-4">Sezona</th>
                    <th className="px-4 py-4">Soutěž</th>
                    <th className="px-4 py-4 text-center">Umístění</th>
                    <th className="px-4 py-4 text-center">Zápasy</th>
                    <th className="px-4 py-4">Bilance</th>
                    <th className="px-4 py-4">Skóre</th>
                    <th className="px-5 py-4 text-right">Body</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSeasons.map((season) => (
                    <tr
                      key={season.ordinal}
                      className="border-b border-white/[0.075] last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-white">{season.season}</div>
                        {season.incomplete && (
                          <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">
                            nedokončeno
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-white/75">
                        {season.competition}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-black text-white">
                        {season.position}.
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-white/60">
                        {season.matches}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/60">{season.record}</td>
                      <td className="px-4 py-4 text-sm text-white/60">{season.score}</td>
                      <td className="px-5 py-4 text-right text-sm font-black text-white">
                        {season.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-white/10 p-4 text-center">
              <button
                type="button"
                onClick={() => setShowAllSeasons((value) => !value)}
                className="inline-flex items-center gap-2 rounded-[14px] bg-white px-5 py-3 text-sm font-bold text-brand-900 transition hover:-translate-y-0.5"
              >
                {showAllSeasons
                  ? 'Zobrazit posledních 12 sezon'
                  : `Zobrazit všech ${seasons.length} sezon`}
                <ChevronDown
                  size={15}
                  className={`transition ${showAllSeasons ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function StatsHero({
  appearanceLeader,
  scoringLeader,
  seasonCount,
  firstSeason,
  lastSeason,
}: {
  appearanceLeader: ClubPlayerStat
  scoringLeader: ClubPlayerStat
  seasonCount: number
  firstSeason: string
  lastSeason: string
}) {
  return (
    <section className="site-hero-frame relative -mt-[84px] flex flex-col overflow-hidden px-5 pb-16 pt-[124px] sm:-mt-[88px] sm:pt-[136px] md:px-8 md:pb-20 md:pt-[144px]">
        <HeroFieldBackdrop />

      <div className="relative mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center py-8 md:py-12">
        <div className="max-w-[820px]">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
            Klubové statistiky
          </div>
          <h1 className="mt-4 text-[clamp(3.1rem,7vw,6.6rem)] font-black leading-[.88] tracking-[-0.072em] text-brand-900">
            Historie v číslech.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-ink-500 sm:text-lg sm:leading-8">
            Kompletní historické statistiky hráčů a soutěžní cesta NFC Lichnov
            napříč desítkami sezon.
          </p>
        </div>

        <DataFade className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3">
          <RecordCard
            icon={<Users size={20} />}
            eyebrow="Nejvíce zápasů"
            value={String(appearanceLeader.matches)}
            label={appearanceLeader.name}
            detail={`${appearanceLeader.goals} vstřelených branek`}
          />
          <RecordCard
            icon={<Goal size={20} />}
            eyebrow="Nejlepší střelec"
            value={String(scoringLeader.goals)}
            label={scoringLeader.name}
            detail={`${scoringLeader.matches} odehraných zápasů`}
          />
          <RecordCard
            icon={<CalendarDays size={20} />}
            eyebrow="Minuty pravdy"
            value={String(seasonCount)}
            label="historických sezon"
            detail={`od ${firstSeason} do ${lastSeason}`}
          />
        </DataFade>

        <div className="mt-5 grid gap-3 rounded-[24px] border border-white/70 bg-white/80 px-5 py-4 text-sm leading-6 text-ink-500 shadow-sm backdrop-blur-xl md:grid-cols-[1fr_auto] md:items-center">
          <p>
            Historické statistiky hráčů vycházejí z klubových podkladů a dat IS FAČR.
            Původní tabulky byly aktualizovány {formatSourceDate(PLAYER_STATS_SOURCE_UPDATED_AT)}.
          </p>
          <a
            href="https://nfclichnov.wbs.cz/Od-zapasy-hracu.html"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1.5 font-bold text-brand-700 transition hover:text-brand-500"
          >
            Původní zdroj <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}

function PlayerTable({
  rows,
  mode,
}: {
  rows: Array<{ player: ClubPlayerStat; rank: number }>
  mode: RankingMode
}) {
  return (
    <div className="component-swap-enter">
      <div className="grid grid-cols-[46px_minmax(0,1fr)_78px_72px] gap-2 border-b border-sand-200 bg-[#fbfaf6] px-4 py-3 text-[8px] font-black uppercase tracking-[0.12em] text-ink-500 sm:grid-cols-[60px_minmax(0,1fr)_110px_100px] sm:px-6 sm:text-[9px]">
        <div>Poř.</div>
        <div>Hráč</div>
        <div className="text-right">{mode === 'matches' ? 'Zápasy' : 'Góly'}</div>
        <div className="text-right">{mode === 'matches' ? 'Góly' : 'Zápasy'}</div>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-ink-500">
          Pro tento dotaz jsme žádného hráče nenašli.
        </div>
      ) : (
        rows.map(({ player, rank }) => (
          <div
            key={String(player.id)}
            className={`grid grid-cols-[46px_minmax(0,1fr)_78px_72px] items-center gap-2 border-b border-sand-200 px-4 py-3.5 last:border-b-0 sm:grid-cols-[60px_minmax(0,1fr)_110px_100px] sm:px-6 ${
              rank <= 3 ? 'bg-[#fbfaf6]' : ''
            }`}
          >
            <div
              className={`text-sm font-black ${
                rank <= 3 ? 'text-brand-500' : 'text-ink-500'
              }`}
            >
              {String(rank).padStart(2, '0')}
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <div className="truncate text-sm font-bold text-brand-900 sm:text-base">
                  {player.name}
                </div>
                {player.active && (
                  <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-brand-700">
                    Aktivní
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-black text-brand-900 sm:text-lg">
                {mode === 'matches' ? player.matches : player.goals}
              </div>
            </div>
            <div className="text-right text-sm font-bold text-ink-500">
              {mode === 'matches' ? player.goals : player.matches}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function RankingTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[12px] px-4 py-2.5 text-sm font-bold transition ${
        active ? 'bg-white text-brand-900 shadow-sm' : 'text-ink-500 hover:text-brand-900'
      }`}
    >
      {children}
    </button>
  )
}

function RecordCard({
  icon,
  eyebrow,
  value,
  label,
  detail,
}: {
  icon: ReactNode
  eyebrow: string
  value: string
  label: string
  detail: string
}) {
  return (
    <article className="rounded-[32px] border border-white/70 bg-white/[0.88] p-6 shadow-[0_18px_60px_rgba(18,48,36,.08)] backdrop-blur-xl sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.17em] text-ink-500">
          {eyebrow}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          {icon}
        </div>
      </div>
      <div className="mt-9 text-5xl font-black tracking-[-0.065em] text-brand-900">{value}</div>
      <div className="mt-2 text-xl font-extrabold tracking-[-0.035em] text-brand-900">{label}</div>
      <div className="mt-1 text-sm text-ink-500">{detail}</div>
    </article>
  )
}

function SectionIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string
  title: string
  text: string
}) {
  return (
    <div className="max-w-3xl">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-4xl font-black leading-[.98] tracking-[-0.055em] text-brand-900 md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-500 sm:text-base">{text}</p>
    </div>
  )
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-sm font-extrabold text-brand-900">{value}</div>
      <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-ink-500">
        {label}
      </div>
    </div>
  )
}

function DarkStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-black tracking-[-0.055em] text-white">{value}</div>
      <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
        {label}
      </div>
    </div>
  )
}

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase('cs')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function latestUpdate(values: Array<string | null>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null
}

function formatPublicDate(value: string) {
  return new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'medium' }).format(new Date(value))
}

function formatSourceDate(value: string) {
  const [year, month, day] = value.split('-')
  return `${Number(day)}. ${Number(month)}. ${year}`
}
