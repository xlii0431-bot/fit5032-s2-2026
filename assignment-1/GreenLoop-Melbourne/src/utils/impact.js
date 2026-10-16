export function calculateAvoidedEmissions(weightKg, material) {
  const numericWeight = Number(weightKg)
  if (!Number.isFinite(numericWeight) || numericWeight <= 0) {
    return { error: 'Enter a weight greater than 0 kilograms.' }
  }
  if (numericWeight > 10000) {
    return { error: 'Enter a weight of 10,000 kilograms or less.' }
  }
  if (!material?.supported || !Number.isFinite(material.kgCo2eAvoidedPerKg)) {
    return { unavailable: true }
  }

  return {
    weightKg: numericWeight,
    kgCo2eAvoided: numericWeight * material.kgCo2eAvoidedPerKg,
    coefficient: material.kgCo2eAvoidedPerKg,
    recyclingKgCo2e: Number.isFinite(material.recyclingKgCo2ePerKg)
      ? numericWeight * material.recyclingKgCo2ePerKg
      : null,
    landfillKgCo2e: Number.isFinite(material.landfillKgCo2ePerKg)
      ? numericWeight * material.landfillKgCo2ePerKg
      : null,
  }
}
