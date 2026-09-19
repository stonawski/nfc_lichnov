export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Načítání">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-3xl bg-white/70 ring-1 ring-sand-200" />
      ))}
    </div>
  )
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-4xl border border-dashed border-sand-200 bg-white/55 px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-500">{text}</p>
    </div>
  )
}
