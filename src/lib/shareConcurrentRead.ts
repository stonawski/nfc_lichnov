/**
 * Coalesce reads while the same network request is in flight.
 * Do not hold the result after settle: React Query remains the only cache,
 * so CMS invalidation and manual refresh see updated database content.
 */
export function createConcurrentReadDeduper() {
  const pendingReads = new Map<string, Promise<unknown>>()

  return function shareConcurrentRead<T>(key: string, load: () => Promise<T>): Promise<T> {
    const existing = pendingReads.get(key) as Promise<T> | undefined
    if (existing) return existing

    const pending = Promise.resolve().then(load).finally(() => {
      if (pendingReads.get(key) === pending) pendingReads.delete(key)
    })
    pendingReads.set(key, pending)
    return pending
  }
}
