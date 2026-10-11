<script setup>
import { onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { logoutUser, observeAuthState } from '../utils/auth'

const router = useRouter()
const currentUser = ref(null)
const authIsReady = ref(false)
const stopObservingAuth = observeAuthState((user) => {
  currentUser.value = user
  authIsReady.value = true
})

async function handleLogout() {
  await logoutUser()
  await router.push({ name: 'login' })
}

onUnmounted(stopObservingAuth)
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-success" aria-label="Main navigation">
    <div class="container">
      <RouterLink class="navbar-brand fw-semibold" to="/">
        GreenLoop Melbourne
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavigation"
        aria-controls="mainNavigation"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="mainNavigation" class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto mb-2 mb-md-0">
          <li class="nav-item"><RouterLink class="nav-link" to="/">Home</RouterLink></li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/recycling-guide">Recycling Guide</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/resources">Resources</RouterLink>
          </li>
          <li class="nav-item"><RouterLink class="nav-link" to="/events">Events</RouterLink></li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/interactive-data">Interactive Data</RouterLink>
          </li>
          <li class="nav-item"><RouterLink class="nav-link" to="/about">About</RouterLink></li>
          <li v-if="authIsReady && !currentUser" class="nav-item">
            <RouterLink class="nav-link" to="/login">Login</RouterLink>
          </li>
          <template v-else-if="currentUser">
            <li v-if="currentUser.role === 'admin'" class="nav-item">
              <RouterLink class="nav-link" to="/admin">Admin Dashboard</RouterLink>
            </li>
            <li class="nav-item">
              <span class="nav-link text-white">
                {{ currentUser.username }}
                <span class="badge text-bg-light text-success ms-1">
                  {{ currentUser.role === 'admin' ? 'Admin' : 'User' }}
                </span>
              </span>
            </li>
            <li class="nav-item">
              <button class="nav-link btn btn-link" type="button" @click="handleLogout">
                Logout
              </button>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
