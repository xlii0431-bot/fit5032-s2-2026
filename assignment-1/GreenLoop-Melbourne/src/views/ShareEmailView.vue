<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { recyclingItems } from '../data/recyclingItems'
import { createCsvContent } from '../utils/csv'
import { sendRecyclingEmail } from '../utils/email'
import EcoMailIllustration from '../components/illustrations/EcoMailIllustration.vue'

const MAX_MESSAGE_LENGTH = 1000
const form = reactive({
  recipient: '',
  message: '',
  selectedItemIds: [],
})
const errors = reactive({recipient: '', message: '', selection: ''})
const isSending = ref(false)
const successMessage = ref('')
const sendError = ref('')
const shareForm = ref(null)

const emailColumns = [
  {key: 'name', label: 'Item'},
  {key: 'category', label: 'Category'},
  {key: 'recyclable', label: 'Recycling Option'},
  {key: 'disposal', label: 'Disposal Guidance'},
  {key: 'description', label: 'Description'},
  {key: 'location', label: 'Nearest Location'},
  {key: 'suburb', label: 'Suburb'},
  {key: 'distance', label: 'Approx. Distance'},
]

const shareableItems = recyclingItems.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  recyclable: item.recyclable ? 'Yes' : 'Special disposal',
  disposal: item.disposal,
  description: item.description,
  location: item.location?.locationName || 'Not available',
  suburb: item.location?.suburb || 'Not available',
  distance:
    typeof item.location?.distanceKm === 'number'
      ? `${item.location.distanceKm.toFixed(1)} km`
      : 'Not available',
}))

const selectedItems = computed(() =>
  shareableItems.filter((item) => form.selectedItemIds.includes(item.id)),
)
const allItemsSelected = computed(() => form.selectedItemIds.length === shareableItems.length)

function validateForm() {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  errors.recipient = !form.recipient.trim()
    ? 'Recipient email is required.'
    : !emailPattern.test(form.recipient.trim()) || form.recipient.trim().length > 254
      ? 'Enter a valid recipient email address.'
      : ''
  errors.message =
    form.message.length > MAX_MESSAGE_LENGTH
      ? `Message must not exceed ${MAX_MESSAGE_LENGTH} characters.`
      : ''
  errors.selection = selectedItems.value.length === 0 ? 'Select at least one recycling item.' : ''

  return !errors.recipient && !errors.message && !errors.selection
}

function toggleAllItems() {
  form.selectedItemIds = allItemsSelected.value ? [] : shareableItems.map((item) => item.id)
  errors.selection = ''
}

