<script setup>
import { BarChart3, BookOpen, Calculator, CalendarDays, ChevronRight, Database, Heart, MapPinned, Recycle, Share2, WifiOff } from '@lucide/vue'
import { RouterLink } from 'vue-router'

const workflowSteps = [
  { number: '01', title: 'Learn', feature: 'Recycling Guide', description: 'Look up common household items and understand the appropriate recycling or disposal pathway.', cta: 'Learn how to recycle', to: '/recycling-guide', icon: Recycle },
  { number: '02', title: 'Find & Navigate', feature: 'Recycling Location Finder', description: 'Explore verified facilities, choose a suitable destination and plan a real driving route.', cta: 'Find a recycling centre', to: '/locations', icon: MapPinned },
  { number: '03', title: 'Understand Your Impact', feature: 'Environmental Impact Calculator', description: 'Explore educational recycling and landfill estimates using documented US EPA WARM factors.', cta: 'Explore impact estimates', to: '/impact-calculator', icon: Calculator },
]

const discoverFeatures = [
  { title: 'Resources', description: 'Practical waste-reduction guides, checklists and everyday tips.', cta: 'Browse resources', to: '/resources', icon: BookOpen },
  { title: 'Community Events', description: 'Find local sustainability activities and community learning opportunities.', cta: 'View events', to: '/events', icon: CalendarDays },
  { title: 'Recycling Analytics', description: 'Explore charts and category summaries from GreenLoop’s guide dataset.', cta: 'Explore analytics', to: '/analytics', icon: BarChart3 },
  { title: 'Interactive Data', description: 'Search, filter, sort and export recycling and resource information.', cta: 'Explore data', to: '/interactive-data', icon: Database },
  { title: 'Offline Recycling Guide', description: 'Access previously cached static guidance when connectivity is unavailable.', cta: 'Open offline guide', to: '/offline-guide', icon: WifiOff },
]

const personalFeatures = [
  { title: 'My Favourites', description: 'Save useful recycling guidance to your GreenLoop account and return to it later.', cta: 'View favourites', to: '/favourites', icon: Heart },
  { title: 'Share Recycling Information', description: 'Select GreenLoop guidance and share it by email with a CSV attachment.', cta: 'Share information', to: '/share-email', icon: Share2 },
]
</script>

