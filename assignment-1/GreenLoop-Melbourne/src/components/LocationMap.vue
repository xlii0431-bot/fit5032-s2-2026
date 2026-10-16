<script setup>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  locations: { type: Array, required: true },
  selectedLocationId: { type: String, default: '' },
  userPosition: { type: Object, default: null },
  routeCoordinates: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-location'])
const mapElement = ref(null)
let map
let locationLayer
let routeLayer
let userMarker
const markers = new Map()

function makePopup(location) {
  const container = document.createElement('div')
  const title = document.createElement('strong')
  const address = document.createElement('p')
  const materialsLabel = document.createElement('strong')
  const materials = document.createElement('p')
  const description = document.createElement('p')
  const source = document.createElement('a')

  title.textContent = location.name
  address.textContent = location.address
  address.className = 'mb-2'
  materialsLabel.textContent = 'Accepted materials'
  materials.textContent = location.acceptedMaterials.join(', ')
  materials.className = 'mb-2'
  description.textContent = location.description
  description.className = 'mb-2'
  source.textContent = `Verify details with ${location.sourceName}`
  source.href = location.sourceUrl
  source.target = '_blank'
  source.rel = 'noopener noreferrer'

  container.append(title, address, materialsLabel, materials, description, source)
  return container
}

function markerStyle(location) {
  const selected = location.id === props.selectedLocationId
  return {
    radius: selected ? 10 : 8,
    color: selected ? '#0b4f30' : '#146c43',
    fillColor: selected ? '#ffc107' : '#198754',
    fillOpacity: 0.9,
    weight: selected ? 3 : 2,
  }
}

function fitVisibleLocations() {
  if (!map || props.locations.length === 0) return
  const bounds = L.latLngBounds(
    props.locations.map(({ coordinates }) => [coordinates.latitude, coordinates.longitude]),
  )
  map.fitBounds(bounds.pad(0.2), { maxZoom: 13 })
}

function renderLocations() {
  if (!map) return
  locationLayer.clearLayers()
  markers.clear()

  props.locations.forEach((location) => {
    const marker = L.circleMarker(
      [location.coordinates.latitude, location.coordinates.longitude],
      markerStyle(location),
    )
      .bindPopup(makePopup(location), { maxWidth: 300 })
      .on('click', () => emit('select-location', location.id))

    marker.addTo(locationLayer)
    markers.set(location.id, marker)
  })

  fitVisibleLocations()
}

function renderUserPosition() {
  if (!map) return
  if (userMarker) {
    userMarker.remove()
    userMarker = null
  }
  if (!props.userPosition) return

  userMarker = L.circleMarker(
    [props.userPosition.latitude, props.userPosition.longitude],
    {
      radius: 9,
      color: '#084298',
      fillColor: '#0d6efd',
      fillOpacity: 0.9,
      weight: 3,
    },
  )
    .bindPopup('Your approximate location')
    .addTo(map)
}

function renderRoute() {
  if (!map) return
  if (routeLayer) {
    routeLayer.remove()
    routeLayer = null
  }
  if (props.routeCoordinates.length < 2) return

  routeLayer = L.polyline(props.routeCoordinates, {
    color: '#0d6efd',
    weight: 5,
    opacity: 0.8,
  }).addTo(map)
  map.fitBounds(routeLayer.getBounds().pad(0.08))
}

watch(() => props.locations, renderLocations, { deep: true })
watch(
  () => props.selectedLocationId,
  (selectedId) => {
    markers.forEach((marker, id) => marker.setStyle(markerStyle({ id })))
    const selectedMarker = markers.get(selectedId)
    if (selectedMarker) {
      selectedMarker.openPopup()
      map.panTo(selectedMarker.getLatLng())
    }
  },
)
watch(() => props.userPosition, renderUserPosition, { deep: true })
watch(() => props.routeCoordinates, renderRoute, { deep: true })

onMounted(async () => {
  map = L.map(mapElement.value, { keyboard: true }).setView([-37.86, 145.04], 10)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map)
  locationLayer = L.layerGroup().addTo(map)
  renderLocations()
  renderUserPosition()
  renderRoute()
  await nextTick()
  map.invalidateSize()
})

onUnmounted(() => map?.remove())
</script>

<template>
  <div>
    <p id="location-map-description" class="visually-hidden">
      Interactive map. Use the keyboard-accessible verified location list before the map to select a
      recycling centre. All marker information and route actions are also available as text outside
      the map.
    </p>
    <div
      ref="mapElement"
      class="location-map"
      role="region"
      aria-label="Interactive map of verified recycling locations"
      aria-describedby="location-map-description"
    ></div>
  </div>
</template>

<style scoped>
.location-map {
  width: 100%;
  height: clamp(24rem, 58vh, 38rem);
  border: 1px solid #b8d2bf;
  border-radius: 0.75rem;
  background: #e9f1eb;
  z-index: 0;
}
</style>
