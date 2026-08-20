<script setup>
import { RouterView } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import AppNavbar from './components/AppNavbar.vue'
</script>

<template>
  <div class="app-shell">
    <AppNavbar />
    <main>
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
