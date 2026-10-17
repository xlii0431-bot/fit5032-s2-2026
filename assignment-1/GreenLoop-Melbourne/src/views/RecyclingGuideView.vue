<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RecyclingCard from '../components/RecyclingCard.vue'
import WasteSortingIllustration from '../components/illustrations/WasteSortingIllustration.vue'
import { recyclingItems } from '../data/recyclingItems'
import { getCurrentUser } from '../utils/auth'
import { observeFavourites, removeFavourite, saveFavourite } from '../utils/favourites'

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('')
const currentUser = ref(null)
const favouriteIds = ref([])
const favouritesLoading = ref(true)
const pendingItemId = ref(null)
const favouriteFeedback = ref('')
const favouriteError = ref('')
let stopObservingFavourites = null

const categories = computed(() => {
  return [...new Set(recyclingItems.map((item) => item.category))].sort()
})

const filteredItems = computed(() => {
  const normalisedQuery = searchQuery.value.trim().toLowerCase()

  return recyclingItems.filter((item) => {
    const searchableText = `${item.name} ${item.description} ${item.disposal}`.toLowerCase()
    const matchesSearch = searchableText.includes(normalisedQuery)
    const matchesCategory =
      selectedCategory.value === '' || item.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

function isFavourite(itemId) {
  return favouriteIds.value.includes(itemId)
}

async function toggleFavourite(itemId) {
  if (pendingItemId.value !== null) return
  if (!currentUser.value) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  const item = recyclingItems.find(({ id }) => id === itemId)
  if (!item) return

  pendingItemId.value = itemId
  favouriteFeedback.value = ''
  favouriteError.value = ''

  try {
    if (isFavourite(itemId)) {
      await removeFavourite(currentUser.value.uid, itemId)
      favouriteIds.value = favouriteIds.value.filter((id) => id !== itemId)
      favouriteFeedback.value = `${item.name} removed from favourites.`
    } else {
      await saveFavourite(currentUser.value.uid, itemId)
      favouriteIds.value = [...new Set([...favouriteIds.value, itemId])]
      favouriteFeedback.value = `${item.name} saved to favourites.`
    }
  } catch (error) {
    favouriteError.value =
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
    favouritesLoading.value = false
    return
  }

  stopObservingFavourites = observeFavourites(
    currentUser.value.uid,
    (ids) => {
      favouriteIds.value = ids
      favouritesLoading.value = false
    },
    (error) => {
      favouritesLoading.value = false
      favouriteError.value =
        error.code === 'permission-denied'
          ? 'Your favourites are currently unavailable because Firestore denied this request.'
          : 'Favourites could not be loaded. Please try again.'
    },
  )
})

onUnmounted(() => stopObservingFavourites?.())
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="row align-items-end g-3">
        <div class="col-12 col-lg-8">
          <h1>Recycling Guide</h1>
          <p class="lead">
            Search common household items to learn how they should be recycled or disposed of
            responsibly.
          </p>
        </div>
        <div class="col-12 col-lg-4 d-flex flex-column align-items-lg-end gap-2">
          <WasteSortingIllustration class="page-intro-illustration recycling-intro-illustration" />
          <RouterLink class="btn btn-outline-success" to="/locations">
            Find Nearby Recycling Centres
          </RouterLink>
        </div>
      </div>

      <div class="card border-0 shadow-sm mt-4 mb-4">
        <div class="card-body p-3 p-sm-4">
          <div class="row g-3">
            <div class="col-12 col-md-7">
              <label class="form-label fw-semibold" for="recycling-search">
                Search recycling items
              </label>
              <input
                id="recycling-search"
                v-model="searchQuery"
                class="form-control"
                type="search"
                placeholder="e.g. battery, bottle, cardboard"
              />
            </div>

            <div class="col-12 col-md-5">
              <label class="form-label fw-semibold" for="category-filter">
                Filter by category
              </label>
              <select id="category-filter" v-model="selectedCategory" class="form-select">
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h2 class="h4 mb-0">Recycling items</h2>
        <span class="text-secondary" role="status" aria-live="polite">
          {{ filteredItems.length }} {{ filteredItems.length === 1 ? 'item' : 'items' }}
        </span>
      </div>

      <p v-if="favouriteFeedback" class="alert alert-success" role="status" aria-live="polite">
        {{ favouriteFeedback }}
      </p>
      <p v-if="favouriteError" class="alert alert-danger" role="alert">
        {{ favouriteError }}
      </p>

      <div v-if="filteredItems.length" class="row g-4">
        <div v-for="item in filteredItems" :key="item.id" class="col-12 col-sm-6 col-lg-4">
          <RecyclingCard
            :item-id="item.id"
            :name="item.name"
            :category="item.category"
            :recyclable="item.recyclable"
            :disposal="item.disposal"
            :description="item.description"
            :location="item.location"
            :favourite="isFavourite(item.id)"
            :favourites-loading="favouritesLoading"
            :favourite-pending="pendingItemId === item.id"
            @toggle-favourite="toggleFavourite"
          />
        </div>
      </div>

      <div v-else class="alert alert-light border text-center py-4" role="status">
        No recycling items match your search.
      </div>
    </div>
  </section>
</template>
