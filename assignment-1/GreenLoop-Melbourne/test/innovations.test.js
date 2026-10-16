import assert from 'node:assert/strict'
import test from 'node:test'
import { impactMaterials } from '../src/data/impactFactors.js'
import { summarizeRecyclingItems } from '../src/utils/analytics.js'
import { calculateAvoidedEmissions } from '../src/utils/impact.js'

const exampleItems = [
  { id: 1, category: 'Paper', recyclable: true, location: {} },
  { id: 2, category: 'Paper', recyclable: false, location: null },
  { id: 3, category: 'Glass', recyclable: true, location: {} },
]

test('analytics summarize actual filtered records without changing the source array', () => {
  const summary = summarizeRecyclingItems(exampleItems, ['Paper'])
  assert.deepEqual(summary.categoryCounts, { Paper: 2 })
  assert.deepEqual(summary.categoryPathwayCounts, {
    Paper: { householdRecycling: 1, specialDisposal: 1, total: 2 },
  })
  assert.equal(summary.filteredItems.length, 2)
  assert.equal(summary.recyclableCount, 1)
  assert.equal(summary.specialDisposalCount, 1)
  assert.equal(summary.withLocationCount, 1)
  assert.equal(exampleItems.length, 3)
})

test('analytics derives stacked pathway segments from item data and preserves category totals', () => {
  const summary = summarizeRecyclingItems(exampleItems)
  assert.deepEqual(summary.categoryPathwayCounts, {
    Paper: { householdRecycling: 1, specialDisposal: 1, total: 2 },
    Glass: { householdRecycling: 1, specialDisposal: 0, total: 1 },
  })
  for (const [category, pathways] of Object.entries(summary.categoryPathwayCounts)) {
    assert.equal(pathways.householdRecycling + pathways.specialDisposal, summary.categoryCounts[category])
    assert.equal(pathways.total, summary.categoryCounts[category])
  }
})

test('impact calculator applies the documented mixed-recyclables coefficient', () => {
  const material = impactMaterials.find(({ id }) => id === 'mixed-recyclables')
  const result = calculateAvoidedEmissions(10, material)
  assert.ok(Math.abs(result.kgCo2eAvoided - 31.1955) < 0.001)
})

test('impact calculator rejects invalid and excessive weights', () => {
  const material = impactMaterials[0]
  assert.match(calculateAvoidedEmissions(0, material).error, /greater than 0/)
  assert.match(calculateAvoidedEmissions(10001, material).error, /10,000/)
})

test('impact calculator returns unavailable rather than inventing unsupported estimates', () => {
  const unsupported = impactMaterials.find(({ id }) => id === 'unsupported-plastic')
  assert.deepEqual(calculateAvoidedEmissions(5, unsupported), { unavailable: true })
})

test('impact calculator compares verified WARM recycling and landfill factors', () => {
  const expectedFactors = {
    'aluminium-cans': { recycling: -9.13, landfill: 0.02, avoided: 9.15 },
    glass: { recycling: -0.28, landfill: 0.02, avoided: 0.30 },
    cardboard: { recycling: -3.14, landfill: 0.18, avoided: 3.32 },
    'plastic-bottles': { recycling: -1.04, landfill: 0.02, avoided: 1.06 },
  }

  for (const [id, expected] of Object.entries(expectedFactors)) {
    const material = impactMaterials.find((entry) => entry.id === id)
    const result = calculateAvoidedEmissions(907.18474, material)
    assert.equal(material.recyclingMtCo2ePerShortTon, expected.recycling)
    assert.equal(material.landfillMtCo2ePerShortTon, expected.landfill)
    assert.ok(Math.abs(result.recyclingKgCo2e - expected.recycling * 1000) < 0.0001)
    assert.ok(Math.abs(result.landfillKgCo2e - expected.landfill * 1000) < 0.0001)
    assert.ok(Math.abs(result.kgCo2eAvoided - expected.avoided * 1000) < 0.0001)
  }
})
