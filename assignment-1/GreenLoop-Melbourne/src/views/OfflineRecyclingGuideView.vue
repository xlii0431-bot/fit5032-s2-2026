<script setup>
import { recyclingItems } from '../data/recyclingItems'
</script>

<template>
  <section class="page-section" aria-labelledby="offline-recycling-heading">
    <div class="container">
      <p class="text-success fw-semibold text-uppercase mb-2">Saved static guidance</p>
      <h1 id="offline-recycling-heading">Offline Recycling Guide</h1>
      <p class="lead">Use this bundled guide to check common disposal instructions without an internet connection.</p>
      <div class="alert alert-info">This guide contains general educational information. Local council requirements may change, so confirm current instructions when you are back online.</div>

      <div class="row g-4 mt-1">
        <div v-for="item in recyclingItems" :key="item.id" class="col-12 col-md-6 col-xl-4">
          <article class="card h-100 border-0 shadow-sm p-4">
            <p class="text-success fw-semibold mb-2">{{ item.category }}</p>
            <h2 class="h4">{{ item.name }}</h2>
            <p>{{ item.description }}</p>
            <h3 class="h6">Why it matters</h3>
            <p>{{ item.whyItMatters }}</p>
            <h3 class="h6">How to dispose of it</h3>
            <p class="mb-0">{{ item.disposal }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
