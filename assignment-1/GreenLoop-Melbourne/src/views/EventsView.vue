<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { events } from '../data/events'
import CommunityGardenIllustration from '../components/illustrations/CommunityGardenIllustration.vue'

const registrationSection = ref(null)
const registrationForm = ref(null)
const isRegistrationVisible = ref(false)
const successMessage = ref('')

const form = reactive({
  fullName: '',
  email: '',
  attendees: '',
  eventId: '',
})

const touched = reactive({
  fullName: false,
  email: false,
  attendees: false,
  eventId: false,
})

const errors = reactive({
  fullName: '',
  email: '',
  attendees: '',
  eventId: '',
})

const selectedEvent = computed(() => {
  return events.find((event) => event.id === form.eventId)
})

function validateFullName() {
  const name = form.fullName.trim()

  if (!name) return 'Full name is required.'
  if (name.length < 2) return 'Full name must contain at least 2 characters.'
  return ''
}

function validateEmail() {
  const email = form.email.trim()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) return 'Email address is required.'
  if (!emailPattern.test(email)) return 'Please enter a valid email address.'
  return ''
}

function validateAttendees() {
  if (form.attendees === '' || form.attendees === null) {
    return 'Number of attendees is required.'
  }

  const attendeeCount = Number(form.attendees)
  if (!Number.isFinite(attendeeCount)) return 'Please enter a valid number of attendees.'
  if (!Number.isInteger(attendeeCount) || attendeeCount < 1 || attendeeCount > 5) {
    return 'Number of attendees must be between 1 and 5.'
  }
  return ''
}

function validateEvent() {
  return selectedEvent.value ? '' : 'Please select an event.'
}

function validateField(fieldName) {
  const validators = {
    fullName: validateFullName,
    email: validateEmail,
    attendees: validateAttendees,
    eventId: validateEvent,
  }

  errors[fieldName] = validators[fieldName]()
  return !errors[fieldName]
}

function handleBlur(fieldName) {
  touched[fieldName] = true
  validateField(fieldName)
}

function handleInput(fieldName) {
  successMessage.value = ''
  if (touched[fieldName]) validateField(fieldName)
}

function clearValidationState() {
  Object.keys(touched).forEach((fieldName) => {
    touched[fieldName] = false
    errors[fieldName] = ''
  })
}

async function selectEvent(eventId) {
  form.eventId = eventId
  isRegistrationVisible.value = true
  successMessage.value = ''
  clearValidationState()

  await nextTick()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  registrationSection.value?.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start',
  })
  registrationSection.value?.focus({ preventScroll: true })
}

function cancelRegistration() {
  isRegistrationVisible.value = false
  successMessage.value = ''
  clearValidationState()
}

