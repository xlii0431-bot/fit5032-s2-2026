<script setup>
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'
import { Download, FileText } from '@lucide/vue'
import { computed, ref } from 'vue'
import { recyclingItems } from '../data/recyclingItems'
import { summarizeRecyclingItems } from '../utils/analytics'
import { createCsvContent, downloadCsv } from '../utils/csv'

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip)

const selectedCategories = ref([])
const categoryChart = ref(null)
const pathwayChart = ref(null)
const isExportingPdf = ref(false)
const exportError = ref('')
const categories = [...new Set(recyclingItems.map((item) => item.category))].sort()
const summary = computed(() => summarizeRecyclingItems(recyclingItems, selectedCategories.value))
const categoryChartData = computed(() => ({
  labels: Object.keys(summary.value.categoryCounts),
  datasets: [
    {
      label: 'Household recycling',
      data: Object.values(summary.value.categoryPathwayCounts).map(({ householdRecycling }) => householdRecycling),
      backgroundColor: '#198754',
      borderColor: '#0b4f30',
      borderWidth: 1,
    },
    {
      label: 'Special disposal',
      data: Object.values(summary.value.categoryPathwayCounts).map(({ specialDisposal }) => specialDisposal),
      backgroundColor: '#9a6a12',
      borderColor: '#6b4a00',
      borderWidth: 1,
    },
  ],
}))
const pathwayChartData = computed(() => ({
  labels: ['Household recycling pathway', 'Special disposal pathway'],
  datasets: [
    {
      data: [summary.value.recyclableCount, summary.value.specialDisposalCount],
      backgroundColor: ['#198754', '#9a6a12'],
      borderColor: '#ffffff',
      borderWidth: 2,
    },
  ],
}))
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#243229' } },
    tooltip: {
      callbacks: {
        title: (items) => items[0]?.label || '',
        label: (context) => {
          const count = context.parsed.y
          return `${context.dataset.label}: ${count} ${count === 1 ? 'entry' : 'entries'}`
        },
      },
    },
  },
  scales: {
    x: { stacked: true },
    y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
  },
}
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { color: '#243229' } } },
}

function exportCsv() {
  const columns = [
    { key: 'name', label: 'Guide entry' },
    { key: 'category', label: 'Category' },
    { key: 'pathway', label: 'Guidance pathway' },
    { key: 'description', label: 'Description' },
    { key: 'disposal', label: 'Disposal guidance' },
  ]
  const content = createCsvContent(columns, summary.value.filteredItems, (item, column) =>
    column.key === 'pathway'
      ? item.recyclable ? 'Household recycling' : 'Special disposal'
      : item[column.key],
  )
  downloadCsv('greenloop-recycling-analytics.csv', content)
}

function getChartImage(chartComponent, title) {
  const canvas = chartComponent.value?.chart?.canvas
  if (!canvas) return null
  return { title, dataUrl: canvas.toDataURL('image/png', 1), aspectRatio: canvas.width / canvas.height }
}

