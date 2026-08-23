<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  name: { type: String, required: true },
  category: { type: String, required: true },
  recyclable: { type: Boolean, required: true },
  disposal: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: Object, default: null },
})
</script>

<template>
  <article class="card h-100 recycling-card shadow-sm">
    <div class="card-body d-flex flex-column p-4">
      <div class="d-flex align-items-start justify-content-between gap-2 mb-3">
        <h2 class="h5 card-title mb-0">{{ name }}</h2>
        <span :class="['badge', recyclable ? 'text-bg-success' : 'text-bg-warning']">
          {{ recyclable ? 'Recyclable' : 'Special Disposal' }}
        </span>
      </div>

      <p class="small text-success fw-semibold text-uppercase mb-2">{{ category }}</p>
      <p class="card-text">{{ description }}</p>

      <div class="mt-auto pt-2 border-top">
        <p class="fw-semibold mb-1">Disposal guidance</p>
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
    </div>
  </article>
</template>
