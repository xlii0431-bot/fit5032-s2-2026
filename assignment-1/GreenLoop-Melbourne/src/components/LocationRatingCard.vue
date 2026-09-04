<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { observeLocationRatings, saveLocationRating } from '../utils/ratings'

const props = defineProps({
  location: { type: Object, required: true },
  userId: { type: String, required: true },
})

const stars = [1, 2, 3, 4, 5]
const averageRating = ref(0)
const ratingCount = ref(0)
const userRating = ref(0)
const isLoading = ref(true)
const isSubmitting = ref(false)
const feedbackMessage = ref('')
const errorMessage = ref('')
let stopObservingRatings = null

function handleRatingsError(error) {
  isLoading.value = false
  errorMessage.value =
    error.code === 'permission-denied'
      ? 'Ratings cannot be loaded because access was denied.'
      : 'Ratings are temporarily unavailable. Please try again later.'

  if (import.meta.env.DEV) {
    console.error('Firebase ratings could not be loaded', {
      locationId: props.location.id,
      code: error.code,
      message: error.message,
    })
  }
}

async function submitRating(rating) {
  if (isSubmitting.value) return

  isSubmitting.value = true
  feedbackMessage.value = ''
  errorMessage.value = ''

  try {
    await saveLocationRating(props.location.id, props.userId, rating)
    feedbackMessage.value = userRating.value
      ? `Your rating has been updated to ${rating} stars.`
      : `Thank you for rating this location ${rating} stars.`
  } catch (error) {
    errorMessage.value =
      error.code === 'permission-denied'
        ? 'Your rating could not be saved because access was denied.'
        : 'Your rating could not be saved. Please try again.'

    if (import.meta.env.DEV) {
      console.error('Firebase rating submission failed', {
        locationId: props.location.id,
        code: error.code,
        message: error.message,
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  stopObservingRatings = observeLocationRatings(
    props.location.id,
    props.userId,
    ({ average, count, userRating: selectedRating }) => {
      averageRating.value = average
      ratingCount.value = count
      userRating.value = selectedRating
      isLoading.value = false
    },
    handleRatingsError,
  )
})

onUnmounted(() => {
  if (stopObservingRatings) stopObservingRatings()
})
</script>

<template>
  <article class="card h-100 border-0 shadow-sm">
    <div class="card-body d-flex flex-column p-4">
      <h2 class="h5">{{ location.name }}</h2>
      <p class="text-success fw-semibold mb-2">{{ location.suburb }}</p>
      <p class="text-secondary flex-grow-1">{{ location.description }}</p>

      <div class="border-top pt-3">
        <p class="fw-semibold mb-2">Rate this location</p>
        <div class="d-flex gap-1" role="group" :aria-label="`Rate ${location.name}`">
          <button
            v-for="star in stars"
            :key="star"
            class="star-button btn btn-link p-0"
            type="button"
            :aria-label="`Rate ${star} out of 5`"
            :aria-pressed="star === userRating"
            :disabled="isLoading || isSubmitting"
            @click="submitRating(star)"
          >
            <span aria-hidden="true">{{ star <= userRating ? '★' : '☆' }}</span>
          </button>
        </div>

        <p class="small text-secondary mt-2 mb-0" aria-live="polite">
          <span v-if="isLoading">Loading ratings...</span>
          <span v-else-if="ratingCount === 0">No ratings yet</span>
          <span v-else>
            {{ averageRating.toFixed(1) }} / 5
            ({{ ratingCount }} {{ ratingCount === 1 ? 'rating' : 'ratings' }})
          </span>
        </p>
        <p v-if="userRating" class="small mb-0 mt-1">Your rating: {{ userRating }} / 5</p>
        <p v-if="feedbackMessage" class="small text-success mb-0 mt-2" role="status">
          {{ feedbackMessage }}
        </p>
        <p v-if="errorMessage" class="small text-danger mb-0 mt-2" role="alert">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.star-button {
  color: #d49b00;
  font-size: 1.75rem;
  line-height: 1;
  text-decoration: none;
}

.star-button:hover,
.star-button:focus-visible {
  color: #a97800;
  transform: translateY(-1px);
}

.star-button:disabled {
  color: #adb5bd;
  opacity: 0.75;
}
</style>
