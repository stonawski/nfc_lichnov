import { CalendarDays, Goal, Trophy, Users } from 'lucide-react'

type Leader = {
  rank: number
  name: string
  goals: number
  matches: number
}

const appearanceLeaders: Leader[] = [
  { rank: 1, name: 'Michna Jiří', goals: 18, matches: 609 },
  { rank: 2, name: 'Babinec Radim', goals: 33, matches: 563 },
  { rank: 3, name: 'Kašpárek Antonín', goals: 162, matches: 540 },
  { rank: 4, name: 'Kahánek Mojmír', goals: 18, matches: 533 },
  { rank: 5, name: 'Gold Josef', goals: 24, matches: 479 },
  { rank: 6, name: 'Drozd Pavel', goals: 11, matches: 472 },
  { rank: 7, name: 'Drozd Miroslav', goals: 22, matches: 453 },
  { rank: 8, name: 'Pustějovský Lubomír', goals: 7, matches: 423 },
  { rank: 9, name: 'Mrkvan Rastislav', goals: 24, matches: 417 },
  { rank: 10, name: 'Kupčák Milan', goals: 3, matches: 364 },
  { rank: 11, name: 'Kandráč Milan', goals: 3, matches: 347 },
  { rank: 12, name: 'Příhoda Petr (st.)', goals: 53, matches: 335 },
  { rank: 13, name: 'Laga Jiří', goals: 0, matches: 335 },
  { rank: 14, name: 'Tichavský Petr', goals: 105, matches: 334 },
  { rank: 15, name: 'Beneš Jiří', goals: 126, matches: 331 },
  { rank: 16, name: 'Mynář Miroslav', goals: 6, matches: 324 },
  { rank: 17, name: 'Mamula Petr', goals: 0, matches: 305 },
  { rank: 18, name: 'Bartoš Gunter', goals: 3, matches: 292 },
  { rank: 19, name: 'Šudák Radim', goals: 124, matches: 285 },
  { rank: 20, name: 'Klimeš Ondřej', goals: 68, matches: 284 },
]

const scoringLeaders: Leader[] = [
  { rank: 1, name: 'Kašpárek Antonín', goals: 162, matches: 540 },
  { rank: 2, name: 'Beneš Jiří', goals: 126, matches: 331 },
  { rank: 3, name: 'Šudák Radim', goals: 124, matches: 285 },
  { rank: 4, name: 'Palo František', goals: 112, matches: 153 },
  { rank: 5, name: 'Tichavský Petr', goals: 105, matches: 334 },
  { rank: 6, name: 'Masnica Pavel', goals: 95, matches: 192 },
  { rank: 7, name: 'Klimeš Ondřej', goals: 68, matches: 284 },
  { rank: 8, name: 'Bumbalík Karel', goals: 66, matches: 247 },
  { rank: 9, name: 'Suda Pavel', goals: 59, matches: 280 },
  { rank: 10, name: 'Veselka Josef', goals: 54, matches: 116 },
  { rank: 11, name: 'Pančocha Karel', goals: 54, matches: 142 },
  { rank: 12, name: 'Příhoda Petr (st.)', goals: 53, matches: 335 },
  { rank: 13, name: 'Ing. Kahánek Jaromír', goals: 52, matches: 180 },
  { rank: 14, name: 'Dědík Lukáš', goals: 50, matches: 120 },
  { rank: 15, name: 'Polášek Luděk', goals: 41, matches: 187 },
  { rank: 16, name: 'Bendik Milan', goals: 40, matches: 126 },
  { rank: 17, name: 'Zeman Marek', goals: 35, matches: 172 },
  { rank: 18, name: 'Krpec Přemek', goals: 33, matches: 47 },
  { rank: 19, name: 'Babinec Radim', goals: 33, matches: 563 },
  { rank: 20, name: 'Freisler Petr', goals: 32, matches: 256 },
]

const seasonSnapshots = [
  {
    season: '2023/24',
    phase: 'po podzimu',
    position: '12.',
    teams: '14 týmů',
    matches: '13',
    score: '29:33',
    points: '10',
  },
  {
    season: '2018/19',
    phase: 'konečná tabulka',
    position: '10.',
    teams: '14 týmů',
    matches: '26',
    score: '42:53',
    points: '35',
  },
  {
    season: '2017/18',
    phase: 'po podzimu',
    position: '3.',
    teams: '14 týmů',
    matches: '14',
    score: '39:33',
    points: '27',
  },
  {
    season: '2016/17',
    phase: 'konečná tabulka',
    position: '5.',
    teams: '14 týmů',
    matches: '26',
    score: '59:52',
    points: '44',
  },
  {
    season: '2015/16',
    phase: 'konečná tabulka',
    position: '11.',
    teams: '14 týmů',
    matches: '26',
    score: '40:64',
    points: '29',
  },
]

