<script setup>
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'
import { Bar } from 'vue-chartjs'
import { computed, ref } from 'vue'
import { impactMaterials, impactSources } from '../data/impactFactors'
import { calculateAvoidedEmissions } from '../utils/impact'

ChartJS.register(BarElement, CategoryScale, Legend, LinearScale, Tooltip)

const materialId = ref('mixed-recyclables')
const weightKg = ref('10')
const touched = ref(false)
const supportedMaterials = impactMaterials.filter(({ supported }) => supported)
const unsupportedMaterials = impactMaterials.filter(({ supported }) => !supported)
const material = computed(() => impactMaterials.find(({ id }) => id === materialId.value))
const result = computed(() => calculateAvoidedEmissions(weightKg.value, material.value))
const hasComparison = computed(() =>
  material.value?.supported
  && !result.value.error
  && !result.value.unavailable
  && Number.isFinite(result.value.recyclingKgCo2e)
  && Number.isFinite(result.value.landfillKgCo2e),
)
const comparisonChartData = computed(() => ({
  labels: ['Recycling', 'Landfilling'],
  datasets: [{
    label: 'Net emissions (kg CO₂e)',
    data: hasComparison.value
      ? [result.value.recyclingKgCo2e, result.value.landfillKgCo2e]
      : [],
    backgroundColor: ['#198754', '#9a6a12'],
    borderColor: ['#0b4f30', '#6b4a00'],
    borderWidth: 1,
  }],
}))
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      title: { display: true, text: 'Net kg CO₂e' },
      ticks: { color: '#243229' },
      grid: { color: '#d8e3dc' },
    },
    x: { ticks: { color: '#243229' } },
  },
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-xl-10">
          <h1>Environmental Impact Calculator</h1>
          <p class="lead">Compare documented recycling and landfill scenarios for a selected material.</p>

          <div class="alert alert-warning">
            This educational calculator uses US EPA WARM Version 16 national-average life-cycle factors,
            not Melbourne-specific measurements. Results are indicative and are not suitable for carbon
            inventories, compliance reporting or claims about an individual's actual impact.
          </div>

          <div class="card border-0 shadow-sm p-4 p-md-5">
            <div class="row g-4">
              <div class="col-12 col-md-7">
                <label class="form-label fw-semibold" for="impact-material">Material</label>
                <select id="impact-material" v-model="materialId" class="form-select">
                  <optgroup label="Supported materials — calculations available">
                    <option v-for="option in supportedMaterials" :key="option.id" :value="option.id">
                      {{ option.name }}
                    </option>
                  </optgroup>
                  <optgroup label="Unsupported materials — estimate unavailable">
                    <option v-for="option in unsupportedMaterials" :key="option.id" :value="option.id">
                      {{ option.name }} — estimate unavailable
                    </option>
                  </optgroup>
                </select>
              </div>
              <div class="col-12 col-md-5">
                <label class="form-label fw-semibold" for="impact-weight">Weight (kg)</label>
                <input
                  id="impact-weight"
                  v-model="weightKg"
                  class="form-control"
                  :class="{ 'is-invalid': touched && result.error }"
                  type="number"
                  min="0.01"
                  max="10000"
                  step="0.01"
                  inputmode="decimal"
                  :aria-invalid="Boolean(touched && result.error)"
                  :aria-describedby="touched && result.error ? 'impact-weight-error' : 'impact-help'"
                  @blur="touched = true"
                  @input="touched = true"
                />
                <div id="impact-help" class="form-text">Enter 0.01–10,000 kilograms.</div>
                <div v-if="touched && result.error" id="impact-weight-error" class="invalid-feedback d-block" role="alert">
                  {{ result.error }}
                </div>
              </div>
            </div>

            <p v-if="material?.definition" class="small text-secondary mt-3 mb-0">
              <strong>Material definition:</strong> {{ material.definition }}
            </p>

            <div class="mt-4" role="status" aria-live="polite">
              <div v-if="material && !material.supported" class="alert alert-info mb-0">
                <h2 class="h5 alert-heading">Estimate unavailable</h2>
                <p class="mb-0">
                  This selection does not identify a material-specific WARM category, so applying another
                  material's coefficient would be misleading. Select a material from the supported group
                  to calculate and compare emissions.
                </p>
              </div>
              <div v-else-if="!result.error && !result.unavailable" class="row g-3 impact-results">
                <div class="col-12 col-md-4">
                  <article class="result-card recycling-result h-100 rounded-3 p-3">
                    <h2 class="h6 text-uppercase mb-2">Recycling emissions</h2>
                    <p class="h3 mb-1">{{ result.recyclingKgCo2e.toFixed(2) }}</p>
                    <p class="small mb-0">kg CO₂e</p>
                  </article>
                </div>
                <div class="col-12 col-md-4">
                  <article class="result-card landfill-result h-100 rounded-3 p-3">
                    <h2 class="h6 text-uppercase mb-2">Landfilling emissions</h2>
                    <p class="h3 mb-1">{{ result.landfillKgCo2e.toFixed(2) }}</p>
                    <p class="small mb-0">kg CO₂e</p>
                  </article>
                </div>
                <div class="col-12 col-md-4">
                  <article class="result-card avoided-result h-100 rounded-3 p-3">
                    <h2 class="h6 text-uppercase mb-2">Estimated avoided</h2>
                    <p class="h3 mb-1">{{ result.kgCo2eAvoided.toFixed(2) }}</p>
                    <p class="small mb-0">kg CO₂e</p>
                  </article>
                </div>
              </div>
            </div>

            <section v-if="hasComparison" class="mt-4" aria-labelledby="impact-comparison">
              <h2 id="impact-comparison" class="h4">Recycling versus landfill comparison</h2>
              <p class="text-secondary">
                Negative recycling values represent net life-cycle reductions or credits in WARM.
              </p>
              <div
                class="impact-chart"
                role="img"
                :aria-label="`Bar chart for ${weightKg} kilograms of ${material.name}: recycling ${result.recyclingKgCo2e.toFixed(2)} kilograms CO2 equivalent and landfilling ${result.landfillKgCo2e.toFixed(2)} kilograms CO2 equivalent.`"
              >
                <Bar :data="comparisonChartData" :options="chartOptions" aria-hidden="true" />
              </div>
              <div class="table-responsive mt-3">
                <table class="table table-sm mb-0">
                  <caption>Accessible values shown in the recycling and landfill comparison chart</caption>
                  <thead><tr><th scope="col">Scenario</th><th scope="col">Net emissions</th></tr></thead>
                  <tbody>
                    <tr><th scope="row">Recycling</th><td>{{ result.recyclingKgCo2e.toFixed(2) }} kg CO₂e</td></tr>
                    <tr><th scope="row">Landfilling</th><td>{{ result.landfillKgCo2e.toFixed(2) }} kg CO₂e</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="mt-4" aria-labelledby="impact-method">
              <h2 id="impact-method" class="h4">Method, assumptions and sources</h2>
              <template v-if="material?.supported">
                <p>
                  <strong>WARM factors:</strong> recycling {{ material.recyclingMtCo2ePerShortTon }} and
                  landfilling {{ material.landfillMtCo2ePerShortTon }} metric tonnes CO₂e per US short ton.
                </p>
                <p><strong>Baseline:</strong> the WARM default US national-average landfill scenario.</p>
                <p>
                  <strong>Formula:</strong> weight (kg) × [(landfill factor − recycling factor) ×
                  1,000 ÷ 907.18474] = kg CO₂e avoided.
                </p>
                <p><strong>Converted coefficient:</strong> {{ material.kgCo2eAvoidedPerKg.toFixed(4) }} kg CO₂e avoided per kg.</p>
              </template>
              <p>
                WARM measures net life-cycle implications from the point of waste generation. Results depend
                on US assumptions about collection, processing, manufacturing, landfill gas, energy mix and
                material recovery. They do not model Melbourne transport distances, contamination or facilities.
              </p>
              <ul class="mb-0">
                <li v-for="source in impactSources" :key="source.url">
                  <a :href="source.url" target="_blank" rel="noopener noreferrer">
                    {{ source.name }} (opens in a new tab)
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.result-card {
  border: 1px solid transparent;
  border-radius: var(--gl-card-radius) !important;
}

.recycling-result,
.avoided-result {
  color: var(--gl-green-900);
  border-color: #badbc5;
  background: var(--gl-green-100);
}

.landfill-result {
  color: #594300;
  border-color: #dfcf9e;
  background: var(--gl-amber-100);
}

.impact-results .h6 {
  letter-spacing: 0.035em;
}

.impact-chart {
  min-height: 20rem;
}

.card {
  border-color: var(--gl-border) !important;
  border-radius: var(--gl-card-radius);
}

@media (max-width: 575.98px) {
  .impact-chart {
    min-height: 17rem;
  }
}
</style>
