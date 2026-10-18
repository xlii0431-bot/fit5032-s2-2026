<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { CheckCircle2, CloudOff, Download, RefreshCw, WifiOff } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import OfflinePhoneIllustration from '../components/illustrations/OfflinePhoneIllustration.vue'
import { checkOfflineAvailability, prepareOfflineContent } from '../utils/pwa'

const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
const isChecking = ref(true)
const isSaving = ref(false)
const message = ref('')
const messageKind = ref('status')
const offlineStatus = ref({ productionMode: import.meta.env.PROD, serviceWorkerSupported: false, serviceWorkerActive: false, contentCached: false, savedAt: null })
const canSave = computed(() => isOnline.value && offlineStatus.value.productionMode && offlineStatus.value.serviceWorkerSupported)
const savedAtLabel = computed(() => offlineStatus.value.savedAt
  ? new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(offlineStatus.value.savedAt))
  : '')
const statusHeading = computed(() => {
  if (isSaving.value) return 'Saving…'
  if (isChecking.value) return 'Checking saved guide…'
  if (offlineStatus.value.contentCached) return 'Ready to use offline'
  if (!isOnline.value) return 'Internet connection needed to save the guide'
  if (!offlineStatus.value.productionMode || !offlineStatus.value.serviceWorkerSupported) return 'Offline saving is unavailable in this browser'
  return 'Not saved yet'
})

async function refreshStatus() {
  isChecking.value = true
  try { offlineStatus.value = await checkOfflineAvailability() }
  catch { messageKind.value = 'error'; message.value = 'GreenLoop could not check the saved guide. Please try again.' }
  finally { isChecking.value = false }
}

async function saveGuide() {
  if (!isOnline.value) { messageKind.value = 'error'; message.value = 'Internet connection needed to save the guide.'; return }
  const previouslyReady = offlineStatus.value.contentCached
  isSaving.value = true
  message.value = ''
  try {
    offlineStatus.value = await prepareOfflineContent()
    messageKind.value = 'status'
    message.value = ''
  } catch (error) {
    messageKind.value = 'error'
    message.value = previouslyReady
      ? 'Update failed — your previously saved guide is still available.'
      : error?.message === 'offline' ? 'Internet connection needed to save the guide.' : 'The guide could not be saved. Please stay online and try again.'
  } finally { isSaving.value = false }
}

function updateConnectionStatus() { isOnline.value = navigator.onLine; if (isOnline.value) refreshStatus() }
onMounted(() => {
  window.addEventListener('online', updateConnectionStatus)
  window.addEventListener('offline', updateConnectionStatus)
  refreshStatus()
  if (import.meta.env.PROD && 'serviceWorker' in navigator) navigator.serviceWorker.ready.then(() => refreshStatus()).catch(() => {})
})
onUnmounted(() => { window.removeEventListener('online', updateConnectionStatus); window.removeEventListener('offline', updateConnectionStatus) })
</script>

<template>
  <section class="page-section offline-guide-page" aria-labelledby="offline-guide-heading">
    <div class="container"><div class="row justify-content-center"><div class="col-12 col-xl-9">
      <header class="offline-page-header d-flex align-items-center justify-content-between gap-4 mb-4">
        <div>
          <p class="text-success fw-semibold text-uppercase mb-2">Guidance wherever you are</p>
          <h1 id="offline-guide-heading" class="mb-2">Your Offline Recycling Guide</h1>
          <p class="lead mb-0">Save recycling tips to use anytime, even without internet.</p>
        </div>
        <OfflinePhoneIllustration class="page-intro-illustration offline-header-illustration flex-shrink-0" />
      </header>

      <div class="row justify-content-center">
        <div class="col-12 col-lg-10 col-xl-9">
      <article class="offline-guide-card card border-0 shadow-sm p-4 p-md-5">
        <div class="d-flex align-items-start gap-3">
          <CheckCircle2 v-if="offlineStatus.contentCached" class="status-icon flex-shrink-0" :size="30" aria-hidden="true" />
          <WifiOff v-else-if="!isOnline" class="status-icon flex-shrink-0" :size="30" aria-hidden="true" />
          <CloudOff v-else class="status-icon flex-shrink-0" :size="30" aria-hidden="true" />
          <div>
            <h2 class="h3 mb-1" role="status" aria-live="polite">{{ statusHeading }}</h2>
            <p v-if="offlineStatus.contentCached && savedAtLabel" class="text-secondary mb-0">Last saved {{ savedAtLabel }}</p>
            <p v-else-if="!offlineStatus.contentCached" class="text-secondary mb-0">Save the bundled guide once while online, then open it whenever you need it.</p>
          </div>
        </div>
        <div class="d-flex flex-column flex-sm-row gap-2 mt-4">
          <RouterLink v-if="offlineStatus.contentCached" class="btn btn-success btn-lg" to="/offline-recycling-guide">Open recycling guide</RouterLink>
          <button :class="['btn btn-lg', offlineStatus.contentCached ? 'btn-outline-success' : 'btn-success']" type="button" :disabled="!canSave || isSaving || isChecking" :aria-busy="isSaving" @click="saveGuide">
            <RefreshCw v-if="offlineStatus.contentCached" :size="18" aria-hidden="true" /><Download v-else :size="18" aria-hidden="true" />
            {{ isSaving ? 'Saving…' : offlineStatus.contentCached ? 'Update saved guide' : 'Save for offline use' }}
          </button>
          <RouterLink v-if="!offlineStatus.contentCached" class="btn btn-outline-success btn-lg" to="/offline-recycling-guide">Open recycling guide</RouterLink>
        </div>
        <p v-if="message" :class="['alert mt-3 mb-0', messageKind === 'error' ? 'alert-warning' : 'alert-success']" :role="messageKind === 'error' ? 'alert' : 'status'" aria-live="polite">{{ message }}</p>
      </article>
        </div>
      </div>

      <section class="included-section mt-4" aria-labelledby="included-heading">
        <h2 id="included-heading" class="h4 text-center mb-3">What’s included</h2>
        <div class="row g-3">
          <div v-for="item in [
            ['Common household items', 'Guidance for the items included in GreenLoop’s bundled recycling dataset.'],
            ['Disposal instructions', 'Simple steps explaining how each included item should be handled.'],
            ['Educational descriptions', 'Background information that helps explain why correct disposal matters.'],
          ]" :key="item[0]" class="col-12 col-md-4">
            <article class="included-card card h-100 p-3"><h3 class="h6">{{ item[0] }}</h3><p class="small text-secondary mb-0">{{ item[1] }}</p></article>
          </div>
        </div>
      </section>
      <p class="text-secondary text-center mt-3 mb-0">Live ratings, favourites, maps, routes and email sharing still need an internet connection.</p>
    </div></div></div>
  </section>
</template>

<style scoped>
.offline-guide-card { border-radius: var(--gl-card-radius); }
.offline-guide-page { padding-top: clamp(1.5rem, 4vw, 3rem); }
.offline-page-header { min-height: 9rem; }
.offline-header-illustration { width: min(22vw, 11rem); height: auto; }
.included-card { border-color: var(--gl-border); border-radius: var(--gl-card-radius); }
.offline-guide-page .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; }
.status-icon { color: var(--gl-primary); }
@media (max-width: 767.98px) { .offline-header-illustration { width: 7rem; } }
@media (max-width: 575.98px) {
  .offline-guide-page .btn { width: 100%; }
  .offline-page-header { min-height: 0; }
  .offline-header-illustration { display: none; }
}
</style>
