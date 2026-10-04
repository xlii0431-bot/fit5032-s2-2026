<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { login } from '../auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')

function handleLogin() {
  errorMessage.value = ''

  if (login(username.value, password.value)) {
    router.push('/about')
    return
  }

  errorMessage.value = 'Incorrect username or password. Please try again.'
}
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <h1 class="mb-4">Member Login</h1>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-control"
              autocomplete="username"
              required
            />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
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

          <button type="submit" class="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  </div>
</template>
