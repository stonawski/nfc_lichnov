export type ReturnNavigationState = {
  from?: string
}

export function locationPath(pathname: string, search = '') {
  return `${pathname}${search}`
}

export function safeReturnPath(
  state: unknown,
  fallback: string,
): string {
  if (!state || typeof state !== 'object') return fallback

  const from = (state as ReturnNavigationState).from
  return typeof from === 'string' && from.startsWith('/') ? from : fallback
}
