export function summarizeUserRoles(profiles) {
  return profiles.reduce((counts, profile) => {
    const role = profile.role === 'admin' ? 'admin' : 'user'
    counts[role] += 1
    counts.total += 1
    return counts
  }, { total: 0, admin: 0, user: 0 })
}
