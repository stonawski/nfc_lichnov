import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type AccessState = 'checking' | 'allowed' | 'signed-out' | 'forbidden' | 'error'

export function AdminGuard() {
  const [state, setState] = useState<AccessState>('checking')
  const location = useLocation()

  useEffect(() => {
    let cancelled = false

    async function verifyAccess() {
      setState('checking')

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (cancelled) return

      if (sessionError) {
        setState('error')
        return
      }

      if (!session) {
        setState('signed-out')
        return
      }

      const { data: canEdit, error: permissionError } = await supabase.rpc('can_edit_content')

      if (cancelled) return

      if (permissionError) {
        console.error('Unable to verify admin permissions', permissionError)
        setState('error')
        return
      }

      setState(canEdit === true ? 'allowed' : 'forbidden')
    }

    void verifyAccess()

    return () => {
      cancelled = true
    }
  }, [])

  if (state === 'checking') {
    return (
      <div className="grid min-h-screen place-items-center bg-sand-50 px-5 text-ink-900">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-brand-900/15 border-t-brand-500" />
          <div className="mt-4 text-sm font-semibold text-ink-500">Ověřuji přístup…</div>
        </div>
      </div>
    )
  }

  if (state === 'signed-out') {
    return <Navigate to="/admin/prihlaseni" replace state={{ from: location.pathname }} />
  }

  if (state === 'forbidden') {
    return (
      <div className="grid min-h-screen place-items-center bg-sand-50 px-5">
        <div className="w-full max-w-lg rounded-[32px] border border-sand-200 bg-white p-8 text-center shadow-soft">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">Administrace</div>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-brand-900">
            Tento účet nemá přístup
          </h1>
          <p className="mt-4 text-sm leading-6 text-ink-500">
            Účet je přihlášený, ale funkce <code>can_edit_content()</code> mu nepovolila správu obsahu.
          </p>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="mt-7 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Odhlásit se
          </button>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="grid min-h-screen place-items-center bg-sand-50 px-5">
        <div className="w-full max-w-lg rounded-[32px] border border-sand-200 bg-white p-8 text-center shadow-soft">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">Administrace</div>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-brand-900">
            Přístup se nepodařilo ověřit
          </h1>
          <p className="mt-4 text-sm leading-6 text-ink-500">
            Zkontroluj připojení k Supabase a nastavení funkce <code>can_edit_content()</code>.
          </p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
