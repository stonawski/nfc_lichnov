import {
  ArrowLeft,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  ShieldCheck,
  Trophy,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Seo } from '../components/Seo'

const navItems = [
  { to: '/admin', label: 'Přehled', icon: LayoutDashboard, end: true },
  { to: '/admin/galerie', label: 'Galerie', icon: Images },
  { to: '/admin/aktuality', label: 'Aktuality', icon: Newspaper },
  { to: '/admin/hraci', label: 'Hráči', icon: UserRound },
  { to: '/admin/realizacni-tym', label: 'Realizační tým', icon: UsersRound },
  { to: '/admin/statistiky', label: 'Statistiky', icon: Trophy },
]

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileOpen])

  useEffect(() => {
    let active = true

    void supabase.auth.getUser().then(({ data }) => {
      if (active) setEmail(data.user?.email ?? null)
    })

    return () => {
      active = false
    }
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/admin/prihlaseni', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f5f2ea] text-ink-900">
      <Seo title="Administrace" description="Administrace obsahu NFC Lichnov." noindex />
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 border-r border-sand-200/80 bg-[#fbfaf6] p-5 lg:flex lg:flex-col">
          <AdminBrand />

          <nav className="mt-10 space-y-1.5">
            {navItems.map((item) => (
              <AdminNavLink key={item.to} {...item} />
            ))}
          </nav>

          <div className="mt-auto">
            <div className="rounded-[24px] border border-sand-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-500">
                <ShieldCheck size={14} />
                Přihlášený editor
              </div>
              <div className="mt-2 truncate text-sm font-semibold text-brand-900">
                {email || 'Administrátor'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink-500 transition hover:bg-white hover:text-brand-900"
            >
              <LogOut size={17} />
              Odhlásit se
            </button>

            <Link
              to="/"
              className="mt-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink-500 transition hover:bg-white hover:text-brand-900"
            >
              <ArrowLeft size={17} />
              Zpět na web
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-sand-200/80 bg-[#fbfaf6]/90 px-4 backdrop-blur-xl sm:px-6 lg:hidden">
            <AdminBrand compact />

            <button
              type="button"
              aria-label="Otevřít administraci"
              onClick={() => setMobileOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-white ring-1 ring-sand-200"
            >
              <Menu size={19} />
            </button>
          </header>

          <div className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10 xl:py-10">
            <Outlet />
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] bg-brand-900/25 p-3 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigace administrace"
            className="ml-auto flex h-full w-full max-w-sm flex-col rounded-[30px] border border-white/70 bg-[#fbfaf6] p-5 shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <AdminBrand compact />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-white ring-1 ring-sand-200"
                aria-label="Zavřít administraci"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-8 space-y-1.5">
              {navItems.map((item) => (
                <AdminNavLink key={item.to} {...item} />
              ))}
            </nav>

            <div className="mt-auto">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink-500 transition hover:bg-white"
              >
                <LogOut size={17} />
                Odhlásit se
              </button>

              <Link
                to="/"
                className="mt-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink-500 transition hover:bg-white"
              >
                <ArrowLeft size={17} />
                Zpět na web
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/admin" className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-900 text-sm font-black text-white">
        NFC
      </div>
      {!compact && (
        <div>
          <div className="text-sm font-extrabold tracking-[-0.03em] text-brand-900">NFC Lichnov</div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.13em] text-ink-500">Administrace</div>
        </div>
      )}
      {compact && (
        <div className="text-sm font-extrabold tracking-[-0.03em] text-brand-900">
          Administrace
        </div>
      )}
    </Link>
  )
}

function AdminNavLink({
  to,
  label,
  icon: Icon,
  end = false,
}: {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          isActive
            ? 'bg-brand-900 text-white shadow-sm'
            : 'text-ink-500 hover:bg-white hover:text-brand-900'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}
