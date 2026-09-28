<script setup>
import { ref } from 'vue'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'

const email = ref('')
const password = ref('')
const successMessage = ref('')
const errorMessage = ref('')

async function handleRegister() {
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const auth = getAuth()
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)

    console.log('Registered user:', userCredential.user)
    successMessage.value = 'Registration successful.'
  } catch (error) {
    console.error('Firebase error code:', error.code)
    errorMessage.value = 'Unable to register. Please check your details and try again.'
  }
}
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <h1 class="mb-4">Firebase Register</h1>

        <form @submit.prevent="handleRegister">
          <div class="mb-3">
            <label for="firebase-register-email" class="form-label">Email</label>
            <input
              id="firebase-register-email"
              v-model="email"
              type="email"
              class="form-control"
              autocomplete="email"
              required
            />
          </div>

          <div class="mb-3">
            <label for="firebase-register-password" class="form-label">Password</label>
            <input
              id="firebase-register-password"
              v-model="password"
              type="password"
              class="form-control"
              autocomplete="new-password"
              required
            />
          </div>

          <p v-if="successMessage" class="alert alert-success" role="status">
            {{ successMessage }}
          </p>

          <p v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </p>

          <button type="submit" class="btn btn-primary">Register</button>
        </form>
      </div>
    </div>
  </div>
</template>
