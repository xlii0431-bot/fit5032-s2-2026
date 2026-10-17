<script setup>
import { nextTick, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import AppNavbar from './components/AppNavbar.vue'
import GreenLoopGuide from './components/GreenLoopGuide.vue'
import NetworkStatus from './components/NetworkStatus.vue'

const route = useRoute()
const mainContent = ref(null)
let isInitialRoute = true

watch(
  () => route.fullPath,
  async () => {
    if (isInitialRoute) {
      isInitialRoute = false
      return
    }
    await nextTick()
    mainContent.value?.focus()
  },
)
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <AppNavbar />
    <NetworkStatus />
    <main id="main-content" ref="mainContent" tabindex="-1">
      <RouterView />
    </main>
    <GreenLoopGuide />
    <AppFooter />
  </div>
</template>