<template>
  <div class="home-page">
    <section class="home-hero" aria-labelledby="home-heading">
      <div class="container position-relative">
        <div class="row align-items-center g-4 g-xl-5">
          <div class="col-12 col-lg-7">
            <p class="hero-eyebrow mb-3">A practical sustainability platform for Melbourne</p>
            <h1 id="home-heading" class="hero-title mb-3">Recycle with clarity.<br />Live with less waste.</h1>
            <p class="hero-copy mb-4">Learn how to recycle an item, find a suitable facility and plan your next step with clear, accessible tools.</p>
            <RouterLink class="btn btn-success btn-lg hero-primary" to="/recycling-guide">
              Start Recycling <ChevronRight :size="20" aria-hidden="true" />
            </RouterLink>
          </div>
          <div class="col-12 col-lg-5" aria-hidden="true">
            <div class="hero-visual">
              <div class="hero-orbit hero-orbit-large"></div>
              <div class="hero-orbit hero-orbit-small"></div>
              <div class="hero-icon hero-icon-main"><Recycle :size="58" :stroke-width="1.7" /></div>
              <div class="hero-icon hero-icon-map"><MapPinned :size="27" /></div>
              <div class="hero-icon hero-icon-chart"><BarChart3 :size="27" /></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="workflow-section" aria-labelledby="workflow-heading">
      <div class="container">
        <div class="section-intro mx-auto text-center">
          <p class="section-eyebrow mb-2">Your recycling journey</p>
          <h2 id="workflow-heading" class="display-6 fw-bold mb-3">How to Recycle with GreenLoop</h2>
          <p class="lead text-secondary mb-0">Move from a recycling question to a suitable destination, then explore the documented environmental context.</p>
        </div>

        <ol class="workflow-list row g-4 list-unstyled mb-0">
          <li v-for="step in workflowSteps" :key="step.to" class="col-12 col-lg-4">
            <article class="workflow-card card h-100">
              <div class="card-body d-flex flex-column p-4">
                <div class="d-flex align-items-center justify-content-between mb-4">
                  <span class="feature-icon" aria-hidden="true"><component :is="step.icon" :size="27" :stroke-width="1.8" /></span>
                  <span class="step-number" aria-hidden="true">{{ step.number }}</span>
                </div>
                <p class="step-title mb-1">Step {{ Number(step.number) }} · {{ step.title }}</p>
                <h3 class="h4 fw-bold">{{ step.feature }}</h3>
                <p class="text-secondary flex-grow-1">{{ step.description }}</p>
                <RouterLink class="feature-link stretched-link" :to="step.to">{{ step.cta }} <ChevronRight :size="18" aria-hidden="true" /></RouterLink>
              </div>
            </article>
          </li>
        </ol>
      </div>
    </section>

    <section class="discover-section" aria-labelledby="discover-heading">
      <div class="container">
        <div class="row align-items-end g-3 mb-4">
          <div class="col-12 col-lg-8">
            <p class="section-eyebrow mb-2">Discover</p>
            <h2 id="discover-heading" class="display-6 fw-bold mb-2">Discover More</h2>
            <p class="lead text-secondary mb-0">Continue learning through practical resources, community activities and transparent data tools.</p>
          </div>
        </div>
        <div class="discover-grid">
          <article v-for="feature in discoverFeatures" :key="feature.to" class="home-feature-card card h-100">
            <div class="card-body d-flex flex-column p-4">
              <div class="feature-icon mb-4" aria-hidden="true"><component :is="feature.icon" :size="25" :stroke-width="1.8" /></div>
              <h3 class="h5 fw-bold">{{ feature.title }}</h3>
              <p class="text-secondary flex-grow-1">{{ feature.description }}</p>
              <RouterLink class="feature-link stretched-link" :to="feature.to">{{ feature.cta }} <ChevronRight :size="18" aria-hidden="true" /></RouterLink>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="personal-section" aria-labelledby="personal-heading">
      <div class="container">
        <div class="row align-items-end g-3 mb-4">
          <div class="col-12 col-lg-8">
            <p class="section-eyebrow mb-2">My GreenLoop</p>
            <h2 id="personal-heading" class="display-6 fw-bold mb-2">Save and Share</h2>
            <p class="lead text-secondary mb-0">Keep useful guidance connected to your account or share selected information with others.</p>
          </div>
        </div>
        <div class="row g-4">
          <div v-for="feature in personalFeatures" :key="feature.to" class="col-12 col-md-6">
            <article class="home-feature-card card h-100">
              <div class="card-body d-flex flex-column p-4">
                <div class="feature-icon mb-4" aria-hidden="true"><component :is="feature.icon" :size="25" :stroke-width="1.8" /></div>
                <h3 class="h5 fw-bold">{{ feature.title }}</h3>
                <p class="text-secondary flex-grow-1">{{ feature.description }}</p>
                <RouterLink class="feature-link stretched-link" :to="feature.to">{{ feature.cta }} <ChevronRight :size="18" aria-hidden="true" /></RouterLink>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page { overflow-x: clip; background: var(--gl-surface); }