async function handleSubmit() {
  successMessage.value = ''

  Object.keys(touched).forEach((fieldName) => {
    touched[fieldName] = true
  })

  const validationResults = Object.keys(errors).map((fieldName) => validateField(fieldName))
  const isValid = validationResults.every(Boolean)
  if (!isValid) {
    await nextTick()
    registrationForm.value?.querySelector('[aria-invalid="true"]')?.focus()
    return
  }

  successMessage.value = `Registration successful! You are registered for ${selectedEvent.value.title}.`
  isRegistrationVisible.value = false
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="d-flex flex-column flex-md-row align-items-md-center gap-3">
        <div class="flex-grow-1">
          <h1>Community Events</h1>
          <p class="lead mb-0">
            Discover local sustainability, recycling and waste-reduction events across Melbourne.
          </p>
        </div>
        <CommunityGardenIllustration class="page-intro-illustration events-intro-illustration" />
      </div>

      <div class="row g-4 mt-1">
        <div v-for="event in events" :key="event.id" class="col-12 col-sm-6 col-lg-4">
          <article class="card h-100 shadow-sm border-success-subtle">
            <div class="card-body d-flex flex-column p-4">
              <h2 class="h5 card-title">{{ event.title }}</h2>
              <dl class="mb-3">
                <div class="mb-2">
                  <dt class="d-inline">Date:</dt>
                  <dd class="d-inline ms-1">{{ event.date }}</dd>
                </div>
                <div>
                  <dt class="d-inline">Location:</dt>
                  <dd class="d-inline ms-1">{{ event.location }}</dd>
                </div>
              </dl>
              <p class="card-text flex-grow-1">{{ event.description }}</p>
              <button
                class="btn btn-success align-self-start"
                type="button"
                aria-controls="event-registration"
                @click="selectEvent(event.id)"
              >
                Register
              </button>
            </div>
          </article>
        </div>
      </div>

      <div v-if="successMessage" class="row justify-content-center mt-5">
        <div class="col-12 col-lg-9 col-xl-8">
          <div class="alert alert-success mb-0" role="status">
            {{ successMessage }}
          </div>
        </div>
      </div>

      <section
        v-if="isRegistrationVisible"
        id="event-registration"
        ref="registrationSection"
        class="mt-5 scroll-margin-top"
        aria-labelledby="registration-heading"
        tabindex="-1"
      >
        <div class="row justify-content-center">
          <div class="col-12 col-lg-9 col-xl-8">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4 p-md-5">
                <h2 id="registration-heading">Event Registration</h2>
                <p class="text-secondary">Fields marked with <span aria-hidden="true">*</span> are required.</p>

                <form ref="registrationForm" novalidate @submit.prevent="handleSubmit">
                  <div class="mb-3">
                    <label class="form-label" for="full-name">
                      Full Name <span class="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="full-name"
                      v-model="form.fullName"
                      class="form-control"
                      :class="{ 'is-invalid': touched.fullName && errors.fullName }"
                      type="text"
                      autocomplete="name"
                      required
                      :aria-invalid="Boolean(touched.fullName && errors.fullName)"
                      :aria-describedby="touched.fullName && errors.fullName ? 'full-name-error' : undefined"
                      @blur="handleBlur('fullName')"
                      @input="handleInput('fullName')"
                    />
                    <div
                      v-if="touched.fullName && errors.fullName"
                      id="full-name-error"
                      class="invalid-feedback"
                      role="alert"
                    >
                      {{ errors.fullName }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label" for="email-address">
                      Email Address <span class="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="email-address"
                      v-model="form.email"
                      class="form-control"
                      :class="{ 'is-invalid': touched.email && errors.email }"
                      type="email"
                      autocomplete="email"
                      required
                      :aria-invalid="Boolean(touched.email && errors.email)"
                      :aria-describedby="touched.email && errors.email ? 'email-error' : undefined"
                      @blur="handleBlur('email')"
                      @input="handleInput('email')"
                    />
                    <div
                      v-if="touched.email && errors.email"
                      id="email-error"
                      class="invalid-feedback"
                      role="alert"
                    >
                      {{ errors.email }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label" for="attendees">
                      Number of Attendees <span class="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="attendees"
                      v-model.number="form.attendees"
                      class="form-control"
                      :class="{ 'is-invalid': touched.attendees && errors.attendees }"
                      type="number"
                      min="1"
                      max="5"
                      step="1"
                      required
                      :aria-invalid="Boolean(touched.attendees && errors.attendees)"
                      :aria-describedby="touched.attendees && errors.attendees
                        ? 'attendees-help attendees-error'
                        : 'attendees-help'"
                      @blur="handleBlur('attendees')"
                      @input="handleInput('attendees')"
                    />
                    <div id="attendees-help" class="form-text">Enter a number from 1 to 5.</div>
                    <div
                      v-if="touched.attendees && errors.attendees"
                      id="attendees-error"
                      class="invalid-feedback d-block"
                      role="alert"
                    >
                      {{ errors.attendees }}
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label" for="selected-event">
                      Selected Event <span class="text-danger" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="selected-event"
                      v-model.number="form.eventId"
                      class="form-select"
                      :class="{ 'is-invalid': touched.eventId && errors.eventId }"
                      required
                      :aria-invalid="Boolean(touched.eventId && errors.eventId)"
                      :aria-describedby="touched.eventId && errors.eventId ? 'event-error' : undefined"
                      @blur="handleBlur('eventId')"
                      @change="handleInput('eventId')"
                    >
                      <option value="">Choose an event</option>
                      <option v-for="event in events" :key="event.id" :value="event.id">
                        {{ event.title }}
                      </option>
                    </select>
                    <div
                      v-if="touched.eventId && errors.eventId"
                      id="event-error"
                      class="invalid-feedback"
                      role="alert"
                    >
                      {{ errors.eventId }}
                    </div>
                  </div>

                  <div class="d-flex flex-column flex-sm-row gap-2">
                    <button class="btn btn-success" type="submit">Complete Registration</button>
                    <button class="btn btn-outline-secondary" type="button" @click="cancelRegistration">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>
