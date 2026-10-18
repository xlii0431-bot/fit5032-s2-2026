import test from 'node:test'
import assert from 'node:assert/strict'
import { getOfflineGuideSavedAt, hasRequiredOfflineAssets } from '../src/utils/pwa.js'

test('offline readiness requires the HTML shell plus JavaScript and CSS bundles', () => {
  assert.equal(hasRequiredOfflineAssets(['/index.html', '/assets/app.js', '/assets/app.css']), true)
  assert.equal(hasRequiredOfflineAssets(['/index.html', '/assets/app.js']), false)
  assert.equal(hasRequiredOfflineAssets(['/assets/app.js', '/assets/app.css']), false)
})

test('offline saved time is restored only when it is a valid timestamp', () => {
  assert.equal(getOfflineGuideSavedAt({ getItem: () => '2026-10-18T02:00:00.000Z' }), '2026-10-18T02:00:00.000Z')
  assert.equal(getOfflineGuideSavedAt({ getItem: () => 'invalid' }), null)
  assert.equal(getOfflineGuideSavedAt({ getItem: () => null }), null)
})
