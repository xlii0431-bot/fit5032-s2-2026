<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="hero-section py-5 py-lg-6">
    <div class="container">
      <div class="row align-items-center g-4">
        <div class="col-12 col-lg-8 col-xl-7">
          <p class="text-success fw-semibold text-uppercase mb-2">Recycle with confidence</p>
          <h1 class="display-4 fw-bold">GreenLoop Melbourne</h1>
          <p class="lead mb-4">Helping Melbourne residents make better recycling decisions.</p>
          <p class="mb-4">
            Our Recycling Guide is being developed to make everyday disposal choices clearer and
            connect residents with practical local options.
          </p>
          <div class="d-flex flex-column flex-sm-row gap-3">
            <RouterLink class="btn btn-success btn-lg" to="/recycling-guide">
              Explore the Recycling Guide
            </RouterLink>
            <RouterLink class="btn btn-outline-success btn-lg" to="/locations">
              Find Locations
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
