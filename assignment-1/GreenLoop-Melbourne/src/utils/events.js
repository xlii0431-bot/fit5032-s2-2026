export function isEventPast(dateISO, now = new Date()) {
  const endOfEventDay = new Date(`${dateISO}T23:59:59.999`)
  return Number.isNaN(endOfEventDay.getTime()) || endOfEventDay < now
}
