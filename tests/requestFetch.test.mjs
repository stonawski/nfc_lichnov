import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchWithDataTimeout } from '../src/lib/requestFetch.ts'

test('non-database requests are not given a deadline', async () => {
  let seenInit
  const original = { method: 'POST' }
  const response = await fetchWithDataTimeout(
    'https://example.supabase.co/functions/v1/media-upload-url',
    original,
    async (_url, init) => {
      seenInit = init
      return new Response('ok')
    },
    1,
  )
  assert.equal(response.status, 200)
  assert.strictEqual(seenInit, original)
})

test('a stalled PostgREST request terminates with a timeout', async () => {
  const stalled = (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true })
  })
  await assert.rejects(
    fetchWithDataTimeout('https://example.supabase.co/rest/v1/teams', undefined, stalled, 5),
    { name: 'TimeoutError' },
  )
})

test('caller cancellation is forwarded instead of waiting for the deadline', async () => {
  const caller = new AbortController()
  const request = fetchWithDataTimeout(
    'https://example.supabase.co/rest/v1/teams',
    { signal: caller.signal },
    (_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true })
    }),
    1000,
  )
  caller.abort(new DOMException('Cancelled', 'AbortError'))
  await assert.rejects(request, { name: 'AbortError' })
})

test('successful requests clear the deadline timer', async () => {
  let signal
  const response = await fetchWithDataTimeout(
    'https://example.supabase.co/rest/v1/teams',
    undefined,
    async (_url, init) => {
      signal = init.signal
      return new Response('ok')
    },
    4,
  )
  assert.equal(await response.text(), 'ok')
  await new Promise((resolve) => setTimeout(resolve, 15))
  assert.equal(signal.aborted, false)
})
