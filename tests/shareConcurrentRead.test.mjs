import test from 'node:test'
import assert from 'node:assert/strict'
import { createConcurrentReadDeduper } from '../src/lib/shareConcurrentRead.ts'

test('simultaneous reads for the same key share one request', async () => {
  const share = createConcurrentReadDeduper()
  let calls = 0
  const get = () => share('teams', async () => {
    calls++
    await new Promise((resolve) => setTimeout(resolve, 4))
    return { version: 1 }
  })
  const [a, b, c] = await Promise.all([get(), get(), get()])
  assert.equal(calls, 1)
  assert.strictEqual(a, b)
  assert.strictEqual(a, c)
})

test('read results are not cached after completion', async () => {
  const share = createConcurrentReadDeduper()
  let id = 0
  assert.equal(await share('seasons', async () => ++id), 1)
  assert.equal(await share('seasons', async () => ++id), 2)
})

test('failed reads are released so a manual retry can succeed', async () => {
  const share = createConcurrentReadDeduper()
  let calls = 0
  const load = () => share('teams', async () => {
    calls++
    if (calls === 1) throw new Error('Offline')
    return 'ok'
  })
  await assert.rejects(load(), /Offline/)
  assert.equal(await load(), 'ok')
  assert.equal(calls, 2)
})

test('different keys may be fetched concurrently', async () => {
  const share = createConcurrentReadDeduper()
  let calls = 0
  const [a, b] = await Promise.all([
    share('teams', async () => ++calls),
    share('seasons', async () => ++calls),
  ])
  assert.equal(calls, 2)
  assert.deepEqual(new Set([a, b]), new Set([1, 2]))
})
