/**
 * Prevent an unanswered PostgREST query from holding a skeleton forever.
 * Auth, Edge Functions and media transfers intentionally keep their own
 * retry/timeout behaviour (large uploads must not be cut short).
 */
export async function fetchWithDataTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 25_000,
): Promise<Response> {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url

  if (!url.includes('/rest/v1/')) {
    return fetchImpl(input, init)
  }

  const controller = new AbortController()
  const externalSignal = init?.signal ?? (input instanceof Request ? input.signal : undefined)
  const forwardAbort = () => controller.abort(externalSignal?.reason)

  if (externalSignal?.aborted) {
    forwardAbort()
  } else {
    externalSignal?.addEventListener('abort', forwardAbort, { once: true })
  }

  const timer = setTimeout(() => {
    controller.abort(new DOMException('Načítání dat vypršelo. Zkus to znovu.', 'TimeoutError'))
  }, timeoutMs)

  try {
    return await fetchImpl(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
    externalSignal?.removeEventListener('abort', forwardAbort)
  }
}
