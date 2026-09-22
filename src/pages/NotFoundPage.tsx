import { ArrowLeft, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'

export function NotFoundPage() {
  return (
    <main className="grid min-h-[70svh] place-items-center bg-sand-50 px-5 py-20 md:px-8">
      <Seo
        title="Stránka nenalezena"
        description="Požadovaná stránka na webu NFC Lichnov nebyla nalezena."
        noindex
      />

      <div className="mx-auto w-full max-w-[760px] overflow-hidden rounded-[38px] border border-sand-200 bg-white p-7 text-center shadow-soft sm:p-10">
        <div className="text-[clamp(5rem,18vw,9rem)] font-black leading-none tracking-[-0.08em] text-brand-900">
          404
        </div>
        <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
          Tahle cesta nevede na hřiště
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-brand-900 sm:text-4xl">
          Stránka nebyla nalezena.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-ink-500">
          Odkaz mohl být změněný nebo stránka už neexistuje. Z hlavní stránky se dostaneš zpět k aktuálnímu obsahu klubu.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            <Home size={16} />
            Na homepage
          </Link>
          <button
            type="button"
            onClick={() => history.back()}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-brand-900 ring-1 ring-sand-200 transition hover:bg-sand-100"
          >
            <ArrowLeft size={16} />
            Zpět
          </button>
        </div>
      </div>
    </main>
  )
}
