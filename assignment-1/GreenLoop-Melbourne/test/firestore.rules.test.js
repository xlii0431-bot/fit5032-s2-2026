import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test, { after, before } from 'node:test'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  deleteDoc,
  doc,
  collection,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

const projectId = 'greenloop-favourites-rules-test'
let testEnvironment

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8'),
    },
  })
})

after(async () => {
  await testEnvironment?.cleanup()
})

test('an authenticated owner can create, read and delete a favourite', async () => {
  const ownerDatabase = testEnvironment.authenticatedContext('owner-user').firestore()
  const favouriteReference = doc(ownerDatabase, 'users/owner-user/favourites/1')

  await assertSucceeds(
    setDoc(favouriteReference, {
      itemId: 1,
      createdAt: serverTimestamp(),
    }),
  )
  const favouriteSnapshot = await assertSucceeds(getDoc(favouriteReference))
  assert.equal(favouriteSnapshot.data().itemId, 1)
  const favouriteList = await assertSucceeds(
    getDocs(collection(ownerDatabase, 'users/owner-user/favourites')),
  )
  assert.equal(favouriteList.size, 1)
  await assertSucceeds(deleteDoc(favouriteReference))
})

test('an unauthenticated visitor cannot read or create favourites', async () => {
  const visitorDatabase = testEnvironment.unauthenticatedContext().firestore()
  const favouriteReference = doc(visitorDatabase, 'users/owner-user/favourites/1')

  await assertFails(getDoc(favouriteReference))
  await assertFails(setDoc(favouriteReference, { itemId: 1, createdAt: serverTimestamp() }))
})

test('an authenticated user cannot access another user favourites', async () => {
  const ownerDatabase = testEnvironment.authenticatedContext('owner-user').firestore()
  const otherDatabase = testEnvironment.authenticatedContext('other-user').firestore()
  const ownerFavourite = doc(ownerDatabase, 'users/owner-user/favourites/2')
  const crossUserFavourite = doc(otherDatabase, 'users/owner-user/favourites/2')

  await assertSucceeds(setDoc(ownerFavourite, { itemId: 2, createdAt: serverTimestamp() }))
  await assertFails(getDoc(crossUserFavourite))
  await assertFails(getDocs(collection(otherDatabase, 'users/owner-user/favourites')))
  await assertFails(setDoc(crossUserFavourite, { itemId: 2, createdAt: serverTimestamp() }))
  await assertFails(deleteDoc(crossUserFavourite))
})

test('favourites reject invalid fields while allowing an idempotent save', async () => {
  const ownerDatabase = testEnvironment.authenticatedContext('owner-user').firestore()

  await assertFails(
    setDoc(doc(ownerDatabase, 'users/owner-user/favourites/not-a-number'), {
      itemId: 1,
      createdAt: serverTimestamp(),
    }),
  )
  await assertFails(
    setDoc(doc(ownerDatabase, 'users/owner-user/favourites/3'), {
      itemId: 3,
      createdAt: serverTimestamp(),
      role: 'admin',
    }),
  )

  const favouriteReference = doc(ownerDatabase, 'users/owner-user/favourites/4')
  await assertSucceeds(setDoc(favouriteReference, { itemId: 4, createdAt: serverTimestamp() }))
  await assertFails(updateDoc(favouriteReference, { itemId: 5 }))
  await assertSucceeds(
    setDoc(favouriteReference, { itemId: 4, createdAt: serverTimestamp() }),
  )
})

test('existing profile and rating protections remain active', async () => {
  const userDatabase = testEnvironment.authenticatedContext('profile-user', {
    email: 'profile@example.com',
  }).firestore()
  const otherDatabase = testEnvironment.authenticatedContext('other-user', {
    email: 'other@example.com',
  }).firestore()

  await assertSucceeds(
    setDoc(doc(userDatabase, 'users/profile-user'), {
      username: 'Profile User',
      email: 'profile@example.com',
      role: 'user',
      createdAt: serverTimestamp(),
    }),
  )
  await assertFails(getDoc(doc(otherDatabase, 'users/profile-user')))
  await assertFails(updateDoc(doc(userDatabase, 'users/profile-user'), { role: 'admin' }))

  await assertSucceeds(
    setDoc(doc(userDatabase, 'locations/location-one/ratings/profile-user'), {
      rating: 5,
      userId: 'profile-user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
  await assertFails(
    setDoc(doc(otherDatabase, 'locations/location-one/ratings/profile-user'), {
      rating: 1,
      userId: 'other-user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
})
