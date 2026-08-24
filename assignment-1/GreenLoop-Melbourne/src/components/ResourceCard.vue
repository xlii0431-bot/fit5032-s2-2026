<script setup>
defineProps({
  title: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
})
</script>

<template>
  <article class="card h-100 shadow-sm border-success-subtle">
    <div class="card-body p-4">
      <div class="d-flex flex-wrap gap-2 mb-3">
        <span class="badge text-bg-success">{{ category }}</span>
        <span class="badge text-bg-light border text-secondary">{{ type }}</span>
      </div>
      <h2 class="h5 card-title">{{ title }}</h2>
      <p class="card-text mb-0">{{ description }}</p>
    </div>
  </article>
</template>