async function handleSubmit() {
  successMessage.value = ''
  sendError.value = ''
  if (!validateForm()) {
    await nextTick()
    const firstInvalidControl = shareForm.value?.querySelector(
      'input[aria-invalid="true"], textarea[aria-invalid="true"], fieldset[aria-invalid="true"] input',
    )
    firstInvalidControl?.focus()
    return
  }

  const csvContent = createCsvContent(emailColumns, selectedItems.value, (row, column) => row[column.key])
  isSending.value = true

  try {
    const result = await sendRecyclingEmail({
      recipient: form.recipient.trim(),
      message: form.message.trim(),
      itemIds: selectedItems.value.map((item) => item.id),
      csvContent,
    })
    successMessage.value = `Email sent with ${result.sharedItemCount} recycling ${result.sharedItemCount === 1 ? 'item' : 'items'}.`
    form.recipient = ''
    form.message = ''
  } catch (error) {
    const friendlyErrors = {
      'functions/unauthenticated': 'Your session has expired. Please log in and try again.',
      'functions/invalid-argument': error.message || 'Review the email details and try again.',
      'functions/resource-exhausted': 'Too many emails have been requested. Please try again later.',
      'functions/unavailable': 'The email service is temporarily unavailable. Please try again later.',
    }
    sendError.value = friendlyErrors[error.code] || 'The email could not be sent. Please try again later.'
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-xl-10">
          <div class="d-flex flex-column flex-md-row align-items-md-center gap-3">
            <div class="flex-grow-1">
              <h1>Share Recycling Information</h1>
              <p class="lead mb-0">Email selected GreenLoop recycling guidance as a CSV attachment.</p>
            </div>
            <EcoMailIllustration class="page-intro-illustration share-intro-illustration" />
          </div>

          <div v-if="successMessage" class="alert alert-success" role="status">
            {{ successMessage }}
          </div>
          <div v-if="sendError" class="alert alert-danger" role="alert">
            {{ sendError }}
          </div>

          <form
            ref="shareForm"
            class="card border-0 shadow-sm mt-4"
            novalidate
            :aria-busy="isSending"
            @submit.prevent="handleSubmit"
          >
            <div class="card-body p-4 p-md-5">
              <div class="row g-4">
                <div class="col-12 col-lg-5">
                  <div class="mb-3">
                    <label class="form-label fw-semibold" for="share-recipient">Recipient email</label>
                    <input
                      id="share-recipient"
                      v-model="form.recipient"
                      class="form-control"
                      :class="{'is-invalid': errors.recipient}"
                      type="email"
                      autocomplete="email"
                      maxlength="254"
                      required
                      :aria-invalid="Boolean(errors.recipient)"
                      :aria-describedby="errors.recipient ? 'share-recipient-error' : undefined"
                      @input="errors.recipient = ''; successMessage = ''; sendError = ''"
                    />
                    <div
                      v-if="errors.recipient"
                      id="share-recipient-error"
                      class="invalid-feedback"
                      role="alert"
                    >
                      {{ errors.recipient }}
                    </div>
                  </div>

                  <div>
                    <label class="form-label fw-semibold" for="share-message">
                      Message <span class="text-secondary fw-normal">(optional)</span>
                    </label>
                    <textarea
                      id="share-message"
                      v-model="form.message"
                      class="form-control"
                      :class="{'is-invalid': errors.message}"
                      rows="7"
                      :maxlength="MAX_MESSAGE_LENGTH"
                      :aria-invalid="Boolean(errors.message)"
                      :aria-describedby="errors.message
                        ? 'share-message-help share-message-error'
                        : 'share-message-help'"
                      @input="errors.message = ''; successMessage = ''; sendError = ''"
                    ></textarea>
                    <div id="share-message-help" class="form-text">
                      {{ form.message.length }} / {{ MAX_MESSAGE_LENGTH }} characters
                    </div>
                    <div
                      v-if="errors.message"
                      id="share-message-error"
                      class="invalid-feedback d-block"
                      role="alert"
                    >
                      {{ errors.message }}
                    </div>
                  </div>
                </div>

                <fieldset
                  class="col-12 col-lg-7"
                  :aria-invalid="Boolean(errors.selection)"
                  :aria-describedby="errors.selection ? 'share-selection-error' : undefined"
                >
                  <legend class="h5">Select recycling information</legend>
                  <button class="btn btn-sm btn-outline-success mb-3" type="button" @click="toggleAllItems">
                    {{ allItemsSelected ? 'Clear all' : 'Select all' }}
                  </button>
                  <div class="row g-2">
                    <div v-for="item in shareableItems" :key="item.id" class="col-12 col-sm-6">
                      <div class="form-check border rounded-3 p-3 ps-5 h-100">
                        <input
                          :id="`share-item-${item.id}`"
                          v-model="form.selectedItemIds"
                          class="form-check-input"
                          type="checkbox"
                          :value="item.id"
                          @change="errors.selection = ''; successMessage = ''; sendError = ''"
                        />
                        <label class="form-check-label" :for="`share-item-${item.id}`">
                          <span class="fw-semibold d-block">{{ item.name }}</span>
                          <span class="small text-secondary">{{ item.category }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <p
                    v-if="errors.selection"
                    id="share-selection-error"
                    class="text-danger small mt-2 mb-0"
                    role="alert"
                  >
                    {{ errors.selection }}
                  </p>
                </fieldset>
              </div>

              <div class="d-flex flex-wrap align-items-center gap-3 mt-4 pt-4 border-top">
                <button class="btn btn-success" type="submit" :disabled="isSending">
                  <span
                    v-if="isSending"
                    class="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  ></span>
                  {{ isSending ? 'Sending...' : 'Send Email' }}
                </button>
                <span class="text-secondary small" role="status" aria-live="polite">
                  {{ selectedItems.length }} {{ selectedItems.length === 1 ? 'item' : 'items' }} selected
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
