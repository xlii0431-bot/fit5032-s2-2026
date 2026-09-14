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
              Home (Week 8)
            </router-link>
          </li>
  
          <li class="nav-item">
            <router-link to="/about" class="nav-link" exact-active-class="active">
              About
            </router-link>
          </li>


          <li class="nav-item">
            <router-link to="/addbook" class="nav-link" exact-active-class="active">
              Add Book
            </router-link>
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
