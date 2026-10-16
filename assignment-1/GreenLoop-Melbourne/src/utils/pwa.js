import { readonly, ref } from 'vue'

const deferredInstallPrompt = ref(null)
const isInstalled = ref(false)

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

export async function checkOfflineAvailability() {
  if (!('serviceWorker' in navigator)) {
    return { serviceWorkerSupported: false, serviceWorkerActive: false, contentCached: false }
  }

  const registration = await navigator.serviceWorker.getRegistration()
  const serviceWorkerActive = Boolean(registration?.active)
  if (!serviceWorkerActive || !('caches' in window)) {
    return { serviceWorkerSupported: true, serviceWorkerActive, contentCached: false }
  }

  const cacheNames = (await window.caches.keys()).filter((name) => name.includes('workbox-precache'))
  const cachedRequests = (
    await Promise.all(
      cacheNames.map(async (cacheName) => {
        const cache = await window.caches.open(cacheName)
        return cache.keys()
      }),
    )
  ).flat()

  const cachedPaths = cachedRequests.map(({ url }) => new URL(url).pathname)
  const hasApplicationShell = cachedPaths.includes('/index.html')
  const hasBundledApplication = cachedPaths.some((path) => path.endsWith('.js'))

  return {
    serviceWorkerSupported: true,
    serviceWorkerActive,
    contentCached: hasApplicationShell && hasBundledApplication,
  }
}
