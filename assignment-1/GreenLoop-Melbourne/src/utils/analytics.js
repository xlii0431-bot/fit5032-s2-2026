export function summarizeRecyclingItems(items, selectedCategories = []) {
  const categorySet = new Set(selectedCategories)
  const filteredItems = categorySet.size
    ? items.filter((item) => categorySet.has(item.category))
    : [...items]

  const categoryCounts = filteredItems.reduce((counts, item) => {
    counts[item.category] = (counts[item.category] || 0) + 1
    return counts
  }, {})
  const categoryPathwayCounts = filteredItems.reduce((counts, item) => {
    if (!counts[item.category]) {
      counts[item.category] = { householdRecycling: 0, specialDisposal: 0, total: 0 }
    }
    const pathway = item.recyclable ? 'householdRecycling' : 'specialDisposal'
    counts[item.category][pathway] += 1
    counts[item.category].total += 1
    return counts
  }, {})

  return {
    filteredItems,
    categoryCounts,
    categoryPathwayCounts,
    recyclableCount: filteredItems.filter((item) => item.recyclable).length,
    specialDisposalCount: filteredItems.filter((item) => !item.recyclable).length,
    withLocationCount: filteredItems.filter((item) => Boolean(item.location)).length,
  }
}
