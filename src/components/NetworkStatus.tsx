import { useEffect, useState } from 'react'

export function NetworkStatus() {
  const [offline, setOffline] = useState(() => !navigator.onLine)

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)

    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[120] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-white/10 bg-brand-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-soft"
    >
      Jsi offline. Už načtený obsah může zůstat dostupný, nová data se obnoví po připojení.
    </div>
  )
}
