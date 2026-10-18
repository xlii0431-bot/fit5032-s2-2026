<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  itemId: { type: Number, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  recyclable: { type: Boolean, required: true },
  disposal: { type: String, required: true },
  description: { type: String, required: true },
  whyItMatters: { type: String, required: true },
  location: { type: Object, default: null },
  favourite: { type: Boolean, default: false },
  favouritesLoading: { type: Boolean, default: false },
  favouritePending: { type: Boolean, default: false },
})

defineEmits(['toggle-favourite'])
</script>

<template>
  <article class="card h-100 recycling-card shadow-sm">
    <div class="card-body d-flex flex-column p-4">
      <div class="d-flex align-items-start justify-content-between gap-2 mb-3">
        <h3 class="h5 card-title mb-0">{{ name }}</h3>
        <span :class="['badge', recyclable ? 'text-bg-success' : 'text-bg-warning']">
          {{ recyclable ? 'Recyclable' : 'Special Disposal' }}
        </span>
      </div>

      <p class="small text-success fw-semibold text-uppercase mb-2">{{ category }}</p>
      <p class="card-text">{{ description }}</p>

      <div class="mt-2 pt-3 border-top">
        <p class="fw-semibold mb-1">Why it matters</p>
        <p class="card-text mb-0">{{ whyItMatters }}</p>
      </div>

      <div class="mt-auto pt-3 border-top">
        <p class="fw-semibold mb-1">How to dispose of it</p>
        <p class="card-text mb-0">{{ disposal }}</p>
      </div>

      <div v-if="location" class="mt-3 pt-3 border-top">
        <p class="small text-secondary fw-semibold text-uppercase mb-2">
          Nearest Drop-off Location
        </p>
        <p class="fw-semibold mb-1">{{ location.locationName }}</p>
        <p class="small text-secondary mb-3">
          {{ location.suburb }} · Approx. {{ location.distanceKm }} km away
        </p>
        <RouterLink
          class="btn btn-outline-success btn-sm"
          :to="{ path: '/locations', query: { item: name } }"
        >
          View Location
        </RouterLink>
      </div>

      <div class="mt-3 pt-3 border-top">
        <button
          class="btn btn-sm favourite-toggle"
          :class="favourite ? 'btn-outline-danger' : 'btn-success'"
          type="button"
          :disabled="favouritesLoading || favouritePending"
          :aria-pressed="favourite"
          :aria-label="favouritesLoading
            ? `Loading favourite status for ${name}`
            : favourite
              ? `Remove ${name} from favourites`
              : `Save ${name} to favourites`"
          @click="$emit('toggle-favourite', itemId)"
        >
          {{ favouritePending
            ? 'Updating favourite...'
            : favouritesLoading
              ? 'Loading favourites...'
              : favourite
                ? 'Remove Favourite'
                : 'Save to Favourites' }}
        </button>
      </div>
    </div>
  </article>
</template>
