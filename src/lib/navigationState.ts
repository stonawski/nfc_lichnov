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

  if (
    !from ||
    !from.startsWith('/') ||
    from.startsWith('//') ||
    from.includes('\\')
  ) {
    return fallback
  }

  try {
    const base = new URL('https://nfc.local')
    const parsed = new URL(from, base)

    if (parsed.origin !== base.origin) return fallback

    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
