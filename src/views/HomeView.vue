<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="hero-section py-4" aria-labelledby="home-heading">
    <div class="container">
      <div class="row">
        <div class="col-12 col-lg-9 col-xl-8">
          <h1 id="home-heading" class="display-5 fw-bold">GreenLoop Melbourne</h1>
          <p class="lead mb-0">
            Helping Melbourne residents recycle smarter, reduce waste and connect with local
            sustainability initiatives.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="feature-section page-section" aria-labelledby="features-heading">
    <div class="container">
      <div class="row mb-4">
        <div class="col-12 col-lg-8">
          <p class="text-success fw-semibold text-uppercase mb-2">What you can discover</p>
          <h2 id="features-heading" class="display-6 fw-bold">Three ways to make a difference</h2>
          <p class="lead mb-0">
            Find clear information and local opportunities for more sustainable living in Melbourne.
          </p>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-md-6 col-lg-4">
          <article class="card feature-card h-100 shadow-sm">
            <div class="card-body d-flex flex-column p-4">
              <h3 class="h4 card-title">Recycling Guide</h3>
              <p class="card-text flex-grow-1">
                Learn how to recycle common household items correctly and find suitable recycling
                options.
              </p>
              <RouterLink class="btn btn-success align-self-start" to="/recycling-guide">
                Explore Recycling Guide
              </RouterLink>
            </div>
          </article>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <article class="card feature-card h-100 shadow-sm">
            <div class="card-body d-flex flex-column p-4">
              <h3 class="h4 card-title">Waste Reduction Resources</h3>
              <p class="card-text flex-grow-1">
                Discover practical guides, tips and resources to help reduce everyday household waste.
              </p>
              <RouterLink class="btn btn-success align-self-start" to="/resources">
                View Resources
              </RouterLink>
            </div>
          </article>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <article class="card feature-card h-100 shadow-sm">
            <div class="card-body d-flex flex-column p-4">
              <h3 class="h4 card-title">Community Events</h3>
              <p class="card-text flex-grow-1">
                Discover upcoming sustainability and recycling events in Melbourne.
              </p>
              <RouterLink class="btn btn-success align-self-start" to="/events">
                View Events
              </RouterLink>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
