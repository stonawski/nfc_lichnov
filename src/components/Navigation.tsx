import { ChevronDown, Menu, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import type { Team } from '../lib/types'
import { ClubLogo } from './ClubLogo'

const clubLinks = [
  { label: 'O klubu', to: '/klub' },
  { label: 'Historie', to: '/klub#historie' },
  { label: 'Sportovní areál', to: '/klub#areal' },
  { label: 'Kontakt', to: '/kontakt' },
]

export function Navigation({ teams }: { teams: Team[] }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileTeamsOpen, setMobileTeamsOpen] = useState(false)
  const [mobileClubOpen, setMobileClubOpen] = useState(false)
  const primaryLogo = teams.find((team) => team.slug === 'muzi')?.logo_url ?? teams[0]?.logo_url

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      <nav className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between rounded-[24px] border border-white/70 bg-[#fbfaf6]/90 px-4 shadow-nav backdrop-blur-xl sm:px-5">
        <Link to="/" className="flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          <ClubLogo src={primaryLogo} name="NFC Lichnov" size="sm" />
          <div className="leading-none">
            <div className="text-[15px] font-extrabold tracking-[-0.03em] text-brand-900">NFC Lichnov</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">fotbalový klub</div>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <Dropdown label="Týmy">
            <div className="grid min-w-[390px] grid-cols-2 gap-1 p-2">
              {teams.map((team) => (
                <Link key={team.id} to={`/tymy/${team.slug}`} className="rounded-2xl px-4 py-3 transition hover:bg-sand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  <div className="text-sm font-semibold text-ink-900">{team.name}</div>
                  <div className="mt-1 text-xs text-ink-500">Zápasy, hráči a statistiky</div>
                </Link>
              ))}
            </div>
          </Dropdown>
          <NavItem to="/zapasy">Zápasy</NavItem>
          <NavItem to="/aktuality">Aktuality</NavItem>
          <NavItem to="/galerie">Galerie</NavItem>
          <Dropdown label="Klub">
            <div className="min-w-[280px] p-2">
              {clubLinks.map((item) => (
                <Link key={item.label} to={item.to} className="block rounded-2xl px-4 py-3 text-sm font-semibold text-ink-900 transition hover:bg-sand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  {item.label}
                </Link>
              ))}
            </div>
          </Dropdown>
        </div>

        <Link to="/kontakt" className="hidden rounded-2xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:inline-flex">
          Kontakt
        </Link>

        <button type="button" aria-label="Otevřít menu" onClick={() => setMobileOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-brand-900 ring-1 ring-sand-200 lg:hidden">
          <Menu size={20} />
        </button>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-brand-900/20 p-3 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="ml-auto flex h-full w-full max-w-md flex-col rounded-[30px] bg-[#fbfaf6] p-5 shadow-soft" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
                <ClubLogo src={primaryLogo} name="NFC Lichnov" size="sm" />
                <span className="font-extrabold text-brand-900">NFC Lichnov</span>
              </Link>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Zavřít menu" className="grid h-11 w-11 place-items-center rounded-2xl bg-white ring-1 ring-sand-200">
                <X size={20} />
              </button>
            </div>

            <div className="mt-8 space-y-2">
              <MobileGroup label="Týmy" open={mobileTeamsOpen} onToggle={() => setMobileTeamsOpen((value) => !value)}>
                {teams.map((team) => (
                  <Link key={team.id} to={`/tymy/${team.slug}`} onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 hover:bg-white">{team.name}</Link>
                ))}
              </MobileGroup>
              <MobileLink to="/zapasy" close={() => setMobileOpen(false)}>Zápasy</MobileLink>
              <MobileLink to="/aktuality" close={() => setMobileOpen(false)}>Aktuality</MobileLink>
              <MobileLink to="/galerie" close={() => setMobileOpen(false)}>Galerie</MobileLink>
              <MobileGroup label="Klub" open={mobileClubOpen} onToggle={() => setMobileClubOpen((value) => !value)}>
                {clubLinks.map((item) => (
                  <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 hover:bg-white">{item.label}</Link>
                ))}
              </MobileGroup>
            </div>

            <div className="mt-auto rounded-4xl bg-brand-900 p-5 text-white">
              <p className="text-sm text-white/70">NFC Lichnov</p>
              <p className="mt-2 text-xl font-bold tracking-tight">Fotbal v Lichnově. Od nejmenších až po muže.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return <NavLink to={to} className={({ isActive }) => `rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-white text-brand-900 shadow-sm' : 'text-ink-900 hover:bg-white/70'}`}>{children}</NavLink>
}

function Dropdown({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        {label}<ChevronDown size={15} className="transition group-hover:rotate-180" />
      </button>
      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 translate-y-1 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="rounded-[26px] border border-white/80 bg-[#fbfaf6]/95 shadow-soft backdrop-blur-xl">{children}</div>
      </div>
    </div>
  )
}

function MobileLink({ to, close, children }: { to: string; close: () => void; children: ReactNode }) {
  return <Link to={to} onClick={close} className="block rounded-2xl px-4 py-3.5 text-xl font-semibold tracking-tight text-ink-900 hover:bg-white">{children}</Link>
}

function MobileGroup({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-xl font-semibold tracking-tight text-ink-900 hover:bg-white">
        {label}<ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="ml-2 mt-1 border-l border-sand-200 pl-3">{children}</div>}
    </div>
  )
}
