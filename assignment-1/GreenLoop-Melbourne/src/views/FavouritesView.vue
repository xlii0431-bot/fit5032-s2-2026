<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { recyclingItems } from '../data/recyclingItems'
import { getCurrentUser } from '../utils/auth'
import { observeFavourites, removeFavourite } from '../utils/favourites'
import FavouriteLeafIllustration from '../components/illustrations/FavouriteLeafIllustration.vue'

const currentUser = ref(null)
const favouriteIds = ref([])
const isLoading = ref(true)
const pendingItemId = ref(null)
const feedback = ref('')
const errorMessage = ref('')
let stopObserving = null

const favouriteItems = computed(() => {
  const savedIds = new Set(favouriteIds.value)
  return recyclingItems.filter((item) => savedIds.has(item.id))
})

async function removeItem(item) {
  if (!currentUser.value || pendingItemId.value !== null) return
  pendingItemId.value = item.id
  feedback.value = ''
  errorMessage.value = ''
  try {
    await removeFavourite(currentUser.value.uid, item.id)
    // Update immediately; the Firestore listener remains the source of truth.
    favouriteIds.value = favouriteIds.value.filter((id) => id !== item.id)
    feedback.value = `${item.name} removed from favourites.`
  } catch (error) {
    errorMessage.value =
      error.code === 'permission-denied'
        ? 'Your favourites could not be updated because Firestore denied this request.'
        : 'Your favourites could not be updated. Please try again.'
  } finally {
    pendingItemId.value = null
  }
}

onMounted(async () => {
  currentUser.value = await getCurrentUser()
  if (!currentUser.value) {
    isLoading.value = false
    return
  }

  stopObserving = observeFavourites(
    currentUser.value.uid,
    (ids) => {
      favouriteIds.value = ids
      isLoading.value = false
    },
    (error) => {
      isLoading.value = false
      errorMessage.value =
        error.code === 'permission-denied'
          ? 'Your favourites are currently unavailable because Firestore denied this request.'
          : 'Favourites could not be loaded.'
    },
  )
})

onUnmounted(() => stopObserving?.())
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="d-flex flex-column flex-md-row align-items-md-center gap-3 mb-2">
        <div class="flex-grow-1">
          <h1>My Recycling Favourites</h1>
          <p class="lead mb-0">Your saved recycling guidance in one convenient place.</p>
        </div>
        <FavouriteLeafIllustration class="page-intro-illustration favourites-intro-illustration" />
      </div>
      <p v-if="feedback" class="alert alert-success" role="status" aria-live="polite">{{ feedback }}</p>
      <p v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</p>
      <div v-if="isLoading" class="alert alert-light border" role="status">Loading favourites...</div>
      <template v-else>
        <p class="fw-semibold" role="status" aria-live="polite">
          {{ favouriteItems.length }} {{ favouriteItems.length === 1 ? 'favourite' : 'favourites' }} saved.
        </p>
        <div v-if="favouriteItems.length === 0" class="card border-0 bg-light shadow-sm text-center">
          <div class="card-body p-4 p-md-5">
            <h2 class="h4">No favourites saved yet</h2>
            <p class="text-secondary mb-4">
              Browse the Recycling Guide to save useful recycling information here.
            </p>
            <RouterLink class="btn btn-success" to="/recycling-guide">
              Browse Recycling Guide
            </RouterLink>
          </div>
        </div>
        <div v-else class="row g-4">
          <div v-for="item in favouriteItems" :key="item.id" class="col-12 col-md-6 col-xl-4">
            <article class="card h-100 border-0 shadow-sm p-4">
              <h2 class="h5">{{ item.name }}</h2>
              <p class="text-success fw-semibold">{{ item.category }}</p>
              <p class="flex-grow-1">{{ item.description }}</p>
              <button
                class="btn btn-outline-danger align-self-start remove-favourite"
                type="button"
                :disabled="pendingItemId !== null"
                :aria-label="`Remove ${item.name} from favourites`"
                @click="removeItem(item)"
              >
                {{ pendingItemId === item.id ? 'Removing...' : 'Remove favourite' }}
              </button>
            </article>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
