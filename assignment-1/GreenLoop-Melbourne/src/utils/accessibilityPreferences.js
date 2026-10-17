import { computed, reactive, readonly } from 'vue'

export const ACCESSIBILITY_PREFERENCES_KEY = 'greenloop-accessibility-preferences'

const defaultPreferences = {
  motion: 'system',
  highContrast: false,
  simplifiedLayout: false,
  textSize: 'normal',
  colorScheme: 'system',
}

const state = reactive({
  ...defaultPreferences,
  systemReducedMotion: false,
  systemDarkMode: false,
})

let motionMediaQuery
let colorSchemeMediaQuery
let initialized = false

function normalisePreferences(value = {}) {
  return {
    motion: ['system', 'reduce', 'allow'].includes(value.motion) ? value.motion : 'system',
    highContrast: value.highContrast === true,
    simplifiedLayout: value.simplifiedLayout === true,
    textSize: ['small', 'normal', 'large', 'extra-large'].includes(value.textSize)
      ? value.textSize
      : 'normal',
    colorScheme: ['light', 'dark', 'system'].includes(value.colorScheme)
      ? value.colorScheme
      : 'system',
  }
}

function readStoredPreferences() {
  try {
    return normalisePreferences(JSON.parse(localStorage.getItem(ACCESSIBILITY_PREFERENCES_KEY) || '{}'))
  } catch {
    return { ...defaultPreferences }
  }
}

function applyPreferences() {
  const root = document.documentElement
  root.dataset.reduceMotion = String(effectiveReduceMotion.value)
  root.dataset.highContrast = String(state.highContrast)
  root.dataset.simplifiedLayout = String(state.simplifiedLayout)
  root.dataset.textSize = state.textSize
  root.dataset.colorScheme = effectiveColorScheme.value
  root.style.colorScheme = effectiveColorScheme.value
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content',
    effectiveColorScheme.value === 'dark' ? '#101914' : '#198754',
  )
}

function handleSystemColorSchemeChange(event) {
  state.systemDarkMode = event.matches
  if (state.colorScheme === 'system') applyPreferences()
}

function handleSystemMotionChange(event) {
  state.systemReducedMotion = event.matches
  if (state.motion === 'system') applyPreferences()
}

export const effectiveReduceMotion = computed(() =>
  state.motion === 'reduce' || (state.motion === 'system' && state.systemReducedMotion),
)

export const effectiveColorScheme = computed(() =>
  state.colorScheme === 'system'
    ? state.systemDarkMode ? 'dark' : 'light'
    : state.colorScheme,
)

export function initializeAccessibilityPreferences() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  Object.assign(state, readStoredPreferences())
  motionMediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  colorSchemeMediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
  state.systemReducedMotion = motionMediaQuery?.matches ?? false
  state.systemDarkMode = colorSchemeMediaQuery?.matches ?? false
  motionMediaQuery?.addEventListener?.('change', handleSystemMotionChange)
  colorSchemeMediaQuery?.addEventListener?.('change', handleSystemColorSchemeChange)
  applyPreferences()
}

export function updateAccessibilityPreferences(preferences) {
  Object.assign(state, normalisePreferences(preferences))
  localStorage.setItem(ACCESSIBILITY_PREFERENCES_KEY, JSON.stringify({
    motion: state.motion,
    highContrast: state.highContrast,
    simplifiedLayout: state.simplifiedLayout,
    textSize: state.textSize,
    colorScheme: state.colorScheme,
  }))
  applyPreferences()
}

export function resetAccessibilityPreferences() {
  Object.assign(state, defaultPreferences)
  state.systemReducedMotion = motionMediaQuery?.matches ?? state.systemReducedMotion
  state.systemDarkMode = colorSchemeMediaQuery?.matches ?? state.systemDarkMode
  localStorage.removeItem(ACCESSIBILITY_PREFERENCES_KEY)
  applyPreferences()
}

export function useAccessibilityPreferences() {
  initializeAccessibilityPreferences()
  return {
    preferences: readonly(state),
    effectiveReduceMotion,
    effectiveColorScheme,
    updatePreferences: updateAccessibilityPreferences,
    resetPreferences: resetAccessibilityPreferences,
  }
}
