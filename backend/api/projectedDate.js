/**
 * Compute average miles per day from the two most recent service events.
 * Falls back to using the single event + carMileage (as of now) when only one event exists.
 * Events must have { date, mileage } fields.
 * Returns null if a positive rate cannot be determined.
 */
function computeAvgMilesPerDay(serviceEvents, carMileage = null, now = new Date()) {
  const sorted = [...serviceEvents].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pick the two points to compare: prefer last two events, fall back to event + current odometer
  let older, newer;
  if (sorted.length >= 2) {
    older  = sorted[1]; // second most recent
    newer  = sorted[0]; // most recent
  } else if (sorted.length === 1 && carMileage != null) {
    older  = sorted[0];
    newer  = { date: now, mileage: carMileage };
  } else {
    return null;
  }

  const days  = (new Date(newer.date) - new Date(older.date)) / 86400000;
  const miles = newer.mileage - older.mileage;
  if (days <= 0 || miles <= 0) return null;
  return miles / days;
}

/**
 * Calculate the projected date for a service item.
 *
 * @param {object} item - service item with optional fields:
 *   mileage_interval, specific_mileage, month_interval, specific_date
 * @param {object|null} lastEvent - most recent service event for this item { date, mileage }, or null
 * @param {number} carMileage - current car mileage
 * @param {number|null} avgMilesPerDay - average miles driven per day (from computeAvgMilesPerDay)
 * @param {Date} today - reference date (defaults to now, injectable for testing)
 * @returns {Date|null}
 */
function calculateProjectedDate(item, lastEvent, carMileage, avgMilesPerDay, today = new Date()) {
  const todayMs = new Date(today);
  todayMs.setHours(0, 0, 0, 0);

  function mileageToDate(targetMileage) {
    if (avgMilesPerDay == null || avgMilesPerDay <= 0) return null;
    if (carMileage >= targetMileage) return new Date(todayMs);
    const days = (targetMileage - carMileage) / avgMilesPerDay;
    return new Date(todayMs.getTime() + days * 86400000);
  }

  const candidates = [];

  if (item.mileage_interval) {
    const baseMileage = lastEvent ? lastEvent.mileage : 0;
    const d = mileageToDate(baseMileage + item.mileage_interval);
    if (d) candidates.push(d);
  }

  if (item.specific_mileage) {
    const d = mileageToDate(item.specific_mileage);
    if (d) candidates.push(d);
  }

  if (item.month_interval && lastEvent) {
    const d = new Date(lastEvent.date);
    d.setMonth(d.getMonth() + item.month_interval);
    candidates.push(d);
  }

  if (item.specific_date) {
    candidates.push(new Date(item.specific_date));
  }

  return candidates.length > 0
    ? new Date(Math.min(...candidates.map(d => d.getTime())))
    : null;
}

module.exports = { computeAvgMilesPerDay, calculateProjectedDate };
