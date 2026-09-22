import {
  ArrowUpRight,
  Images,
  Newspaper,
  Trophy,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const modules = [
  {
    to: '/admin/galerie',
    title: 'Galerie',
    description: 'Vytváření galerií, publikování a správa fotografií.',
    icon: Images,
    status: 'Připraveno',
  },
  {
    to: '/admin/aktuality',
    title: 'Aktuality',
    description: 'Články, titulní fotografie a publikace novinek.',
    icon: Newspaper,
    status: 'Připraveno',
  },
  {
    to: '/admin/hraci',
    title: 'Hráči',
    description: 'Profily hráčů, fotografie, čísla a doplňující obsah.',
    icon: UserRound,
    status: 'Připraveno',
  },
  {
    to: '/admin/realizacni-tym',
    title: 'Realizační tým',
    description: 'Trenéři, vedení týmu, fotografie a medailonky.',
    icon: UsersRound,
    status: 'Připraveno',
  },
  {
    to: '/admin/statistiky',
    title: 'Historické statistiky',
    description: 'Zápasy, střelci, sezony a audit změn klubové historie.',
    icon: Trophy,
    status: 'Připraveno',
  },
]

export function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="max-w-3xl">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
          NFC Lichnov
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
          Administrace obsahu
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-500">
          Tady budeme postupně spravovat všechen ručně editovaný obsah webu.
          Sportovní data z automatických importů zůstávají oddělená.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {modules.map((module) => {
          const Icon = module.icon

          return (
            <Link
              key={module.to}
              to={module.to}
              className="group rounded-[30px] border border-sand-200 bg-[#fbfaf6] p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft sm:p-7"
            >
              <div className="flex items-start justify-between gap-5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon size={21} />
                </div>

                <ArrowUpRight
                  size={18}
                  className="text-ink-500 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-500"
                />
              </div>

              <div className="mt-8 flex items-center gap-3">
                <h2 className="text-2xl font-extrabold tracking-[-0.045em] text-brand-900">
                  {module.title}
                </h2>
                <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-500">
                  {module.status}
                </span>
              </div>

              <p className="mt-3 max-w-xl text-sm leading-6 text-ink-500">
                {module.description}
              </p>
            </Link>
          )
        })}
      </div>

      <div className="mt-6 rounded-[30px] border border-brand-900/10 bg-brand-900 p-6 text-white sm:p-8">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">
          Media storage
        </div>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_.65fr] lg:items-end">
          <div>
            <h2 className="text-3xl font-black tracking-[-0.05em]">
              Cloudflare R2 bude společné úložiště médií.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
              Galerie, fotografie hráčů, trenérů i titulní obrázky aktualit budou
              používat jeden bezpečný upload systém a jednotnou správu souborů.
            </p>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-3 text-xs leading-5 text-white/60">
            Bucket: <span className="font-bold text-white">nfclichnov</span>
          </div>
        </div>
      </div>
    </div>
  )
}
