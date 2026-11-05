import test from 'node:test'
import assert from 'node:assert/strict'
import { withDeadline } from '../src/lib/withDeadline.ts'

test('resolves successful auth requests normally', async () => {
  assert.deepEqual(await withDeadline(Promise.resolve({ ok: true }), 100), { ok: true })
})

test('rejects hung requests and returns a retryable error', async () => {
  await assert.rejects(withDeadline(new Promise(() => {}), 6), /příliš dlouho/)
})

test('propagates network failures without replacing error text', async () => {
  await assert.rejects(withDeadline(Promise.reject(new Error('Network')), 100), /Network/)
})

test('rejects invalid deadline', async () => {
  await assert.rejects(withDeadline(Promise.resolve('ok'), 0), /positive/)
})
