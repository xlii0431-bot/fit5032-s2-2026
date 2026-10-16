<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import LocationMap from '../components/LocationMap.vue'
import LocationRatingCard from '../components/LocationRatingCard.vue'
import { recyclingLocations } from '../data/recyclingLocations'
import { getCurrentUser } from '../utils/auth'
import {
  addDistancesAndSort,
  fetchDrivingRoute,
  filterLocations,
  searchMelbourneAddresses,
} from '../utils/location'

const route = useRoute()
const currentUser = ref(null)
const searchTerm = ref(typeof route.query.item === 'string' ? route.query.item : '')
const suburbFilter = ref('')
const selectedLocationId = ref('')
const userPosition = ref(null)
const isLocating = ref(false)
const locationError = ref('')
const isRouting = ref(false)
const routeError = ref('')
const routeResult = ref(null)
const originLabel = ref('')
const originSource = ref('')
const addressQuery = ref('')
const addressSuggestions = ref([])
const isGeocoding = ref(false)
const geocodingError = ref('')
let geocodingTimer = null
let geocodingController = null

const suburbs = [...new Set(recyclingLocations.map(({ suburb }) => suburb))].sort()
const filteredLocations = computed(() =>
  addDistancesAndSort(
    filterLocations(recyclingLocations, searchTerm.value, suburbFilter.value),
    userPosition.value,
  ),
)
const selectedLocation = computed(() =>
  recyclingLocations.find(({ id }) => id === selectedLocationId.value),
)

function clearRoute() {
  routeResult.value = null
  routeError.value = ''
}

function clearFilters() {
  searchTerm.value = ''
  suburbFilter.value = ''
}

function selectLocation(locationId) {
  selectedLocationId.value = locationId
  clearRoute()
}

function getGeolocationMessage(error) {
  if (error.code === 1) {
    return 'Location permission was denied. Enable location access in your browser to find nearby centres.'
  }
  if (error.code === 2) {
    return 'Your location is currently unavailable. Check your device location settings and try again.'
  }
  if (error.code === 3) return 'Finding your location timed out. Please try again.'
  return 'Your location could not be determined.'
}

function useMyLocation() {
  locationError.value = ''
  clearRoute()

  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by this browser.'
    return
  }

  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      userPosition.value = { latitude: coords.latitude, longitude: coords.longitude }
      originLabel.value = 'Your current location'
      originSource.value = 'browser'
      addressQuery.value = ''
      addressSuggestions.value = []
      geocodingError.value = ''
      isLocating.value = false
    },
    (error) => {
      locationError.value = getGeolocationMessage(error)
      isLocating.value = false
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
  )
}

function selectAddress(suggestion) {
  userPosition.value = suggestion.position
  originLabel.value = suggestion.label
  originSource.value = 'address'
  addressQuery.value = suggestion.label
  addressSuggestions.value = []
  geocodingError.value = ''
  clearRoute()
}

watch(addressQuery, (query) => {
  window.clearTimeout(geocodingTimer)
  geocodingController?.abort()
  addressSuggestions.value = []
  geocodingError.value = ''

  if (originSource.value === 'address' && query !== originLabel.value) {
    userPosition.value = null
    originLabel.value = ''
    originSource.value = ''
    clearRoute()
  }

  if (query.trim().length < 3 || query === originLabel.value) return

  geocodingTimer = window.setTimeout(async () => {
    geocodingController = new AbortController()
    isGeocoding.value = true
    try {
      addressSuggestions.value = await searchMelbourneAddresses(
        query,
        fetch,
        geocodingController.signal,
      )
      if (!addressSuggestions.value.length) {
        geocodingError.value = 'No matching Melbourne-area address was found. Check the address and try again.'
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        geocodingError.value = 'Address suggestions are temporarily unavailable. You can still use your current location.'
        if (import.meta.env.DEV) console.error('Photon geocoding request failed', error)
      }
    } finally {
      isGeocoding.value = false
    }
  }, 600)
})

