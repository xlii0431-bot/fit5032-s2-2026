<script setup>
import { computed, ref } from 'vue'
import ResourceCard from '../components/ResourceCard.vue'
import { resources } from '../data/resources'

const selectedCategory = ref('')
const selectedType = ref('')

const categories = computed(() => {
  return [...new Set(resources.map((resource) => resource.category))].sort()
})

const resourceTypes = computed(() => {
  return [...new Set(resources.map((resource) => resource.type))].sort()
})

const filteredResources = computed(() => {
  return resources.filter((resource) => {
    const matchesCategory =
      selectedCategory.value === '' || resource.category === selectedCategory.value
    const matchesType = selectedType.value === '' || resource.type === selectedType.value

    return matchesCategory && matchesType
  })
})
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="row">
        <div class="col-12 col-lg-9 col-xl-8">
          <h1>Waste Reduction Resources</h1>
          <p class="lead">
            Explore practical guides, tips and checklists to help Melbourne households reduce waste
            and make more sustainable everyday choices.
          </p>
        </div>
      </div>

      <div class="card border-0 shadow-sm mt-4 mb-4">
        <div class="card-body p-3 p-sm-4">
          <div class="row g-3">
            <div class="col-12 col-sm-6">
              <label class="form-label fw-semibold" for="resource-category">
                Filter by category
              </label>
              <select id="resource-category" v-model="selectedCategory" class="form-select">
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>

            <div class="col-12 col-sm-6">
              <label class="form-label fw-semibold" for="resource-type">
                Filter by resource type
              </label>
              <select id="resource-type" v-model="selectedType" class="form-select">
                <option value="">All Types</option>
                <option v-for="type in resourceTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
        <h2 class="h4 mb-0">Available resources</h2>
        <span class="text-secondary text-nowrap" role="status" aria-live="polite">
          {{ filteredResources.length }}
          {{ filteredResources.length === 1 ? 'resource' : 'resources' }}
        </span>
      </div>

      <div v-if="filteredResources.length" class="row g-4">
        <div
          v-for="resource in filteredResources"
          :key="resource.id"
          class="col-12 col-sm-6 col-lg-4"
        >
          <ResourceCard
            :title="resource.title"
            :category="resource.category"
            :type="resource.type"
            :description="resource.description"
          />
        </div>
      </div>

      <div v-else class="alert alert-light border text-center py-4" role="status">
        No resources match the selected filters.
      </div>
    </div>
  </section>
</template>
