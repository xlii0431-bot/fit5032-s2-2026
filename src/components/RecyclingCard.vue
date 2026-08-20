<script setup>
defineProps({
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  disposal: { type: String, default: 'Disposal information coming soon.' },
})
</script>

<template>
  <article class="card h-100 recycling-card">
    <div class="card-body">
      <h2 class="h5 card-title">{{ name }}</h2>
      <p class="mb-2"><span class="fw-semibold">Category:</span> {{ category }}</p>
      <p class="card-text mb-0">{{ disposal }}</p>
    </div>
  </article>
</template>
