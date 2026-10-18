import test from 'node:test'
import assert from 'node:assert/strict'
import { observeCommunityRatingAnalytics } from '../src/utils/communityAnalytics.js'

test('community analytics publishes privacy-safe realtime summaries and unsubscribes', () => {
  const callbacks = new Map()
  let unsubscribeCount = 0
  const updates = []
  const observe = (id, userId, onChange) => {
    assert.equal(userId, null)
    callbacks.set(id, onChange)
    return () => { unsubscribeCount += 1 }
  }
  const stop = observeCommunityRatingAnalytics(
    [{ id: 'a', name: 'Alpha', suburb: 'Melbourne' }, { id: 'b', name: 'Beta', suburb: 'Clayton' }],
    observe,
    (value) => updates.push(value),
    assert.fail,
  )
  callbacks.get('a')({ average: 4.5, count: 2, userRating: 0 })
  assert.deepEqual(updates.at(-1)[0], { id: 'a', name: 'Alpha', suburb: 'Melbourne', average: 4.5, count: 2 })
  assert.equal('userRating' in updates.at(-1)[0], false)
  stop()
  assert.equal(unsubscribeCount, 2)
})
