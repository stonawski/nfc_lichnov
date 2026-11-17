import test from 'node:test'
import assert from 'node:assert/strict'
import { collectAllPages } from '../src/lib/collectPages.ts'

test('small albums are fetched with a single request', async () => {
  const calls = []
  const rows = [1, 2, 3]
  const result = await collectAllPages(async (start, end) => {
    calls.push([start, end])
    return rows.slice(start, end + 1)
  }, 5)
  assert.deepEqual(result, rows)
  assert.deepEqual(calls, [[0, 4]])
})

test('large galleries are fetched past the default database response cap', async () => {
  const rows = Array.from({ length: 1203 }, (_, i) => i + 1)
  const calls = []
  const result = await collectAllPages(async (start, end) => {
    calls.push([start, end])
    return rows.slice(start, end + 1)
  }, 500)
  assert.equal(result.length, 1203)
  assert.equal(result[1202], 1203)
  assert.deepEqual(calls, [[0, 499], [500, 999], [1000, 1499]])
})

test('a full final page triggers one final empty range check', async () => {
  const calls = []
  const result = await collectAllPages(async (start, end) => {
    calls.push(start)
    return Array.from({ length: 10 }, (_, i) => i).slice(start, end + 1)
  }, 5)
  assert.equal(result.length, 10)
  assert.deepEqual(calls, [0, 5, 10])
})

test('database failures propagate without silently returning partial albums', async () => {
  await assert.rejects(
    collectAllPages(async (start) => {
      if (start === 0) return [1, 2]
      throw new Error('Network failure')
    }, 2),
    /Network failure/,
  )
})
