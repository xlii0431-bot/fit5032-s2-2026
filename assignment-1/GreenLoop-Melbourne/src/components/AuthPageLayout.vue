<script setup>
import { RouterLink } from 'vue-router'
import RecyclingOrbitIllustration from './illustrations/RecyclingOrbitIllustration.vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
})
</script>

<template>
  <section class="auth-section">
    <div class="container">
      <div class="auth-shell mx-auto overflow-hidden shadow-sm">
        <div class="row g-0">
          <aside class="auth-brand-panel col-12 col-lg-5 p-4 p-md-5 text-white">
            <RouterLink class="auth-brand-link" to="/">GreenLoop Melbourne</RouterLink>
            <RecyclingOrbitIllustration class="auth-brand-illustration" />
            <div class="auth-brand-content">
              <p class="text-uppercase small fw-semibold mb-2">A greener Melbourne starts here</p>
              <p class="display-6 fw-semibold mb-3">Recycle smarter. Waste less.</p>
              <p class="mb-0 text-white">
                Access trusted recycling guidance, community resources and local sustainability
                tools in one place.
              </p>
            </div>
          </aside>

          <div class="col-12 col-lg-7 bg-white p-4 p-sm-5">
            <div class="auth-form mx-auto">
              <h1 class="h2 mb-2">{{ title }}</h1>
              <p class="text-secondary mb-4">{{ subtitle }}</p>
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.auth-section {
  padding-block: clamp(2rem, 6vw, 5rem);
  background:
    radial-gradient(circle at top right, rgb(25 135 84 / 12%), transparent 32rem),
    #f7faf7;
}

.auth-shell {
  max-width: 64rem;
  border: 1px solid #d9e6dc;
  border-radius: 1.25rem;
  background: #fff;
}

.auth-brand-panel {
  display: flex;
  min-height: 18rem;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(145deg, #0d5f38 0%, #146c43 65%, #237a49 100%);
}

.auth-brand-link {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  text-decoration: none;
}

.auth-brand-content {
  max-width: 24rem;
}

.auth-brand-illustration {
  width: min(100%, 19rem);
  margin: 1rem auto;
}

.auth-form {
  max-width: 28rem;
}

@media (min-width: 992px) {
  .auth-brand-panel {
    min-height: 42rem;
  }
}

@media (max-width: 575.98px) {
  .auth-brand-illustration {
    display: none;
  }
}
</style>
