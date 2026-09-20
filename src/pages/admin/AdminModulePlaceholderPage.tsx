import { ArrowRight, Newspaper, UserRound, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'

const modules = {
  aktuality: {
    eyebrow: 'Obsah',
    title: 'Aktuality',
    description:
      'Tady vznikne editor článků, titulních fotografií, publikace a správa rozpracovaných novinek.',
    icon: Newspaper,
  },
  hraci: {
    eyebrow: 'Týmy',
    title: 'Hráči',
    description:
      'Tady doplníme správu profilů hráčů, ručních fotografií a obsahu, který se nepřebírá automaticky.',
    icon: UserRound,
  },
  'realizacni-tym': {
    eyebrow: 'Týmy',
    title: 'Realizační tým',
    description:
      'Tady budeme spravovat trenéry, vedení, fotografie a medailonky realizačního týmu.',
    icon: UsersRound,
  },
}

export function AdminModulePlaceholderPage({
  module,
}: {
  module: keyof typeof modules
}) {
  const item = modules[module]
  const Icon = item.icon

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="max-w-3xl">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
          {item.eyebrow}
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900 sm:text-5xl">
          {item.title}
        </h1>
      </div>

      <div className="mt-10 rounded-[34px] border border-sand-200 bg-[#fbfaf6] p-7 sm:p-10">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Icon size={23} />
        </div>
        <h2 className="mt-7 text-2xl font-extrabold tracking-[-0.04em] text-brand-900">
          Modul je připravený v navigaci
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-500">
          {item.description}
        </p>

        <Link
          to="/admin"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          Zpět na přehled
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