.home-hero { position: relative; overflow: hidden; padding-block: clamp(3.75rem, 7vw, 6.5rem); background: radial-gradient(circle at 84% 25%, rgb(115 193 137 / 24%), transparent 25rem), linear-gradient(135deg, #edf8f0 0%, #f8fcf9 58%, #e5f4ea 100%); }
.home-hero::after { position: absolute; right: -8rem; bottom: -12rem; width: 28rem; height: 28rem; border: 1px solid rgb(25 135 84 / 18%); border-radius: 50%; content: ''; }
.hero-eyebrow, .section-eyebrow { color: var(--gl-green-700); font-size: 0.78rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
.hero-title { max-width: 13ch; color: var(--gl-green-900); font-size: clamp(2.55rem, 6vw, 5rem); font-weight: 800; letter-spacing: -0.055em; line-height: 0.98; }
.hero-copy { max-width: 42rem; color: #375d47; font-size: clamp(1.08rem, 2vw, 1.3rem); line-height: 1.65; }
.hero-primary, .feature-link { display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; font-weight: 700; }
.hero-visual { position: relative; width: min(100%, 24rem); aspect-ratio: 1; margin-inline: auto; }
.hero-orbit, .hero-icon { position: absolute; border-radius: 50%; }
.hero-orbit { inset: 8%; border: 1px solid rgb(18 101 62 / 28%); }
.hero-orbit-small { inset: 24%; border-style: dashed; }
.hero-icon { display: grid; color: #fff; background: var(--gl-green-600); box-shadow: 0 1rem 2.5rem rgb(11 79 48 / 24%); place-items: center; }
.hero-icon-main { inset: 31%; }
.hero-icon-map, .hero-icon-chart { width: 4.2rem; height: 4.2rem; color: var(--gl-green-700); background: var(--gl-surface); }
.hero-icon-map { top: 3%; right: 13%; }
.hero-icon-chart { bottom: 7%; left: 8%; }
.workflow-section, .discover-section, .personal-section { padding-block: clamp(3.5rem, 6vw, 5.5rem); }
.section-intro { max-width: 50rem; margin-bottom: clamp(2.5rem, 5vw, 4rem); }
.workflow-list { position: relative; }
.workflow-list::before { position: absolute; top: 3.65rem; right: 16%; left: 16%; z-index: 0; border-top: 2px dashed #9bc9aa; content: ''; }
.workflow-list > li { position: relative; z-index: 1; }
.workflow-card, .home-feature-card { border: 1px solid var(--gl-border); border-radius: var(--gl-card-radius); box-shadow: var(--gl-card-shadow); transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease; }
.workflow-card:hover, .workflow-card:focus-within, .home-feature-card:hover, .home-feature-card:focus-within { border-color: #98c9a8; box-shadow: 0 1rem 2.2rem rgb(23 60 37 / 13%); transform: translateY(-0.25rem); }
.feature-icon { display: inline-grid; width: 3.25rem; height: 3.25rem; flex: 0 0 auto; border-radius: 0.8rem; color: var(--gl-green-700); background: var(--gl-green-100); place-items: center; }
.step-number { color: #82a98e; font-size: 1.25rem; font-weight: 800; letter-spacing: 0.08em; }
.step-title { color: var(--gl-green-700); font-size: 0.8rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }
.feature-link { justify-content: flex-start; color: #0b6639; text-decoration: none; }
.feature-link:hover { color: #084d2c; }
.discover-section { background: var(--gl-surface-soft); }
.discover-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 1.25rem; }
.personal-section { padding-bottom: clamp(4rem, 7vw, 6rem); }
@media (max-width: 1199.98px) { .discover-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .discover-grid > :last-child { grid-column: 1 / -1; } }
@media (max-width: 991.98px) { .hero-visual { width: min(76vw, 21rem); } .workflow-list::before { display: none; } }
@media (max-width: 575.98px) { .home-hero { padding-block: 3.25rem; } .hero-title { font-size: clamp(2.35rem, 12vw, 3.25rem); } .hero-visual { width: min(84vw, 18rem); } .discover-grid { grid-template-columns: 1fr; } .discover-grid > :last-child { grid-column: auto; } }
@media (prefers-reduced-motion: reduce) { .workflow-card, .home-feature-card { transition: none; } .workflow-card:hover, .workflow-card:focus-within, .home-feature-card:hover, .home-feature-card:focus-within { transform: none; } }
</style>
