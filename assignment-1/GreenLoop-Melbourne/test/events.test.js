import test from 'node:test'
import assert from 'node:assert/strict'
import { isEventPast } from '../src/utils/events.js'

test('event expiry uses the end of the local event day', () => {
  assert.equal(isEventPast('2026-10-04', new Date('2026-10-18T12:00:00+11:00')), true)
  assert.equal(isEventPast('2026-10-24', new Date('2026-10-18T12:00:00+11:00')), false)
  assert.equal(isEventPast('2026-10-18', new Date('2026-10-18T12:00:00+11:00')), false)
})

test('invalid event dates fail closed', () => {
  assert.equal(isEventPast('not-a-date'), true)
})
