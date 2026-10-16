const EARTH_RADIUS_KM = 6371

const MATERIAL_ALIASES = new Map([
  ['aluminium can', ['aluminium can', 'aluminium cans', 'aluminum can', 'aluminum cans', 'metals']],
  ['aluminium cans', ['aluminium can', 'aluminium cans', 'aluminum can', 'aluminum cans', 'metals']],
  ['aluminum can', ['aluminium can', 'aluminium cans', 'aluminum can', 'aluminum cans', 'metals']],
  ['aluminum cans', ['aluminium can', 'aluminium cans', 'aluminum can', 'aluminum cans', 'metals']],
  ['battery', ['battery', 'batteries']],
  ['batteries', ['battery', 'batteries']],
  ['glass bottle', ['glass bottle', 'glass bottles', 'glass bottles and jars']],
  ['glass bottles', ['glass bottle', 'glass bottles', 'glass bottles and jars']],
  ['cardboard box', ['cardboard box', 'cardboard boxes', 'cardboard']],
  ['cardboard boxes', ['cardboard box', 'cardboard boxes', 'cardboard']],
  ['electronic waste', ['electronic waste', 'e waste', 'e-waste']],
  ['e waste', ['electronic waste', 'e waste', 'e-waste']],
])

export function normalizeSearchText(value = '') {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function getMaterialSearchTerms(searchTerm = '') {
  const normalized = normalizeSearchText(searchTerm)
  return normalized ? MATERIAL_ALIASES.get(normalized) || [normalized] : []
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

export function calculateDistanceKm(origin, destination) {
  const latitudeDifference = toRadians(destination.latitude - origin.latitude)
  const longitudeDifference = toRadians(destination.longitude - origin.longitude)
  const originLatitude = toRadians(origin.latitude)
  const destinationLatitude = toRadians(destination.latitude)

  const haversineValue =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDifference / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversineValue))
}

export function addDistancesAndSort(locations, userPosition) {
  if (!userPosition) return locations.map((location) => ({ ...location, distanceKm: null }))

  return locations
    .map((location) => ({
      ...location,
      distanceKm: calculateDistanceKm(userPosition, location.coordinates),
    }))
    .sort((first, second) => first.distanceKm - second.distanceKm)
}

export function filterLocations(locations, searchTerm = '', suburb = '') {
  const searchTerms = getMaterialSearchTerms(searchTerm)

  return locations.filter((location) => {
    const matchesSuburb = !suburb || location.suburb === suburb
    const searchableText = [
      location.name,
      location.address,
      location.suburb,
      location.postcode,
      ...location.acceptedMaterials,
    ]
      .map(normalizeSearchText)
      .join(' ')

    return matchesSuburb && (!searchTerms.length || searchTerms.some((term) => searchableText.includes(normalizeSearchText(term))))
  })
}

export async function searchMelbourneAddresses(query, fetchImplementation = fetch, signal) {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 3) return []

  const parameters = new URLSearchParams({
    q: normalizedQuery,
    lang: 'en',
    limit: '5',
    lat: '-37.8136',
    lon: '144.9631',
    bbox: '144.45,-38.55,145.65,-37.35',
  })
  const response = await fetchImplementation(`https://photon.komoot.io/api/?${parameters}`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) throw new Error(`Geocoding service returned HTTP ${response.status}.`)

  const data = await response.json()
  return (data.features || [])
    .filter((feature) => feature.geometry?.coordinates?.length === 2)
    .map((feature) => {
      const properties = feature.properties || {}
      const label = [
        [properties.housenumber, properties.street].filter(Boolean).join(' '),
        properties.name,
        properties.district || properties.city,
        properties.state,
        properties.postcode,
      ]
        .filter(Boolean)
        .filter((part, index, parts) => parts.indexOf(part) === index)
        .join(', ')

      return {
        id: `${properties.osm_type || 'place'}-${properties.osm_id || feature.geometry.coordinates.join('-')}`,
        label,
        position: {
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
        },
      }
    })
}

export async function fetchDrivingRoute(origin, destination, fetchImplementation = fetch) {
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`
  const endpoint = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`
  const response = await fetchImplementation(endpoint, { headers: { Accept: 'application/json' } })

  if (!response.ok) throw new Error(`Routing service returned HTTP ${response.status}.`)

  const data = await response.json()
  const route = data.routes?.[0]
  if (data.code !== 'Ok' || !route?.geometry?.coordinates?.length) {
    throw new Error('No driving route was returned.')
  }

  return {
    coordinates: route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]),
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
  }
}
