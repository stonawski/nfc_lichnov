import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let active = true

    async function redirectExistingEditor() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!active || !session) return

      const { data: canEdit } = await supabase.rpc('can_edit_content')
      if (active && canEdit === true) navigate('/admin', { replace: true })
    }

    void redirectExistingEditor()

    return () => {
      active = false
    }
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setError('Přihlášení se nepodařilo. Zkontroluj e-mail a heslo.')
      setSubmitting(false)
      return
    }

    const { data: canEdit, error: permissionError } = await supabase.rpc('can_edit_content')

    if (permissionError || canEdit !== true) {
      await supabase.auth.signOut()
      setError('Tento účet nemá oprávnění spravovat obsah.')
      setSubmitting(false)
      return
    }

    const from =
      typeof location.state === 'object' &&
      location.state &&
      'from' in location.state &&
      typeof location.state.from === 'string'
        ? location.state.from
        : '/admin'

    navigate(from, { replace: true })
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#f5f2ea] px-5 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(0,146,63,.11),transparent_30%),radial-gradient(circle_at_82%_82%,rgba(222,207,172,.34),transparent_32%)]" />

      <div className="relative mx-auto grid w-full max-w-[1120px] gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <section className="hidden rounded-[42px] bg-brand-900 p-10 text-white shadow-soft lg:block xl:p-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
            <LockKeyhole size={13} />
            NFC Lichnov CMS
          </div>

          <h1 className="mt-10 max-w-xl text-6xl font-black leading-[0.93] tracking-[-0.065em]">
            Obsah klubu pod kontrolou.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-white/60">
            Jedno místo pro galerie, aktuality, hráče a další klubový obsah.
            Přístup mají pouze účty, které projdou klubovým oprávněním.
          </p>

          <div className="mt-16 grid gap-3 sm:grid-cols-3">
            {['Galerie', 'Aktuality', 'Hráči'].map((item) => (
              <div key={item} className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                  Modul
                </div>
                <div className="mt-2 text-lg font-extrabold">{item}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-lg rounded-[36px] border border-white/80 bg-[#fbfaf6]/95 p-6 shadow-soft backdrop-blur sm:p-9">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-brand-900"
          >
            <ArrowLeft size={16} />
            Zpět na web
          </Link>

          <div className="mt-9">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
              Administrace
            </div>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] text-brand-900">
              Přihlášení
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink-500">
              Použij účet vytvořený v Supabase Authentication.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink-500">
                E-mail
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-sand-200 bg-white px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                placeholder="admin@nfclichnov.cz"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink-500">
                Heslo
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-sand-200 bg-white px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-900 px-5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? 'Přihlašuji…' : 'Přihlásit se'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
