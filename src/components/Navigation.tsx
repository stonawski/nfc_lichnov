import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import type { Team } from '../lib/types'
import { ClubLogo } from './ClubLogo'

const clubLinks = [
  { label: 'O klubu', to: '/klub', description: 'Kdo jsme a jak klub funguje' },
  { label: 'Historie', to: '/klub#historie', description: 'Příběh fotbalu v Lichnově' },
  { label: 'Sportovní areál', to: '/klub#areal', description: 'Hřiště, zázemí a návštěva' },
  { label: 'Kontakt', to: '/kontakt', description: 'Spojení na klub' },
]

export function Navigation({ teams }: { teams: Team[] }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileTeamsOpen, setMobileTeamsOpen] = useState(false)
  const [mobileClubOpen, setMobileClubOpen] = useState(false)
  const location = useLocation()
  const primaryLogo = teams.find((team) => team.slug === 'muzi')?.logo_url ?? teams[0]?.logo_url

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!mobileOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav className="mx-auto flex h-[68px] max-w-[1210px] items-center justify-between gap-4 rounded-[22px] border border-white/80 bg-[#fbfaf6]/90 px-3.5 shadow-nav backdrop-blur-2xl sm:px-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 rounded-2xl px-1 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <ClubLogo src={primaryLogo} name="NFC Lichnov" size="sm" />
          <div className="hidden leading-none sm:block">
            <div className="text-[14px] font-extrabold tracking-[-0.035em] text-brand-900">NFC Lichnov</div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-500">fotbalový klub</div>
          </div>
        </Link>

        <div className="hidden items-center rounded-[16px] border border-sand-200/80 bg-white/60 p-1 lg:flex">
          <Dropdown label="Týmy">
            <div className="min-w-[430px] p-2.5">
              <div className="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-500">
                Kategorie NFC Lichnov
              </div>
              <div className="grid grid-cols-2 gap-1">
                {teams.map((team) => (
                  <Link
                    key={team.id}
                    to={`/tymy/${team.slug}`}
                    className="group/item rounded-2xl px-3.5 py-3 transition hover:bg-sand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500/60 transition group-hover/item:scale-125 group-hover/item:bg-brand-500" />
                      <div className="text-sm font-semibold text-ink-900">{team.name}</div>
                    </div>
                    <div className="mt-1 pl-4 text-[11px] text-ink-500">Zápasy · hráči · statistiky</div>
                  </Link>
                ))}
              </div>
            </div>
          </Dropdown>

          <NavItem to="/zapasy">Zápasy</NavItem>
          <NavItem to="/aktuality">Aktuality</NavItem>
          <NavItem to="/galerie">Galerie</NavItem>

          <Dropdown label="Klub">
            <div className="min-w-[330px] p-2.5">
              {clubLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="group/item flex items-center justify-between gap-5 rounded-2xl px-3.5 py-3 transition hover:bg-sand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <div>
                    <div className="text-sm font-semibold text-ink-900">{item.label}</div>
                    <div className="mt-1 text-[11px] text-ink-500">{item.description}</div>
                  </div>
                  <ArrowUpRight
                    size={15}
                    className="shrink-0 text-ink-500 transition group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 group-hover/item:text-brand-500"
                  />
                </Link>
              ))}
            </div>
          </Dropdown>
        </div>

        <Link
          to="/kontakt"
          className="hidden items-center gap-1.5 rounded-[15px] bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:inline-flex"
        >
          Kontakt <ArrowUpRight size={14} />
        </Link>

        <button
          type="button"
          aria-label="Otevřít menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-[14px] bg-white text-brand-900 ring-1 ring-sand-200 transition hover:bg-sand-100 lg:hidden"
        >
          <Menu size={19} />
        </button>
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-brand-900/25 p-3 backdrop-blur-md lg:hidden"
          onClick={closeMobile}
        >
          <div
            className="mobile-menu-enter ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto rounded-[30px] border border-white/70 bg-[#fbfaf6] p-5 shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link to="/" onClick={closeMobile} className="flex items-center gap-3">
                <ClubLogo src={primaryLogo} name="NFC Lichnov" size="sm" />
                <div>
                  <div className="font-extrabold tracking-tight text-brand-900">NFC Lichnov</div>
                  <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.17em] text-ink-500">fotbalový klub</div>
                </div>
              </Link>

              <button
                type="button"
                onClick={closeMobile}
                aria-label="Zavřít menu"
                className="grid h-10 w-10 place-items-center rounded-[14px] bg-white ring-1 ring-sand-200"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-8 space-y-1">
              <MobileGroup
                label="Týmy"
                open={mobileTeamsOpen}
                onToggle={() => setMobileTeamsOpen((value) => !value)}
              >
                {teams.map((team) => (
                  <Link
                    key={team.id}
                    to={`/tymy/${team.slug}`}
                    onClick={closeMobile}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 transition hover:bg-white"
                  >
                    {team.name}
                  </Link>
                ))}
              </MobileGroup>

              <MobileLink to="/zapasy" close={closeMobile}>Zápasy</MobileLink>
              <MobileLink to="/aktuality" close={closeMobile}>Aktuality</MobileLink>
              <MobileLink to="/galerie" close={closeMobile}>Galerie</MobileLink>

              <MobileGroup
                label="Klub"
                open={mobileClubOpen}
                onToggle={() => setMobileClubOpen((value) => !value)}
              >
                {clubLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={closeMobile}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 transition hover:bg-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </MobileGroup>
            </div>

            <div className="mt-auto pt-8">
              <div className="overflow-hidden rounded-[26px] bg-brand-900 p-5 text-white">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">NFC Lichnov</div>
                <p className="mt-2 text-xl font-extrabold leading-tight tracking-[-0.035em]">
                  Fotbal v Lichnově. Od nejmenších až po muže.
                </p>
                <Link
                  to="/kontakt"
                  onClick={closeMobile}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-900"
                >
                  Kontakt <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-[13px] px-3.5 py-2 text-[13px] font-semibold transition ${
          isActive
            ? 'bg-white text-brand-900 shadow-sm ring-1 ring-sand-200/80'
            : 'text-ink-900 hover:bg-white/80'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

function Dropdown({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-haspopup="menu"
        className="flex items-center gap-1 rounded-[13px] px-3.5 py-2 text-[13px] font-semibold text-ink-900 transition hover:bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {label}
        <ChevronDown size={14} className="transition duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
      </button>

      <div className="pointer-events-none absolute left-1/2 top-full z-30 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="rounded-[24px] border border-white/85 bg-[#fbfaf6]/95 shadow-soft ring-1 ring-sand-200/60 backdrop-blur-2xl">
          {children}
        </div>
      </div>
    </div>
  )
}

function MobileLink({ to, close, children }: { to: string; close: () => void; children: ReactNode }) {
  return (
    <Link
      to={to}
      onClick={close}
      className="block rounded-2xl px-4 py-3.5 text-xl font-semibold tracking-tight text-ink-900 transition hover:bg-white"
    >
      {children}
    </Link>
  )
}

function MobileGroup({
  label,
  open,
  onToggle,
  children,
}: {
  label: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-xl font-semibold tracking-tight text-ink-900 transition hover:bg-white"
      >
        {label}
        <ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="ml-2 mt-1 border-l border-sand-200 pl-3">{children}</div>}
    </div>
  )
}
