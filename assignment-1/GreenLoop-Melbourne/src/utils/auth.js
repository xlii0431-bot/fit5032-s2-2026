import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase'

// Remove credentials created by the previous client-side authentication prototype.
localStorage.removeItem('greenloop_users')
localStorage.removeItem('greenloop_current_user')

function normaliseUser(user) {
  if (!user) return null

  return {
    uid: user.uid,
    username: user.displayName || user.email,
    email: user.email,
  }
}

export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
  return normaliseUser(credential.user)
}

export async function registerUser(username, email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
  await updateProfile(credential.user, { displayName: username.trim() })

  // Firebase signs users in after registration; this app keeps its existing login-page flow.
  await signOut(auth)
  return normaliseUser(credential.user)
}

export function getCurrentUser() {
  return normaliseUser(auth.currentUser)
}

export function observeAuthState(callback) {
  return onAuthStateChanged(auth, (user) => callback(normaliseUser(user)))
}

export function logoutUser() {
  return signOut(auth)
}

export function isAuthenticated() {
  return Boolean(auth.currentUser)
}
