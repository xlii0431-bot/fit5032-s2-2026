<script setup>
import { computed, ref } from 'vue'
import RecyclingCard from '../components/RecyclingCard.vue'
import { recyclingItems } from '../data/recyclingItems'

const searchQuery = ref('')
const selectedCategory = ref('')

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
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="row">
        <div class="col-12 col-lg-9 col-xl-8">
          <h1>Recycling Guide</h1>
          <p class="lead">
            Search common household items to learn how they should be recycled or disposed of
            responsibly.
          </p>
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

      <div class="d-flex align-items-center justify-content-between mb-3">
        <h2 class="h4 mb-0">Recycling items</h2>
        <span class="text-secondary">
          {{ filteredItems.length }} {{ filteredItems.length === 1 ? 'item' : 'items' }}
        </span>
      </div>

      <div v-if="filteredItems.length" class="row g-4">
        <div v-for="item in filteredItems" :key="item.id" class="col-12 col-sm-6 col-lg-4">
          <RecyclingCard
            :name="item.name"
            :category="item.category"
            :recyclable="item.recyclable"
            :disposal="item.disposal"
            :description="item.description"
          />
        </div>
      </div>

      <div v-else class="alert alert-light border text-center py-4" role="status">
        No recycling items match your search.
      </div>
    </div>
  </section>
</template>
