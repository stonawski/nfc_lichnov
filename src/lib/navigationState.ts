export function locationPath(pathname: string, search = '') {
  return `${pathname}${search}`
}

export function withReturnPath(target: string, from: string) {
  const separator = target.includes('?') ? '&' : '?'
  return `${target}${separator}from=${encodeURIComponent(from)}`
}

export function safeReturnPath(
  searchParams: URLSearchParams,
  fallback: string,
): string {
  const from = searchParams.get('from')
  return from && from.startsWith('/') ? from : fallback
}
