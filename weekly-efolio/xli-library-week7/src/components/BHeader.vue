<script setup>
import { useRouter } from 'vue-router'

import { isAuthenticated, logout } from '../auth'

const router = useRouter()

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
    <div class="container">
      <header class="d-flex justify-content-center py-3">
        <ul class="nav nav-pills">
  
          <li class="nav-item">
            <router-link to="/" class="nav-link" exact-active-class="active">
              Home (Week 7)
            </router-link>
          </li>
  
          <li class="nav-item">
            <router-link to="/about" class="nav-link" exact-active-class="active">
              About
            </router-link>
          </li>

          <li v-if="!isAuthenticated" class="nav-item">
            <router-link to="/login" class="nav-link" exact-active-class="active">
              Login
            </router-link>
          </li>

          <li v-else class="nav-item">
            <button type="button" class="nav-link" @click="handleLogout">
              Logout
            </button>
          </li>

          <li class="nav-item">
            <router-link to="/firesignin" class="nav-link" exact-active-class="active">
              Firebase Sign In
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/fireregister" class="nav-link" exact-active-class="active">
              Firebase Register
            </router-link>
          </li>
  
          <li class="nav-item">
            <a href="#" class="nav-link">
              Contact us
            </a>
          </li>
  
        </ul>
      </header>
    </div>
  </template>
