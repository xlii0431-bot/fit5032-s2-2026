import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addDistancesAndSort,
  calculateDistanceKm,
  fetchDrivingRoute,
  filterLocations,
  getMaterialSearchTerms,
  normalizeSearchText,
  searchMelbourneAddresses,
} from '../src/utils/location.js'

const locations = [
  {
    name: 'Far Centre',
    suburb: 'South Melbourne',
    postcode: '3205',
    address: 'Far address',
    acceptedMaterials: ['Paint'],
    coordinates: { latitude: -37.83, longitude: 144.94 },
  },
  {
    name: 'Near Centre',
    suburb: 'Notting Hill',
    postcode: '3168',
    address: 'Near address',
    acceptedMaterials: ['Batteries'],
    coordinates: { latitude: -37.9, longitude: 145.14 },
  },
]

test('Haversine returns zero for identical coordinates', () => {
  const point = { latitude: -37.8136, longitude: 144.9631 }
  assert.equal(calculateDistanceKm(point, point), 0)
})

test('Haversine calculates a known Melbourne-to-Geelong distance within tolerance', () => {
  const melbourne = { latitude: -37.8136, longitude: 144.9631 }
  const geelong = { latitude: -38.1499, longitude: 144.3617 }
  assert.ok(Math.abs(calculateDistanceKm(melbourne, geelong) - 65.1) < 1)
})

test('locations are sorted by calculated proximity', () => {
  const sorted = addDistancesAndSort(locations, { latitude: -37.9, longitude: 145.14 })
  assert.equal(sorted[0].name, 'Near Centre')
  assert.equal(sorted[0].distanceKm, 0)
})

test('search and suburb filters match individual location fields', () => {
  assert.deepEqual(filterLocations(locations, 'batteries').map(({ name }) => name), [
    'Near Centre',
  ])
  assert.deepEqual(filterLocations(locations, '', 'South Melbourne').map(({ name }) => name), [
    'Far Centre',
  ])
})

test('material matching normalises punctuation and uses explicit verified category aliases', () => {
  const metalLocation = {
    ...locations[0],
    name: 'Verified Metals Centre',
    acceptedMaterials: ['Metals'],
  }
  const dataset = [...locations, metalLocation]

  assert.equal(normalizeSearchText('  Aluminium-Can '), 'aluminium can')
  assert.ok(getMaterialSearchTerms('aluminium cans').includes('metals'))
  assert.deepEqual(filterLocations(dataset, 'Aluminium Can').map(({ name }) => name), [
    'Verified Metals Centre',
  ])
  assert.deepEqual(filterLocations(dataset, 'aluminium cans').map(({ name }) => name), [
    'Verified Metals Centre',
  ])
})

test('Photon address results are converted to selectable route origins', async () => {
  const mockFetch = async (url) => {
    assert.match(url, /photon\.komoot\.io/)
    assert.match(url, /bbox=/)
    return {
      ok: true,
      json: async () => ({
        features: [
          {
            geometry: { coordinates: [144.9631, -37.8136] },
            properties: {
              osm_type: 'W',
              osm_id: 42,
              housenumber: '100',
              street: 'Swanston Street',
              city: 'Melbourne',
              state: 'Victoria',
              postcode: '3000',
            },
          },
        ],
      }),
    }
  }

  const results = await searchMelbourneAddresses('100 Swanston Street', mockFetch)
  assert.equal(results.length, 1)
  assert.match(results[0].label, /100 Swanston Street/)
  assert.deepEqual(results[0].position, { latitude: -37.8136, longitude: 144.9631 })
})

test('OSRM route response is converted to Leaflet coordinates and display metrics', async () => {
  const mockFetch = async () => ({
    ok: true,
    json: async () => ({
      code: 'Ok',
      routes: [
        {
          distance: 12500,
          duration: 900,
          geometry: { coordinates: [[145.1, -37.9], [145.2, -37.8]] },
        },
      ],
    }),
  })

  const route = await fetchDrivingRoute(
    locations[0].coordinates,
    locations[1].coordinates,
    mockFetch,
  )
  assert.deepEqual(route.coordinates, [[-37.9, 145.1], [-37.8, 145.2]])
  assert.equal(route.distanceKm, 12.5)
  assert.equal(route.durationMinutes, 15)
})
