<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { CheckCircle2, CloudOff, Download, RefreshCw, Wifi, WifiOff } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import OfflinePhoneIllustration from '../components/illustrations/OfflinePhoneIllustration.vue'
import {
  appIsInstalled,
  checkOfflineAvailability,
  installPrompt,
  requestAppInstallation,
} from '../utils/pwa'

const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
const isChecking = ref(true)
const isInstalling = ref(false)
const statusError = ref('')
const installMessage = ref('')
const offlineStatus = ref({
  serviceWorkerSupported: false,
  serviceWorkerActive: false,
  contentCached: false,
})

const offlineStatusLabel = computed(() => {
  if (isChecking.value) return 'Checking offline availability…'
  if (offlineStatus.value.contentCached) return 'Static guide content is ready offline'
  if (offlineStatus.value.serviceWorkerActive) return 'Service worker active; cache is still being prepared'
  if (offlineStatus.value.serviceWorkerSupported) return 'Offline content is not ready yet'
  return 'Offline caching is not supported by this browser'
})

async function refreshOfflineStatus() {
  isChecking.value = true
  statusError.value = ''
  try {
    offlineStatus.value = await checkOfflineAvailability()
  } catch (error) {
    statusError.value = 'GreenLoop could not inspect the offline cache. Reload while online and try again.'
    if (import.meta.env.DEV) console.error('Offline availability check failed', error)
  } finally {
    isChecking.value = false
  }
}

async function installApplication() {
  isInstalling.value = true
  installMessage.value = ''
  try {
    const result = await requestAppInstallation()
    installMessage.value =
      result.outcome === 'accepted'
        ? 'Installation accepted. Follow your browser’s instructions to finish.'
        : 'GreenLoop was not installed. You can install it later when your browser offers the option.'
  } finally {
    isInstalling.value = false
  }
}

function updateConnectionStatus() {
  isOnline.value = navigator.onLine
  if (isOnline.value) refreshOfflineStatus()
}

onMounted(() => {
  window.addEventListener('online', updateConnectionStatus)
  window.addEventListener('offline', updateConnectionStatus)
  refreshOfflineStatus()
})

onUnmounted(() => {
  window.removeEventListener('online', updateConnectionStatus)
  window.removeEventListener('offline', updateConnectionStatus)
})
</script>

<template>
  <section class="page-section offline-guide-page">
    <div class="container">
      <div class="row align-items-center g-4">
        <div class="col-12 col-lg-7">
          <p class="text-success fw-semibold text-uppercase mb-2">Guidance when you need it</p>
          <h1>Offline Recycling Guide</h1>
          <p class="lead mb-0">
            Open GreenLoop’s static recycling guidance and check whether this device is prepared for
            offline use.
          </p>
        </div>
        <div class="col-12 col-lg-5 d-flex flex-column flex-sm-row flex-lg-column align-items-sm-center align-items-lg-end gap-3">
          <OfflinePhoneIllustration class="page-intro-illustration offline-intro-illustration" />
          <RouterLink class="btn btn-success btn-lg" to="/recycling-guide">Open Recycling Guide</RouterLink>
        </div>
      </div>

      <section class="status-section mt-5" aria-labelledby="offline-status-heading">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <h2 id="offline-status-heading" class="h3 mb-1">Offline Availability</h2>
            <p class="text-secondary mb-0">Installation, cached content and connectivity are checked separately.</p>
          </div>
          <button
            class="btn btn-outline-success btn-sm"
            type="button"
            :disabled="isChecking"
            @click="refreshOfflineStatus"
          >
            <RefreshCw :size="17" aria-hidden="true" />
            {{ isChecking ? 'Checking…' : 'Check again' }}
          </button>
        </div>

        <div class="row g-3">
          <div class="col-12 col-md-4">
            <article class="status-card card h-100 p-4">
              <Download class="status-icon" :size="25" aria-hidden="true" />
              <h3 class="h5 mt-3">Application installation</h3>
              <p class="text-secondary mb-3">
                {{ appIsInstalled ? 'GreenLoop is running as an installed application.' : installPrompt ? 'This browser is ready to install GreenLoop.' : 'No installation prompt is currently available.' }}
              </p>
              <button
                v-if="installPrompt && !appIsInstalled"
                class="btn btn-success mt-auto align-self-start"
                type="button"
                :disabled="isInstalling"
                @click="installApplication"
              >
                {{ isInstalling ? 'Opening prompt…' : 'Install GreenLoop' }}
              </button>
            </article>
          </div>

          <div class="col-12 col-md-4">
            <article class="status-card card h-100 p-4">
              <CheckCircle2 v-if="offlineStatus.contentCached" class="status-icon" :size="25" aria-hidden="true" />
              <CloudOff v-else class="status-icon" :size="25" aria-hidden="true" />
              <h3 class="h5 mt-3">Cached static content</h3>
              <p class="text-secondary mb-0" role="status" aria-live="polite">
                {{ offlineStatusLabel }}
              </p>
            </article>
          </div>

          <div class="col-12 col-md-4">
            <article class="status-card card h-100 p-4">
              <Wifi v-if="isOnline" class="status-icon" :size="25" aria-hidden="true" />
              <WifiOff v-else class="status-icon" :size="25" aria-hidden="true" />
              <h3 class="h5 mt-3">Internet connection</h3>
              <p class="text-secondary mb-0" role="status" aria-live="polite">
                {{ isOnline ? 'Online — connected features are currently available.' : 'Offline — only previously cached static content may be available.' }}
              </p>
            </article>
          </div>
        </div>

        <p v-if="installMessage" class="alert alert-info mt-3 mb-0" role="status" aria-live="polite">
          {{ installMessage }}
        </p>
        <p v-if="statusError" class="alert alert-warning mt-3 mb-0" role="alert">{{ statusError }}</p>
      </section>

      <div class="row g-4 mt-3">
        <div class="col-12 col-lg-6">
          <article class="card border-0 shadow-sm h-100 p-4">
            <h2 class="h4">Available offline after caching</h2>
            <ul class="mb-0">
              <li>Application shell and navigation</li>
              <li>Static Recycling Guide item descriptions</li>
              <li>Waste Reduction Resources</li>
              <li>Analytics based on bundled demonstration data</li>
              <li>This offline-use explanation</li>
            </ul>
          </article>
        </div>
        <div class="col-12 col-lg-6">
          <article class="card border-0 shadow-sm h-100 p-4">
            <h2 class="h4">Internet connection required</h2>
            <ul class="mb-0">
              <li>Firebase sign-in, role/profile restoration and favourites synchronization</li>
              <li>Firestore ratings and administrator user listing</li>
              <li>Google Sign-In</li>
              <li>SendGrid email sharing through Cloud Functions</li>
              <li>OpenStreetMap tiles, address suggestions and OSRM route planning</li>
            </ul>
          </article>
        </div>
      </div>

      <div class="alert alert-info mt-4 mb-0">
        GreenLoop deliberately does not runtime-cache Firebase, authentication, private Firestore
        data, email responses, ratings, map tiles, geocoding or routing API responses. This avoids
        storing private or rapidly changing data in the service-worker cache.
      </div>
    </div>
  </section>
</template>

<style scoped>
.offline-guide-page .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.status-section {
  padding: clamp(1rem, 3vw, 1.5rem);
  border: 1px solid #dce9e0;
  border-radius: 1rem;
  background: #f4f8f5;
}

.status-card {
  border-color: #dce9e0;
  border-radius: 0.85rem;
}

.status-icon {
  color: #12653e;
}

@media (max-width: 575.98px) {
  .offline-guide-page .btn-lg {
    width: 100%;
  }
}
</style>
