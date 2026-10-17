<script setup>
import { nextTick, ref } from 'vue'
import { CircleHelp, ExternalLink, MessageCircle, X } from '@lucide/vue'
import { RouterLink } from 'vue-router'

const topics = [
  { id: 'guide', question: 'How do I recycle an item?', answer: 'Use the Recycling Guide to search common items and read the appropriate disposal guidance.', label: 'Open Recycling Guide', to: '/recycling-guide' },
  { id: 'locations', question: 'Where can I take recycling?', answer: 'Find verified recycling centres, select a destination and plan a driving route.', label: 'Open Location Finder', to: '/locations' },
  { id: 'impact', question: 'How can I compare environmental impact?', answer: 'Use documented EPA WARM factors to compare supported recycling and landfill scenarios.', label: 'Open Impact Calculator', to: '/impact-calculator' },
  { id: 'favourites', question: 'Where are my saved items?', answer: 'My Favourites contains the recycling guidance saved to your signed-in account.', label: 'Open My Favourites', to: '/favourites' },
  { id: 'analytics', question: 'Where can I explore recycling data?', answer: 'Recycling Analytics summarises GreenLoop’s educational guide dataset with filters and accessible charts.', label: 'Open Recycling Analytics', to: '/analytics' },
  { id: 'offline', question: 'Can I use guidance offline?', answer: 'The Offline Guide explains installation, connection and cached-guidance availability.', label: 'Open Offline Guide', to: '/offline-guide' },
]

const isOpen = ref(false)
const selectedTopic = ref(null)
const launcher = ref(null)
const panel = ref(null)

async function openGuide() {
  isOpen.value = true
  await nextTick()
  panel.value?.querySelector('.guide-close')?.focus()
}

async function closeGuide() {
  isOpen.value = false
  await nextTick()
  launcher.value?.focus()
}

function chooseTopic(topic) {
  selectedTopic.value = topic
  nextTick(() => panel.value?.querySelector('.guide-answer a')?.focus())
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeGuide()
  }
}
</script>

<template>
  <aside class="greenloop-guide" aria-label="GreenLoop Guide">
    <section
      v-if="isOpen"
      id="greenloop-guide-panel"
      ref="panel"
      class="guide-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="guide-title"
      @keydown="handleKeydown"
    >
      <header class="guide-header">
        <div>
          <h2 id="guide-title" class="h5 mb-1">GreenLoop Guide</h2>
          <p class="small mb-0">Choose a task and I’ll point you to the right page.</p>
        </div>
        <button class="btn btn-sm guide-close" type="button" aria-label="Close GreenLoop Guide" @click="closeGuide">
          <X :size="19" aria-hidden="true" />
        </button>
      </header>

      <div class="guide-body">
        <p class="guide-welcome"><CircleHelp :size="18" aria-hidden="true" /> What would you like help with?</p>
        <div class="guide-topics" aria-label="Guide questions">
          <button v-for="topic in topics" :key="topic.id" class="guide-topic" type="button" @click="chooseTopic(topic)">
            {{ topic.question }}
          </button>
        </div>

        <div v-if="selectedTopic" class="guide-answer" aria-live="polite">
          <p>{{ selectedTopic.answer }}</p>
          <RouterLink class="btn btn-success btn-sm" :to="selectedTopic.to" @click="closeGuide">
            {{ selectedTopic.label }} <ExternalLink :size="15" aria-hidden="true" />
          </RouterLink>
        </div>
      </div>
    </section>

    <button
      ref="launcher"
      class="guide-launcher"
      type="button"
      aria-controls="greenloop-guide-panel"
      :aria-expanded="isOpen"
      aria-label="Open GreenLoop Guide"
      @click="isOpen ? closeGuide() : openGuide()"
    >
      <MessageCircle :size="21" aria-hidden="true" />
      <span>Guide</span>
    </button>
  </aside>
</template>
