export function observeCommunityRatingAnalytics(locations, observeRatings, onChange, onError) {
  const summaries = new Map(locations.map((location) => [location.id, {
    id: location.id,
    name: location.name,
    suburb: location.suburb,
    average: 0,
    count: 0,
  }]))

  const publish = () => onChange(locations.map((location) => summaries.get(location.id)))
  const unsubscribers = locations.map((location) => observeRatings(
    location.id,
    null,
    (rating) => {
      summaries.set(location.id, { ...summaries.get(location.id), average: rating.average, count: rating.count })
      publish()
    },
    onError,
  ))

  if (locations.length === 0) publish()
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.())
}
