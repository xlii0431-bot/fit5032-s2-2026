<script setup>
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'

const email = ref('')
const password = ref('')
const currentRole = ref('')
const errorMessage = ref('')
const logoutMessage = ref('')

const ADMIN_EMAIL = 'admin@example.com'

function getRole(userEmail) {
  return userEmail.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user'
}

async function handleSignIn() {
  errorMessage.value = ''
  logoutMessage.value = ''

  try {
    const auth = getAuth()
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)

    currentRole.value = getRole(userCredential.user.email ?? '')
    console.log('Current user:', userCredential.user)
    console.log('Current role:', currentRole.value)
  } catch (error) {
    console.error('Firebase error code:', error.code)
    errorMessage.value = 'Unable to sign in. Please check your email and password.'
  }
}

async function handleLogout() {
  errorMessage.value = ''
  logoutMessage.value = ''

  try {
    const auth = getAuth()
    await signOut(auth)

    currentRole.value = ''
    password.value = ''
    logoutMessage.value = 'Logged out successfully. Current user: null'
    console.log('Current user after logout:', auth.currentUser)
  } catch (error) {
    console.error('Firebase logout error code:', error.code)
    errorMessage.value = 'Unable to log out. Please try again.'
  }
}
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <h1 class="mb-4">Firebase Sign In</h1>

        <p class="text-muted">
          For this role demonstration, <strong>{{ ADMIN_EMAIL }}</strong> is the admin account.
          All other registered Firebase accounts use the user role.
        </p>

        <form @submit.prevent="handleSignIn">
          <div class="mb-3">
            <label for="firebase-email" class="form-label">Email</label>
            <input
              id="firebase-email"
              v-model="email"
              type="email"
              class="form-control"
              autocomplete="email"
              required
            />
          </div>

          <div class="mb-3">
            <label for="firebase-password" class="form-label">Password</label>
            <input
              id="firebase-password"
              v-model="password"
              type="password"
              class="form-control"
              autocomplete="current-password"
              required
            />
          </div>

          <p v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </p>

          <div v-if="currentRole" class="alert alert-success" role="status">
            <strong>Signed in as: {{ currentRole }}</strong>
            <div>Email: {{ email }}</div>
          </div>

          <p v-if="logoutMessage" class="alert alert-info" role="status">
            {{ logoutMessage }}
          </p>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary">Sign In</button>
            <button
              v-if="currentRole"
              type="button"
              class="btn btn-outline-danger"
              @click="handleLogout"
            >
              Log Out
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
