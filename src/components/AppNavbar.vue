<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-success" aria-label="Main navigation">
    <div class="container">
      <RouterLink class="navbar-brand fw-semibold" to="/">
        GreenLoop Melbourne
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavigation"
        aria-controls="mainNavigation"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="mainNavigation" class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto mb-2 mb-md-0">
          <li class="nav-item"><RouterLink class="nav-link" to="/">Home</RouterLink></li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/recycling-guide">Recycling Guide</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/resources">Resources</RouterLink>
          </li>
          <li class="nav-item"><RouterLink class="nav-link" to="/events">Events</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/about">About</RouterLink></li>
        </ul>
      </div>
    </div>
  </nav>
</template>
