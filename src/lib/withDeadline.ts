/**
 * Bounds auth/edge request waiting time so CMS controls cannot remain stuck.
 * This does not abort the Supabase SDK request; late results are ignored by
 * this promise. Do not use for large R2 PUT uploads.
 */
export async function withDeadline<T>(request: PromiseLike<T>, timeoutMs: number): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('Timeout must be positive')
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      Promise.resolve(request),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error('Požadavek trvá příliš dlouho. Zkontroluj připojení a zkus to znovu.')),
          timeoutMs,
        )
      }),
    ])
  } finally {
    if (timer != null) clearTimeout(timer)
  }
}