async function planRoute() {
  if (!userPosition.value || !selectedLocation.value || isRouting.value) return

  isRouting.value = true
  routeError.value = ''
  routeResult.value = null
  try {
    routeResult.value = await fetchDrivingRoute(
      userPosition.value,
      selectedLocation.value.coordinates,
    )
  } catch (error) {
    routeError.value =
      'A driving route could not be loaded. The routing service may be temporarily unavailable; please try again later.'
    if (import.meta.env.DEV) console.error('OSRM routing request failed', error)
  } finally {
    isRouting.value = false
  }
}

onMounted(async () => {
  currentUser.value = await getCurrentUser()
})

onUnmounted(() => {
  window.clearTimeout(geocodingTimer)
  geocodingController?.abort()
})
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="row">
        <div class="col-12 col-xl-9">
          <h1>Recycling Location Finder</h1>
          <p class="lead mb-2">
            Explore verified Melbourne recycling centres, find the nearest option and plan a real
            driving route.
          </p>
          <p class="small text-secondary mb-0">
            Always confirm accepted items, fees and access requirements with the facility before
            travelling.
          </p>
        </div>
      </div>

      <div class="finder-controls card border-0 shadow-sm mt-4">
        <div class="card-body p-4">
          <h2 class="h4 mb-1">Find a Recycling Centre</h2>
          <p class="text-secondary mb-4">
            Search the verified facility information below, then select a centre as your destination.
          </p>
          <div class="row g-3 align-items-end">
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold" for="location-search">
                Search locations or accepted materials
              </label>
              <input
                id="location-search"
                v-model="searchTerm"
                class="form-control"
                type="search"
                placeholder="e.g. batteries, cardboard or Notting Hill"
              />
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label fw-semibold" for="suburb-filter">Suburb</label>
              <select id="suburb-filter" v-model="suburbFilter" class="form-select">
                <option value="">All suburbs</option>
                <option v-for="suburb in suburbs" :key="suburb" :value="suburb">
                  {{ suburb }}
                </option>
              </select>
            </div>
            <div class="col-12 col-md-3">
              <button class="btn btn-outline-secondary w-100" type="button" @click="clearFilters">
                Clear filters / Show all centres
              </button>
            </div>
          </div>
          <p v-if="route.query.item" class="small text-secondary mt-3 mb-0" role="status">
            Showing centres whose verified facility information matches
            <strong>{{ route.query.item }}</strong> or an explicitly supported equivalent category.
          </p>
        </div>
      </div>

      <div class="row g-4 mt-1">
        <div class="col-12 col-lg-4">
          <div class="d-flex justify-content-between align-items-baseline mb-2">
            <h2 class="h4 mb-0">Verified locations</h2>
            <span class="small text-secondary" role="status" aria-live="polite">
              {{ filteredLocations.length }} {{ filteredLocations.length === 1 ? 'result' : 'results' }}
            </span>
          </div>

          <div v-if="filteredLocations.length" class="location-list d-grid gap-3">
            <article
              v-for="location in filteredLocations"
              :key="location.id"
              class="location-result card"
              :class="{ 'border-success border-2': selectedLocationId === location.id }"
            >
              <div class="card-body p-3">
                <h3 class="h6 mb-1">{{ location.name }}</h3>
                <p class="small text-secondary mb-2">{{ location.address }}</p>
                <p v-if="location.distanceKm !== null" class="small fw-semibold text-success mb-2">
                  Approx. {{ location.distanceKm.toFixed(1) }} km away (straight-line)
                </p>
                <button
                  class="btn btn-sm btn-outline-success"
                  type="button"
                  :aria-pressed="selectedLocationId === location.id"
                  @click="selectLocation(location.id)"
                >
                  {{ selectedLocationId === location.id ? 'Selected' : 'Select centre' }}
                </button>
              </div>
            </article>
          </div>
          <div v-else class="alert alert-light border" role="status">
            <p class="mb-2">
              No verified locations match these filters. This does not mean no facility accepts the
              material; GreenLoop only shows acceptance supported by its linked facility sources.
            </p>
            <button class="btn btn-sm btn-outline-success" type="button" @click="clearFilters">
              Clear filters / Show all centres
            </button>
          </div>
        </div>

        <div class="col-12 col-lg-8">
          <LocationMap
            :locations="filteredLocations"
            :selected-location-id="selectedLocationId"
            :user-position="userPosition"
            :route-coordinates="routeResult?.coordinates || []"
            @select-location="selectLocation"
          />

          <div class="route-planner card border-0 shadow-sm mt-3">
            <div class="card-body p-4">
              <h2 class="h4 mb-1">Plan Your Route</h2>
              <p class="text-secondary mb-4">
                Select a destination above, then use your device location or choose a suggested
                Melbourne-area starting address.
              </p>

              <div class="row g-3 align-items-end">
                <div class="col-12 col-lg-8 position-relative">
                  <label class="form-label fw-semibold" for="starting-address">Starting Address</label>
                  <input
                    id="starting-address"
                    v-model="addressQuery"
                    class="form-control"
                    type="search"
                    autocomplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls="address-suggestions"
                    :aria-expanded="addressSuggestions.length > 0"
                    placeholder="Start typing a Melbourne-area address"
                  />
                  <div
                    v-if="addressSuggestions.length"
                    id="address-suggestions"
                    class="address-suggestions list-group mt-1"
                    role="listbox"
                    aria-label="Address suggestions"
                  >
                    <button
                      v-for="suggestion in addressSuggestions"
                      :key="suggestion.id"
                      class="list-group-item list-group-item-action"
                      type="button"
                      role="option"
                      @click="selectAddress(suggestion)"
                    >
                      {{ suggestion.label }}
                    </button>
                  </div>
                </div>
                <div class="col-12 col-lg-4">
                  <button
                    class="btn btn-outline-success w-100"
                    type="button"
                    :disabled="isLocating"
                    :aria-busy="isLocating"
                    @click="useMyLocation"
                  >
                    <span
                      v-if="isLocating"
                      class="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    ></span>
                    {{ isLocating ? 'Finding your location...' : 'Use My Location' }}
                  </button>
                </div>
              </div>
              <p v-if="isGeocoding" class="small text-secondary mt-2 mb-0" role="status">
                Finding address suggestions...
              </p>
              <p v-if="geocodingError" class="alert alert-warning mt-3 mb-0" role="alert">
                {{ geocodingError }}
              </p>
              <p v-if="locationError" class="alert alert-warning mt-3 mb-0" role="alert">
                {{ locationError }}
              </p>

              <dl class="route-summary mt-4 mb-4">
                <dt>Selected origin</dt>
                <dd>{{ originLabel || 'Choose an address or use your current location' }}</dd>
                <dt>Destination</dt>
                <dd>
                  {{ selectedLocation ? `${selectedLocation.name} — ${selectedLocation.address}` : 'Select a centre from the results or map' }}
                </dd>
              </dl>

              <div v-if="selectedLocation" class="border-top pt-3">
                <p class="small mb-1">
                  <strong>Verified accepted materials:</strong>
                  {{ selectedLocation.acceptedMaterials.join(', ') }}
                </p>
                <a
                  class="small"
                  :href="selectedLocation.sourceUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Verify current details with {{ selectedLocation.sourceName }} (opens in a new tab)
                </a>
              </div>

              <div class="route-action mt-4">
                <button
                  class="btn btn-success"
                  type="button"
                  :disabled="!userPosition || !selectedLocation || isRouting"
                  :aria-busy="isRouting"
                  @click="planRoute"
                >
                  <span
                    v-if="isRouting"
                    class="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  ></span>
                  {{ isRouting ? 'Planning route...' : 'Calculate Driving Route' }}
                </button>
                <p v-if="!selectedLocation" class="small text-secondary mt-2 mb-0">
                  Select a recycling centre before calculating directions.
                </p>
                <p v-else-if="!userPosition" class="small text-secondary mt-2 mb-0">
                  Choose a suggested starting address or use your current location.
                </p>
              </div>
              <div v-if="routeResult" class="alert alert-primary mt-3 mb-0" role="status">
                <strong>Origin:</strong> {{ originLabel }}<br />
                <strong>Destination:</strong> {{ selectedLocation.name }}<br />
                <strong>Driving distance:</strong> {{ routeResult.distanceKm.toFixed(1) }} km ·
                <strong>Estimated duration:</strong> about {{ Math.ceil(routeResult.durationMinutes) }} minutes.<br />
                Route supplied by OSRM using OpenStreetMap road data.
              </div>
              <p v-if="routeError" class="alert alert-danger mt-3 mb-0" role="alert">
                {{ routeError }}
              </p>
            </div>
          </div>

          <p class="small text-secondary mt-2 mb-0">
            Map and address data © OpenStreetMap contributors. Address suggestions use Photon.
            Driving routes © OSRM contributors. Public services are best-effort and requests are
            limited to your searches and route actions.
          </p>

          <div class="workflow-next mt-3 p-3 p-sm-4">
            <div>
              <p class="small fw-bold text-uppercase mb-1">Next step</p>
              <h2 class="h5 mb-1">Understand Your Impact</h2>
              <p class="text-secondary mb-0">
                Explore documented educational recycling and landfill estimates independently of route planning.
              </p>
            </div>
            <RouterLink class="btn btn-success flex-shrink-0" to="/impact-calculator">
              Next: Understand Your Impact
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="mt-5 pt-3 border-top">
        <h2 class="h3">Community Ratings</h2>
        <p class="text-secondary">
          Review community feedback for the same verified facilities. Facility details come from the
          linked council sources, not from community ratings.
        </p>
        <div v-if="!currentUser" class="alert alert-light border" role="status">
          Loading recycling locations...
        </div>
        <div v-else class="row g-4 mt-1">
          <div
            v-for="location in recyclingLocations"
            :key="location.id"
            class="col-12 col-md-6 col-xl-4"
          >
            <LocationRatingCard :location="location" :user-id="currentUser.uid" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.finder-controls {
  border-top: 4px solid var(--gl-green-600) !important;
  border-radius: var(--gl-card-radius);
}

