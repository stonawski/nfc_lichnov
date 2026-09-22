import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import type { Team } from '../lib/types'
import { ClubLogo } from './ClubLogo'
import { DataFade } from './DataFade'

const clubLinks = [
  { label: 'O klubu', to: '/klub', description: 'Kdo jsme a jak klub funguje' },
  { label: 'Historie', to: '/klub/historie', description: 'Příběh fotbalu v Lichnově' },
  { label: 'Statistiky', to: '/klub/statistiky', description: 'Rekordy, střelci a archiv sezon' },
  { label: 'Sportovní areál', to: '/klub/areal', description: 'Hřiště, zázemí a návštěva' },
  { label: 'Kontakt', to: '/kontakt', description: 'Spojení na klub' },
]

export function Navigation({ teams, loading = false }: { teams: Team[]; loading?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileMounted, setMobileMounted] = useState(false)
  const [mobileTeamsOpen, setMobileTeamsOpen] = useState(false)
  const [mobileClubOpen, setMobileClubOpen] = useState(false)
  const location = useLocation()
  const mobileTimerRef = useRef<number | null>(null)
  const primaryLogo = teams.find((team) => team.slug === 'muzi')?.logo_url ?? teams[0]?.logo_url
  const teamsActive = location.pathname.startsWith('/tymy')
  const clubActive = location.pathname.startsWith('/klub') || location.pathname === '/kontakt'


  function clearMobileTimer() {
    if (mobileTimerRef.current == null) return
    window.clearTimeout(mobileTimerRef.current)
    mobileTimerRef.current = null
  }

  function openMobile() {
    clearMobileTimer()
    setMobileMounted(true)
    requestAnimationFrame(() => setMobileOpen(true))
  }

  function closeMobile() {
    setMobileOpen(false)
    clearMobileTimer()
    mobileTimerRef.current = window.setTimeout(() => {
      mobileTimerRef.current = null
      setMobileMounted(false)
    }, 520)
  }

  useEffect(() => {
    closeMobile()

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!mobileMounted) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobile()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileMounted])

  useEffect(() => () => clearMobileTimer(), [])

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav className="nav-shell mx-auto flex h-[72px] max-w-[1210px] items-center justify-between gap-4 rounded-[22px] border border-white/80 bg-[#fbfaf6]/90 px-3.5 shadow-nav backdrop-blur-2xl sm:px-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 rounded-2xl px-1 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {loading ? (
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-sand-100" />
          ) : (
            <DataFade>
              <ClubLogo src={primaryLogo} name="NFC Lichnov" size="md" />
            </DataFade>
          )}
          <div className="hidden sm:block">
            <div className="text-[15px] font-extrabold tracking-[-0.035em] text-brand-900">NFC Lichnov</div>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <Dropdown label="Týmy" active={teamsActive}>
            <div className="min-w-[430px] p-2.5">
              <div className="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-500">
                Kategorie NFC Lichnov
              </div>
              <DataFade className="grid grid-cols-2 gap-1">
                <DataFade>
                  {teams.map((team) => (
                  <Link
                    key={team.id}
                    to={`/tymy/${team.slug}`}
                    onClick={(event) => event.currentTarget.blur()}
                    className="group/item rounded-2xl px-3.5 py-3 transition hover:bg-sand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500/60 transition group-hover/item:scale-125 group-hover/item:bg-brand-500" />
                      <div className="text-sm font-semibold text-ink-900">{team.name}</div>
                    </div>
                    <div className="mt-1 pl-4 text-[11px] text-ink-500">Zápasy · hráči · statistiky</div>
                  </Link>
                ))}
              </DataFade>
            </div>
          </Dropdown>

          <NavItem to="/zapasy">Zápasy</NavItem>
          <NavItem to="/aktuality">Aktuality</NavItem>
          <NavItem to="/galerie">Galerie</NavItem>

          <Dropdown label="Klub" active={clubActive}>
            <div className="min-w-[330px] p-2.5">
              {clubLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={(event) => event.currentTarget.blur()}
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
          onClick={openMobile}
          className="grid h-10 w-10 place-items-center rounded-[14px] bg-white text-brand-900 ring-1 ring-sand-200 transition hover:bg-sand-100 lg:hidden"
        >
          <Menu size={19} />
        </button>
      </nav>

      {mobileMounted && (
        <div
          className={`fixed inset-0 z-[60] bg-brand-900/25 p-3 backdrop-blur-md transition-[opacity,backdrop-filter] duration-[520ms] ease-smooth lg:hidden ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobile}
        >
          <div
            className={`ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto rounded-[30px] border border-white/70 bg-[#fbfaf6] p-5 shadow-soft transition-[transform,opacity] duration-[560ms] ease-smooth ${
              mobileOpen ? 'translate-x-0 opacity-100' : 'translate-x-5 opacity-0'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link to="/" onClick={closeMobile} className="flex items-center gap-3">
                {loading ? (
                  <div className="h-11 w-11 shrink-0 rounded-2xl bg-sand-100" />
                ) : (
                  <DataFade>
                    <ClubLogo src={primaryLogo} name="NFC Lichnov" size="md" />
                  </DataFade>
                )}
                <div className="font-extrabold tracking-tight text-brand-900">NFC Lichnov</div>
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
                </DataFade>
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
        `nav-link px-3.5 py-2 text-[13px] font-semibold ${isActive ? 'nav-link-active' : ''}`
      }
    >
      {children}
    </NavLink>
  )
}

function Dropdown({
  label,
  active,
  children,
}: {
  label: string
  active: boolean
  children: ReactNode
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-haspopup="menu"
        className={`nav-link flex items-center gap-1 px-3.5 py-2 text-[13px] font-semibold ${active ? 'nav-link-active' : ''}`}
      >
        {label}
        <ChevronDown size={14} className="transition duration-[420ms] ease-smooth group-hover:rotate-180 group-focus-within:rotate-180" />
      </button>

      <div className="pointer-events-none absolute left-1/2 top-full z-30 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition duration-[460ms] ease-smooth group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
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
        <ChevronDown
          size={18}
          className={`transition duration-[420ms] ease-smooth ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-[520ms] ease-smooth ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="ml-2 mt-1 border-l border-sand-200 pl-3">{children}</div>
        </div>
      </div>
    </div>
  )
}