const seasonArchive = [
  { season: '2024/25', note: 'výsledky · sestavy · střelci' },
  { season: '2023/24', note: 'výsledky · sestavy · tabulka' },
  { season: '2022/23', note: 'archiv zápasů' },
  { season: '2021/22', note: 'archiv zápasů' },
  { season: '2020/21', note: 'archiv zápasů' },
  { season: '2019/20', note: 'podzim · jaro' },
  { season: '2018/19', note: 'podzim · jaro · konečná tabulka' },
  { season: '2017/18', note: 'podzim · jaro' },
  { season: '2016/17', note: 'podzim · jaro · konečná tabulka' },
  { season: '2015/16', note: 'sezona · jaro · konečná tabulka' },
  { season: '2014/15', note: 'archiv zápasů' },
  { season: '2013/14', note: 'archiv zápasů' },
  { season: '2012/13', note: 'archiv zápasů' },
  { season: '2011/12', note: 'archiv zápasů' },
  { season: '2010/11', note: 'archiv zápasů' },
  { season: '2009/10', note: 'archiv zápasů' },
]

export function ClubStatsPage() {
  return (
    <main>
      <StatsHero />

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-4 md:grid-cols-3">
            <RecordCard
              icon={<Users size={20} />}
              eyebrow="Nejvíce zápasů"
              value="609"
              label="Jiří Michna"
              detail="18 vstřelených branek"
            />
            <RecordCard
              icon={<Goal size={20} />}
              eyebrow="Nejlepší střelec"
              value="162"
              label="Antonín Kašpárek"
              detail="540 odehraných zápasů"
            />
            <RecordCard
              icon={<CalendarDays size={20} />}
              eyebrow="Dochovaný archiv"
              value="16"
              label="sezon od 2009/10"
              detail="výsledky, sestavy, střelci a tabulky"
            />
          </div>

          <div className="mt-7 rounded-[24px] border border-sand-200 bg-[#fbfaf6] px-5 py-4 text-sm leading-6 text-ink-500">
            Historické statistiky hráčů vycházejí z klubových podkladů a dat IS FAČR,
            které byly na původním webu naposledy aktualizovány 28. 2. 2025.
          </div>
        </div>
      </section>

      <section className="bg-sand-100 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <SectionIntro
            eyebrow="Historické pořadí"
            title="Jména, která zanechala stopu."
            text="Dvě základní klubové kroniky v číslech. Zobrazeno je prvních dvacet hráčů v každé kategorii podle dochovaných statistik."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Leaderboard
              title="Odehrané zápasy"
              subtitle="Historické pořadí podle počtu startů"
              rows={appearanceLeaders}
              primaryKey="matches"
            />
            <Leaderboard
              title="Střelci"
              subtitle="Historické pořadí podle počtu branek"
              rows={scoringLeaders}
              primaryKey="goals"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <SectionIntro
            eyebrow="Sezony v číslech"
            title="Dochované souhrnné tabulky."
            text="U ročníků, kde původní web obsahuje ověřitelný souhrn tabulky mužů, zachováváme konkrétní umístění, počet zápasů, skóre a body."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {seasonSnapshots.map((season) => (
              <SeasonCard key={season.season} {...season} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-900 px-5 py-16 text-white md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 sm:text-xs">
                Archiv sezon
              </div>
              <h2 className="mt-3 text-4xl font-black leading-[.98] tracking-[-0.055em] md:text-5xl">
                Šestnáct ročníků klubové historie.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/60 sm:text-base">
                Starý web uchovává sezonní zápisy od ročníku 2009/10. Úroveň detailu se
                mezi jednotlivými ročníky liší — někde jsou kompletní sestavy a střelci,
                jinde především výsledky a průběžné tabulky.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {seasonArchive.map((season) => (
                <div
                  key={season.season}
                  className="flex items-center justify-between gap-5 rounded-[20px] border border-white/10 bg-white/[0.045] px-4 py-3.5"
                >
                  <div className="text-lg font-extrabold tracking-[-0.035em]">
                    {season.season}
                  </div>
                  <div className="text-right text-[10px] font-bold uppercase tracking-[0.13em] text-white/40">
                    {season.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function StatsHero() {
  return (
    <section className="relative -mt-[84px] overflow-hidden px-5 pb-14 pt-[124px] sm:-mt-[88px] sm:pt-[136px] md:px-8 md:pb-20 md:pt-[144px]">
      <div className="pointer-events-none absolute inset-0 bg-sand-50">
        <img
          src="/hero-lichnov-field.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
          style={{ filter: 'saturate(.72) contrast(.9) brightness(1.1)' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#faf8f3_0%,rgba(250,248,243,.95)_30%,rgba(250,248,243,.64)_60%,rgba(250,248,243,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,248,243,.04)_0%,rgba(250,248,243,.1)_55%,#faf8f3_100%)]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] py-8 md:py-12">
        <div className="max-w-[800px]">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500 sm:text-xs">
            Klubové statistiky
          </div>
          <h1 className="mt-4 text-[clamp(3.1rem,7vw,6.6rem)] font-black leading-[.88] tracking-[-0.072em] text-brand-900">
            Historie v číslech.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-ink-500 sm:text-lg sm:leading-8">
            Rekordmani v počtu odehraných zápasů, nejlepší střelci a dochované
            statistiky jednotlivých sezon NFC Lichnov.
          </p>
        </div>
      </div>
    </section>
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
    <article className="rounded-[32px] border border-sand-200 bg-[#fbfaf6] p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.17em] text-ink-500">
          {eyebrow}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          {icon}
        </div>
      </div>
      <div className="mt-9 text-5xl font-black tracking-[-0.065em] text-brand-900">
        {value}
      </div>
      <div className="mt-2 text-xl font-extrabold tracking-[-0.035em] text-brand-900">
        {label}
      </div>
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

function Leaderboard({
  title,
  subtitle,
  rows,
  primaryKey,
}: {
  title: string
  subtitle: string
  rows: Leader[]
  primaryKey: 'matches' | 'goals'
}) {
  const secondaryLabel = primaryKey === 'matches' ? 'Góly' : 'Zápasy'

  return (
    <article className="overflow-hidden rounded-[32px] border border-sand-200 bg-white">
      <div className="border-b border-sand-200 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <Trophy size={18} className="text-brand-500" />
          <div>
            <h3 className="text-2xl font-extrabold tracking-[-0.04em] text-brand-900">{title}</h3>
            <p className="mt-1 text-xs text-ink-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div>
        {rows.map((player) => (
          <div
            key={`${title}-${player.rank}`}
            className={`grid grid-cols-[42px_minmax(0,1fr)_72px_64px] items-center gap-2 border-b border-sand-200 px-4 py-3.5 last:border-b-0 sm:grid-cols-[50px_minmax(0,1fr)_90px_78px] sm:px-6 ${
              player.rank <= 3 ? 'bg-[#fbfaf6]' : ''
            }`}
          >
            <div
              className={`text-sm font-black ${
                player.rank <= 3 ? 'text-brand-500' : 'text-ink-500'
              }`}
            >
              {String(player.rank).padStart(2, '0')}
            </div>
            <div className="min-w-0 truncate text-sm font-bold text-brand-900 sm:text-base">
              {player.name}
            </div>
            <div className="text-right">
              <div className="text-base font-black text-brand-900 sm:text-lg">
                {primaryKey === 'matches' ? player.matches : player.goals}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-500">
                {primaryKey === 'matches' ? 'zápasů' : 'gólů'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-ink-500">
                {primaryKey === 'matches' ? player.goals : player.matches}
              </div>
              <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-ink-500/70">
                {secondaryLabel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function SeasonCard({
  season,
  phase,
  position,
  teams,
  matches,
  score,
  points,
}: {
  season: string
  phase: string
  position: string
  teams: string
  matches: string
  score: string
  points: string
}) {
  return (
    <article className="rounded-[28px] border border-sand-200 bg-[#fbfaf6] p-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-500">{phase}</div>
      <div className="mt-2 text-2xl font-black tracking-[-0.045em] text-brand-900">{season}</div>

      <div className="mt-7 border-t border-sand-200 pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-4xl font-black tracking-[-0.06em] text-brand-900">{position}</div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ink-500">
              {teams}
            </div>
          </div>
          <Trophy size={20} className="mb-1 text-brand-500" />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <MiniStat value={matches} label="zápasy" />
          <MiniStat value={score} label="skóre" />
          <MiniStat value={points} label="body" />
        </div>
      </div>
    </article>
  )
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-sm font-extrabold text-brand-900">{value}</div>
      <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-ink-500">{label}</div>
    </div>
  )
}
