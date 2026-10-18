<script setup>
import { nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import { Accessibility, RotateCcw, X } from '@lucide/vue'
import { useAccessibilityPreferences } from '../utils/accessibilityPreferences'

const { preferences, updatePreferences, resetPreferences } = useAccessibilityPreferences()
const isOpen = ref(false)
const dialog = ref(null)
const trigger = ref(null)
const draft = reactive({
  motion: 'system',
  highContrast: false,
  simplifiedLayout: false,
  textSize: 'normal',
  colorScheme: 'system',
})
const statusMessage = ref('')

function setBackgroundInert(value) {
  const appRoot = document.getElementById('app')
  if (!appRoot) return
  appRoot.inert = value
  if (value) appRoot.setAttribute('aria-hidden', 'true')
  else appRoot.removeAttribute('aria-hidden')
}

function syncDraft() {
  draft.motion = preferences.motion
  draft.highContrast = preferences.highContrast
  draft.simplifiedLayout = preferences.simplifiedLayout
  draft.textSize = preferences.textSize
  draft.colorScheme = preferences.colorScheme
}

async function openDialog() {
  syncDraft()
  statusMessage.value = ''
  isOpen.value = true
  await nextTick()
  dialog.value?.querySelector('input, button')?.focus()
  setBackgroundInert(true)
}

async function closeDialog() {
  setBackgroundInert(false)
  isOpen.value = false
  await nextTick()
  trigger.value?.focus()
}

onBeforeUnmount(() => setBackgroundInert(false))

async function savePreferences() {
  updatePreferences(draft)
  statusMessage.value = 'Accessibility preferences saved.'
  await closeDialog()
}

function restoreDefaults() {
  resetPreferences()
  syncDraft()
  statusMessage.value = 'Accessibility preferences reset to device defaults.'
}

function handleDialogKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeDialog()
    return
  }
  if (event.key !== 'Tab') return
  const controls = [...dialog.value.querySelectorAll('button, input:not([disabled])')]
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
</script>

<template>
  <li><hr class="dropdown-divider" /></li>
  <li>
    <button ref="trigger" class="dropdown-item account-action" type="button" @click.stop="openDialog">
      <Accessibility :size="18" aria-hidden="true" />
      Accessibility preferences
    </button>
  </li>

  <Teleport to="body">
    <p class="visually-hidden" role="status" aria-live="polite">{{ statusMessage }}</p>
    <div v-if="isOpen" class="preferences-backdrop" @click.self="closeDialog">
      <section
        ref="dialog"
        class="preferences-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferences-title"
        aria-describedby="preferences-description"
        @keydown="handleDialogKeydown"
      >
        <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
          <div>
            <h2 id="preferences-title" class="h4 mb-1">Accessibility preferences</h2>
            <p id="preferences-description" class="text-secondary mb-0">
              Adjust sensory settings for this device.
            </p>
          </div>
          <button class="btn btn-sm btn-outline-secondary" type="button" aria-label="Close accessibility preferences" @click="closeDialog">
            <X :size="18" aria-hidden="true" />
          </button>
        </div>

        <fieldset class="mb-3">
          <legend class="h6">Motion</legend>
          <div v-for="option in [{ value: 'system', label: 'Use device setting' }, { value: 'reduce', label: 'Reduce motion' }, { value: 'allow', label: 'Allow motion' }]" :key="option.value" class="form-check">
            <input :id="`motion-${option.value}`" v-model="draft.motion" class="form-check-input" type="radio" name="motion-preference" :value="option.value" />
            <label class="form-check-label" :for="`motion-${option.value}`">{{ option.label }}</label>
          </div>
        </fieldset>

        <fieldset class="mb-3">
          <legend class="h6">Global text size</legend>
          <div class="preference-choice-grid">
            <div v-for="option in [{ value: 'small', label: 'Small' }, { value: 'normal', label: 'Normal' }, { value: 'large', label: 'Large' }, { value: 'extra-large', label: 'Extra Large' }]" :key="option.value" class="form-check">
              <input :id="`text-size-${option.value}`" v-model="draft.textSize" class="form-check-input" type="radio" name="text-size-preference" :value="option.value" />
              <label class="form-check-label" :for="`text-size-${option.value}`">{{ option.label }}</label>
            </div>
          </div>
        </fieldset>

        <fieldset class="mb-3">
          <legend class="h6">Colour theme</legend>
          <div class="preference-choice-grid">
            <div v-for="option in [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }]" :key="option.value" class="form-check">
              <input :id="`colour-scheme-${option.value}`" v-model="draft.colorScheme" class="form-check-input" type="radio" name="colour-scheme-preference" :value="option.value" />
              <label class="form-check-label" :for="`colour-scheme-${option.value}`">{{ option.label }}</label>
            </div>
          </div>
          <div class="form-text">System follows your device’s light or dark appearance.</div>
        </fieldset>

        <div class="form-check form-switch mb-3">
          <input id="high-contrast-preference" v-model="draft.highContrast" class="form-check-input" type="checkbox" role="switch" />
          <label class="form-check-label fw-semibold" for="high-contrast-preference">High contrast</label>
          <div class="form-text">Strengthens text, borders and focus visibility.</div>
        </div>

        <div class="form-check form-switch mb-4">
          <input id="simplified-layout-preference" v-model="draft.simplifiedLayout" class="form-check-input" type="checkbox" role="switch" />
          <label class="form-check-label fw-semibold" for="simplified-layout-preference">Simplified layout</label>
          <div class="form-text">Removes decorative effects and reduces spacing without hiding content.</div>
        </div>

        <div class="d-flex flex-wrap justify-content-between gap-2">
          <button class="btn btn-outline-secondary" type="button" @click="restoreDefaults">
            <RotateCcw :size="17" aria-hidden="true" /> Reset
          </button>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary" type="button" @click="closeDialog">Close</button>
            <button class="btn btn-success save-preferences" type="button" @click="savePreferences">Save preferences</button>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
