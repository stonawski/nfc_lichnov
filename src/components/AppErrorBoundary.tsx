import { Component, type ErrorInfo, type ReactNode } from 'react'

type State = { failed: boolean }

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unexpected application error', error, info)
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="grid min-h-screen place-items-center bg-sand-50 px-5 text-ink-900">
          <div className="w-full max-w-xl rounded-[32px] border border-sand-200 bg-white p-7 text-center shadow-soft sm:p-9">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
              NFC Lichnov
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-brand-900 sm:text-4xl">
              Něco se nepodařilo načíst.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink-500">
              Zkus stránku obnovit. Pokud problém přetrvá, web může mít dočasný problém s daty nebo připojením.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-7 rounded-2xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Obnovit stránku
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