async function exportPdf() {
  isExportingPdf.value = true
  exportError.value = ''
  try {
    const { downloadAnalyticsPdf } = await import('../utils/analyticsPdf')
    downloadAnalyticsPdf({
      summary: summary.value,
      selectedCategories: selectedCategories.value,
      totalEntries: recyclingItems.length,
      chartImages: [
        getChartImage(categoryChart, 'Guide entries by category chart'),
        getChartImage(pathwayChart, 'Guidance pathway breakdown chart'),
      ].filter(Boolean),
    })
  } catch (error) {
    exportError.value = 'The PDF could not be generated. Please try again or use the CSV export.'
    if (import.meta.env.DEV) console.error('Analytics PDF export failed', error)
  } finally {
    isExportingPdf.value = false
  }
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="d-flex flex-column flex-lg-row align-items-lg-start justify-content-between gap-3 mb-3">
        <div>
          <h1>Recycling Analytics Dashboard</h1>
          <p class="lead mb-0">Explore the composition of GreenLoop's demonstration recycling guide.</p>
        </div>
        <div class="d-flex flex-wrap gap-2 export-actions" aria-label="Analytics exports">
          <button class="btn btn-outline-success" type="button" @click="exportCsv">
            <Download :size="18" aria-hidden="true" /> Export CSV
          </button>
          <button class="btn btn-success" type="button" :disabled="isExportingPdf" :aria-busy="isExportingPdf" @click="exportPdf">
            <FileText :size="18" aria-hidden="true" />
            {{ isExportingPdf ? 'Creating PDF…' : 'Export PDF' }}
          </button>
        </div>
      </div>

      <p v-if="exportError" class="alert alert-danger" role="alert">{{ exportError }}</p>

      <div class="alert alert-info">
        <strong>Dataset scope:</strong> {{ recyclingItems.length }} educational guide entries from
        GreenLoop's local JavaScript dataset. These charts describe application content only; they
        are not Melbourne recycling volumes, participation rates or environmental outcomes.
      </div>

      <fieldset class="card border-0 shadow-sm p-4 mb-4">
        <legend class="h2 fs-5 float-none w-auto px-1">Filter categories</legend>
        <div class="d-flex flex-wrap gap-3">
          <div v-for="category in categories" :key="category" class="form-check">
            <input
              :id="`analytics-${category}`"
              v-model="selectedCategories"
              class="form-check-input"
              type="checkbox"
              :value="category"
            />
            <label class="form-check-label" :for="`analytics-${category}`">{{ category }}</label>
          </div>
        </div>
        <button
          class="btn btn-sm btn-outline-secondary align-self-start mt-3"
          type="button"
          :disabled="selectedCategories.length === 0"
          @click="selectedCategories = []"
        >
          Show all categories
        </button>
      </fieldset>

      <p role="status" aria-live="polite">
        Showing {{ summary.filteredItems.length }} of {{ recyclingItems.length }} guide entries.
      </p>

      <div class="row g-4">
        <div class="col-12 col-lg-7">
          <article class="card border-0 shadow-sm h-100 p-4">
            <h2 class="h4">Guide entries by category</h2>
            <div
              class="chart-container"
              role="img"
              :aria-label="`Stacked bar chart: ${Object.entries(summary.categoryPathwayCounts).map(([category, counts]) => `${category}: ${counts.householdRecycling} household recycling and ${counts.specialDisposal} special disposal, ${counts.total} total`).join('; ') || 'no matching entries'}`"
            >
              <Bar ref="categoryChart" :data="categoryChartData" :options="chartOptions" aria-hidden="true" />
            </div>
          </article>
        </div>
        <div class="col-12 col-lg-5">
          <article class="card border-0 shadow-sm h-100 p-4">
            <h2 class="h4">Guidance pathway split</h2>
            <div
              class="chart-container"
              role="img"
              :aria-label="`Doughnut chart: ${summary.recyclableCount} household recycling entries and ${summary.specialDisposalCount} special disposal entries`"
            >
              <Doughnut ref="pathwayChart" :data="pathwayChartData" :options="doughnutOptions" aria-hidden="true" />
            </div>
          </article>
        </div>
      </div>

      <section class="card border-0 shadow-sm p-4 mt-4" aria-labelledby="analytics-summary">
        <h2 id="analytics-summary" class="h4">Accessible data summary</h2>
        <ul class="mb-3">
          <li>{{ summary.recyclableCount }} entries use a household recycling pathway.</li>
          <li>{{ summary.specialDisposalCount }} entries require special disposal.</li>
          <li>{{ summary.withLocationCount }} entries contain example location information.</li>
        </ul>
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <caption>Counts of filtered GreenLoop guide entries by category</caption>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Household recycling</th>
                <th scope="col">Special disposal</th>
                <th scope="col">Total entries</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(counts, category) in summary.categoryPathwayCounts" :key="category">
                <th scope="row">{{ category }}</th>
                <td>{{ counts.householdRecycling }}</td>
                <td>{{ counts.specialDisposal }}</td>
                <td>{{ counts.total }}</td>
              </tr>
              <tr v-if="summary.filteredItems.length === 0">
                <td colspan="4">No entries match the selected categories.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.chart-container {
  min-height: 22rem;
}

.export-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.card {
  border-color: var(--gl-border) !important;
  border-radius: var(--gl-card-radius);
}

@media (max-width: 575.98px) {
  .export-actions,
  .export-actions .btn {
    width: 100%;
  }
}
</style>
