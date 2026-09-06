import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../firebase'

let authInitializationPromise

function normaliseAuthUser(user) {
  if (!user) return null

  return {
    uid: user.uid,
    username: user.displayName || user.email,
    email: user.email,
  }
}

function normaliseRole(role) {
  return role === 'admin' ? 'admin' : 'user'
}

function waitForAuthInitialization() {
  if (!authInitializationPromise) {
    authInitializationPromise = new Promise((resolve, reject) => {
      const stopObserving = onAuthStateChanged(
        auth,
        () => {
          stopObserving()
          resolve()
        },
        reject,
      )
    })
  }

  return authInitializationPromise
}

async function ensureUserProfile(user, username = '') {
  const profileReference = doc(db, 'users', user.uid)
  const validatedUsername = username.trim()

  return runTransaction(db, async (transaction) => {
    const profileSnapshot = await transaction.get(profileReference)

    if (profileSnapshot.exists()) {
      const existingProfile = profileSnapshot.data()

      if (validatedUsername && existingProfile.username !== validatedUsername) {
        transaction.update(profileReference, { username: validatedUsername })
      }

      return {
        uid: user.uid,
        ...existingProfile,
        username: validatedUsername || existingProfile.username,
        role: normaliseRole(existingProfile.role),
      }
    }

    const newProfile = {
      username: validatedUsername || user.displayName || user.email,
      email: user.email,
      role: 'user',
      createdAt: serverTimestamp(),
    }

    transaction.set(profileReference, newProfile)
    return { uid: user.uid, ...newProfile }
  })
}

export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
  const profile = await ensureUserProfile(credential.user)
  return { ...normaliseAuthUser(credential.user), ...profile, role: normaliseRole(profile.role) }
}

export async function registerUser(username, email, password) {
  let credential = null
  let registrationStage = 'createUserWithEmailAndPassword'

  try {
    credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
    registrationStage = 'updateProfile'
    await updateProfile(credential.user, { displayName: username.trim() })
    registrationStage = 'ensureUserProfile'
    await ensureUserProfile(credential.user, username)
  } catch (error) {
    if (credential) await signOut(auth)
    error.registrationStage = registrationStage
    throw error
  }

  await signOut(auth)
  return normaliseAuthUser(credential.user)
}

export async function getCurrentUser() {
  await waitForAuthInitialization()
  return normaliseAuthUser(auth.currentUser)
}

export async function getUserProfile(uid) {
  const profileSnapshot = await getDoc(doc(db, 'users', uid))
  if (!profileSnapshot.exists()) return null

  const profile = profileSnapshot.data()
  return { uid: profileSnapshot.id, ...profile, role: normaliseRole(profile.role) }
}

export async function getCurrentUserProfile() {
  await waitForAuthInitialization()
  if (!auth.currentUser) return null

  return ensureUserProfile(auth.currentUser)
}

export async function isAuthenticated() {
  return Boolean(await getCurrentUser())
}

export async function isAdmin() {
  const profile = await getCurrentUserProfile()
  return profile?.role === 'admin'
}

export function observeAuthState(callback) {
  let stopObservingProfile = null

  const stopObservingAuth = onAuthStateChanged(auth, async (user) => {
    if (stopObservingProfile) {
      stopObservingProfile()
      stopObservingProfile = null
    }

    if (!user) {
      callback(null)
      return
    }

    try {
      await ensureUserProfile(user)
      stopObservingProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (profileSnapshot) => {
          const profile = profileSnapshot.data() || {}
          callback({
            ...normaliseAuthUser(user),
            ...profile,
            role: normaliseRole(profile.role),
          })
        },
        () => callback({ ...normaliseAuthUser(user), role: 'user' }),
      )
    } catch {
      callback({ ...normaliseAuthUser(user), role: 'user' })
    }
  })

  return () => {
    stopObservingAuth()
    if (stopObservingProfile) stopObservingProfile()
  }
}

export function logoutUser() {
  return signOut(auth)
}

export async function getAllUserProfiles() {
  const profileSnapshots = await getDocs(collection(db, 'users'))
  return profileSnapshots.docs
    .map((profileDocument) => ({
      uid: profileDocument.id,
      ...profileDocument.data(),
      role: normaliseRole(profileDocument.data().role),
    }))
    .sort((first, second) =>
      (first.username || first.email || '').localeCompare(second.username || second.email || ''),
    )
}
