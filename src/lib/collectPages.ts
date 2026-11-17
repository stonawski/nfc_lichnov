/**
 * Supabase/PostgREST returns only a capped page of rows by default.
 * Pagination must keep deterministic ordering in the supplied query and stop
 * at the first short page. A safety limit prevents an endless loop if a proxy
 * starts returning the same full page for every range request.
 */
export async function collectAllPages<T>(
  fetchPage: (start: number, end: number) => Promise<T[]>,
  pageSize = 500,
  maxPages = 100,
): Promise<T[]> {
  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new Error('Invalid page size')
  }

  const result: T[] = []
  for (let pageNumber = 0; pageNumber < maxPages; pageNumber++) {
    const start = pageNumber * pageSize
    const page = await fetchPage(start, start + pageSize - 1)
    result.push(...page)
    if (page.length < pageSize) return result
    if (page.length > pageSize) throw new Error('Invalid paged database response')
  }

  throw new Error('Galerie je příliš rozsáhlá pro jednorázové načtení.')
}
