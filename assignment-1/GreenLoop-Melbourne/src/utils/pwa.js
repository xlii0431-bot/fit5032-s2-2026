import { readonly, ref } from 'vue'

const deferredInstallPrompt = ref(null)
const isInstalled = ref(false)
const OFFLINE_GUIDE_SAVED_AT_KEY = 'greenloop-offline-guide-saved-at'

function updateInstalledState() {
  isInstalled.value =
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    window.navigator.standalone === true
}

if (typeof window !== 'undefined') {
  updateInstalledState()
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredInstallPrompt.value = event
  })
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt.value = null
    isInstalled.value = true
  })
}

export const installPrompt = readonly(deferredInstallPrompt)
export const appIsInstalled = readonly(isInstalled)

export async function requestAppInstallation() {
  const promptEvent = deferredInstallPrompt.value
  if (!promptEvent) return { outcome: 'unavailable' }

  await promptEvent.prompt()
  const choice = await promptEvent.userChoice
  deferredInstallPrompt.value = null
  return choice
}

export function hasRequiredOfflineAssets(cachedPaths) {
  return cachedPaths.includes('/index.html')
    && cachedPaths.some((path) => path.endsWith('.js'))
    && cachedPaths.some((path) => path.endsWith('.css'))
}

export function getOfflineGuideSavedAt(storage = localStorage) {
  const value = storage.getItem(OFFLINE_GUIDE_SAVED_AT_KEY)
  return value && !Number.isNaN(Date.parse(value)) ? value : null
}

async function inspectPrecache() {
  if (!('caches' in window)) return false
  const cacheNames = (await window.caches.keys()).filter((name) => name.includes('workbox-precache'))
  const cachedRequests = (await Promise.all(cacheNames.map(async (cacheName) => {
    const cache = await window.caches.open(cacheName)
    return cache.keys()
  }))).flat()
  return hasRequiredOfflineAssets(cachedRequests.map(({ url }) => new URL(url).pathname))
}

export async function checkOfflineAvailability() {
  const productionMode = import.meta.env.PROD
  if (!productionMode) {
    return { productionMode, serviceWorkerSupported: 'serviceWorker' in navigator, serviceWorkerActive: false, contentCached: false, savedAt: null }
  }
  if (!('serviceWorker' in navigator)) {
    return { productionMode, serviceWorkerSupported: false, serviceWorkerActive: false, contentCached: false, savedAt: null }
  }

  const registration = await navigator.serviceWorker.getRegistration()
  const serviceWorkerActive = Boolean(registration?.active)
  if (!serviceWorkerActive || !('caches' in window)) {
    return { productionMode, serviceWorkerSupported: true, serviceWorkerActive, contentCached: false, savedAt: null }
  }

  const contentCached = await inspectPrecache()
  return {
    productionMode,
    serviceWorkerSupported: true,
    serviceWorkerActive,
    contentCached,
    savedAt: contentCached ? getOfflineGuideSavedAt() : null,
  }
}

export async function prepareOfflineContent() {
  if (!navigator.onLine) throw new Error('offline')
  if (!import.meta.env.PROD) throw new Error('development-mode')
  if (!('serviceWorker' in navigator) || !('caches' in window)) throw new Error('unsupported')

  let registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
  }
  await registration.update()
  await Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_, reject) => setTimeout(() => reject(new Error('service-worker-timeout')), 15000)),
  ])
  const status = await checkOfflineAvailability()
  if (!status.contentCached) throw new Error('cache-incomplete')
  const savedAt = new Date().toISOString()
  localStorage.setItem(OFFLINE_GUIDE_SAVED_AT_KEY, savedAt)
  return { ...status, savedAt }
}