.location-list {
  max-height: 38rem;
  overflow-y: auto;
  padding: 0.15rem;
}

.location-result {
  border-color: var(--gl-border);
  border-radius: var(--gl-card-radius);
}

.route-planner {
  border-top: 4px solid var(--gl-green-600) !important;
  border-radius: var(--gl-card-radius);
}

.address-suggestions {
  position: absolute;
  z-index: 1050;
  right: calc(var(--bs-gutter-x) * 0.5);
  left: calc(var(--bs-gutter-x) * 0.5);
  max-height: 16rem;
  overflow-y: auto;
  box-shadow: 0 0.5rem 1.25rem rgb(0 0 0 / 14%);
}

.route-summary {
  display: grid;
  grid-template-columns: minmax(7.5rem, 9rem) minmax(0, 1fr);
  gap: 0.75rem 1rem;
  padding-block: 1rem;
  border-block: 1px solid var(--gl-border);
}

.route-summary dt,
.route-summary dd {
  margin: 0;
}

.route-summary dd {
  overflow-wrap: anywhere;
}

.route-action {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.workflow-next {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  border: 1px solid var(--gl-border);
  border-radius: var(--gl-card-radius);
  background: var(--gl-surface-soft);
}

.workflow-next > div {
  min-width: 0;
}

.workflow-next .text-uppercase {
  color: var(--gl-green-700);
  letter-spacing: 0.06em;
}

@media (max-width: 991.98px) {
  .location-list {
    max-height: none;
  }
}

@media (max-width: 575.98px) {
  .address-suggestions {
    position: static;
    max-height: 13rem;
  }

  .workflow-next {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
