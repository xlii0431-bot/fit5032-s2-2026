const KG_PER_US_SHORT_TON = 907.18474
const KG_CO2E_PER_METRIC_TONNE = 1000

function warmMaterial({ id, name, warmName, recyclingFactor, landfillFactor, definition }) {
  const conversion = KG_CO2E_PER_METRIC_TONNE / KG_PER_US_SHORT_TON
  return {
    id,
    name,
    warmName,
    definition,
    supported: true,
    recyclingMtCo2ePerShortTon: recyclingFactor,
    landfillMtCo2ePerShortTon: landfillFactor,
    recyclingKgCo2ePerKg: recyclingFactor * conversion,
    landfillKgCo2ePerKg: landfillFactor * conversion,
    kgCo2eAvoidedPerKg: (landfillFactor - recyclingFactor) * conversion,
  }
}

export const impactMaterials = [
  warmMaterial({
    id: 'mixed-recyclables', name: 'Mixed recyclables (paper, metals and plastics)',
    warmName: 'Mixed Recyclables', recyclingFactor: -2.80, landfillFactor: 0.03,
    definition: 'EPA equivalencies-calculator mixed-recyclables comparison.',
  }),
  warmMaterial({
    id: 'aluminium-cans', name: 'Aluminium cans', warmName: 'Aluminum Cans',
    recyclingFactor: -9.13, landfillFactor: 0.02,
    definition: 'Post-consumer aluminium beverage and food cans represented by WARM “Aluminum Cans”.',
  }),
  warmMaterial({
    id: 'glass', name: 'Glass containers', warmName: 'Glass',
    recyclingFactor: -0.28, landfillFactor: 0.02,
    definition: 'Post-consumer glass represented by WARM “Glass”; not ceramics, mirrors or drinking glasses.',
  }),
  warmMaterial({
    id: 'cardboard', name: 'Corrugated cardboard', warmName: 'Corrugated Containers',
    recyclingFactor: -3.14, landfillFactor: 0.18,
    definition: 'Clean corrugated boxes represented by WARM “Corrugated Containers”; not all paperboard.',
  }),
  warmMaterial({
    id: 'plastic-bottles', name: 'PET plastic bottles', warmName: 'PET',
    recyclingFactor: -1.04, landfillFactor: 0.02,
    definition: 'PET (resin code 1) bottles only; the factor must not be applied to mixed or unidentified plastics.',
  }),
  {
    id: 'unsupported-plastic',
    name: 'Other or unidentified plastic',
    definition: 'Plastic type is not specific enough to select a compatible WARM material category.',
    supported: false,
  },
]

export const impactSources = {
  equivalencies: {
    name: 'US EPA Greenhouse Gas Equivalencies Calculator — Calculations and References',
    url: 'https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references',
  },
  methodology: {
    name: 'US EPA WARM Version 16 — Management Practices Chapters (December 2023)',
    url: 'https://www.epa.gov/system/files/documents/2024-01/warm_management_practices_v16_dec.pdf',
  },
  version: {
    name: 'US EPA Waste Reduction Model Version 16',
    url: 'https://www.epa.gov/waste-reduction-model/versions-waste-reduction-model',
  },
}

export const impactSource = impactSources.equivalencies
