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
 * mileage_date(x) is the extrapolated date a car is expected to reach mileage 'x' given the
 * last recorded mileage and calculated avgMilesPerDay.  This date may be in the past
 * (interpolated).
 *
 * If there are no service events fot this item:
 *   - projected_date = lesser of
 *     - specific_date, if defined
 *     - mileage_date(specific_mileage)
 *     - Jan 1 of the car model year plus month_interval
 *     - mileage_date(mileage_interval)
 *
 * If there is at least on service event:
 *   - projected_date = lesser of
 *     - specific_date if defined and specific_date > latest event date
 *     - mileage_date(specific_mileage) if defined and specific_mileage > latest event mileage
 *     - last event date + month_interval
 *     - mileage_date(last event mileage + mileage_interval)
 *
 * @param {object} item - service item with optional fields:
 *   mileage_interval, specific_mileage, month_interval, specific_date
 * @param {object|null} lastEvent - most recent service event for this item { date, mileage }, or null
 * @param {object} car - car object { mileage, year }
 * @param {number|null} avgMilesPerDay - average miles driven per day (from computeAvgMilesPerDay)
 * @param {Date} today - reference date (defaults to now, injectable for testing)
 * @returns {Date|null}
 */
function calculateProjectedDate(item, lastEvent, car, avgMilesPerDay, today = new Date()) {
  const todayMs = new Date(today);
  todayMs.setHours(0, 0, 0, 0);

  const carMileage = car.mileage;

  function mileageToDate(targetMileage) {
    if (avgMilesPerDay == null || avgMilesPerDay <= 0) return null;
    const days = Math.round((targetMileage - carMileage) / avgMilesPerDay);
    const d = new Date(todayMs);
    d.setDate(d.getDate() + days);
    return d;
  }

  const candidates = [];

  if (!lastEvent) {
    // If there are no service events for this item:
    // - projected_date = lesser of
    //   - specific_date, if defined
    if (item.specific_date) {
      candidates.push(new Date(item.specific_date));
    }

    //   - mileage_date(specific_mileage)
    if (item.specific_mileage != null) {
      const d = mileageToDate(item.specific_mileage);
      if (d) candidates.push(d);
    }

    //   - Jan 1 of the car model year plus month_interval
    if (item.month_interval != null && car.year != null) {
      const d = new Date(car.year, 0, 1);
      d.setMonth(d.getMonth() + item.month_interval);
      candidates.push(d);
    }

    //   - mileage_date(mileage_interval)
    if (item.mileage_interval != null) {
      const d = mileageToDate(item.mileage_interval);
      if (d) candidates.push(d);
    }
  } else {
    // If there is at least one service event:
    // - projected_date = lesser of
    //   - specific_date if defined and specific_date > latest event date
    if (item.specific_date && new Date(item.specific_date) > new Date(lastEvent.date)) {
      candidates.push(new Date(item.specific_date));
    }

    //   - mileage_date(specific_mileage) if defined and specific_mileage > latest event mileage
    if (item.specific_mileage != null && item.specific_mileage > lastEvent.mileage) {
      const d = mileageToDate(item.specific_mileage);
      if (d) candidates.push(d);
    }

    //   - last event date + month_interval
    if (item.month_interval != null) {
      const d = new Date(lastEvent.date);
      d.setMonth(d.getMonth() + item.month_interval);
      candidates.push(d);
    }

    //   - mileage_date(last event mileage + mileage_interval)
    if (item.mileage_interval != null) {
      const d = mileageToDate(lastEvent.mileage + item.mileage_interval);
      if (d) candidates.push(d);
    }
  }

  return candidates.length > 0
    ? new Date(Math.min(...candidates.map(d => d.getTime())))
    : null;
}

module.exports = { computeAvgMilesPerDay, calculateProjectedDate };
