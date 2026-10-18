import test from 'node:test'
import assert from 'node:assert/strict'
import { summarizeUserRoles } from '../src/utils/adminAnalytics.js'

test('admin summary totals Firestore profiles and groups supported roles', () => {
  assert.deepEqual(summarizeUserRoles([
    { uid: '1', role: 'admin' },
    { uid: '2', role: 'user' },
    { uid: '3', role: 'user' },
  ]), { total: 3, admin: 1, user: 2 })
})

test('admin summary safely treats an unexpected role as a standard user', () => {
  assert.deepEqual(summarizeUserRoles([{ uid: '1', role: 'unexpected' }]), { total: 1, admin: 0, user: 1 })
})
