const { computeAvgMilesPerDay, calculateProjectedDate } = require('./projectedDate');

function daysFrom(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

const TODAY = new Date(2025, 5, 1); // Jun 1 2025, local time

describe('computeAvgMilesPerDay', () => {
  test('returns null with no events', () => {
    expect(computeAvgMilesPerDay([])).toBeNull();
  });

  test('returns null with only one event and no carMileage', () => {
    expect(computeAvgMilesPerDay([{ date: daysFrom(TODAY, -100), mileage: 10000 }])).toBeNull();
  });

  test('falls back to single event + carMileage when only one event exists', () => {
    // 100 days ago at 10000 mi, now at 11000 → 10 mi/day
    const events = [{ date: daysFrom(TODAY, -100), mileage: 10000 }];
    expect(computeAvgMilesPerDay(events, 11000, TODAY)).toBeCloseTo(10, 1);
  });

  test('computes rate from the two most recent events', () => {
    // most recent two: -50 days at 9500 and -10 days at 9900 → 400 mi / 40 days = 10 mi/day
    const events = [
      { date: daysFrom(TODAY, -200), mileage: 8000 }, // older, should be ignored
      { date: daysFrom(TODAY, -50),  mileage: 9500 },
      { date: daysFrom(TODAY, -10),  mileage: 9900 },
    ];
    const rate = computeAvgMilesPerDay(events);
    expect(rate).toBeCloseTo(10, 5);
  });

  test('ignores older events — uses only the last two', () => {
    const events = [
      { date: daysFrom(TODAY, -100), mileage: 5000 }, // very different rate
      { date: daysFrom(TODAY, -20),  mileage: 9800 },
      { date: daysFrom(TODAY, -10),  mileage: 9900 }, // last two: 100 mi / 10 days = 10
    ];
    const rate = computeAvgMilesPerDay(events);
    expect(rate).toBeCloseTo(10, 5);
  });

  test('returns null when mileage did not increase between last two events', () => {
    const events = [
      { date: daysFrom(TODAY, -50), mileage: 10000 },
      { date: daysFrom(TODAY, -10), mileage: 10000 },
    ];
    expect(computeAvgMilesPerDay(events)).toBeNull();
  });

  test('returns null when last two events are on the same date', () => {
    const events = [
      { date: TODAY, mileage: 10000 },
      { date: TODAY, mileage: 10500 },
    ];
    expect(computeAvgMilesPerDay(events)).toBeNull();
  });
});

describe('calculateProjectedDate', () => {
  const CAR_MILEAGE = 20000;
  const AVG = 10; // 10 miles/day (injected directly)

  test('returns null when no interval or date fields are set', () => {
    const item = { mileage_interval: null, specific_mileage: null, month_interval: null, specific_date: null };
    expect(calculateProjectedDate(item, null, CAR_MILEAGE, AVG, TODAY)).toBeNull();
  });

  test('projects from mileage_interval + last event mileage', () => {
    // last event at 19000 mi, interval 2000 → target 21000; need 1000 more at 10/day = 100 days
    const item = { mileage_interval: 2000, specific_mileage: null, month_interval: null, specific_date: null };
    const lastEvent = { date: daysFrom(TODAY, -90), mileage: 19000 };
    const result = calculateProjectedDate(item, lastEvent, CAR_MILEAGE, AVG, TODAY);
    expect(result.toDateString()).toBe(daysFrom(TODAY, 100).toDateString());
  });

  test('projects from specific_mileage', () => {
    // target 20500, need 500 more at 10/day = 50 days
    const item = { mileage_interval: null, specific_mileage: 20500, month_interval: null, specific_date: null };
    const result = calculateProjectedDate(item, null, CAR_MILEAGE, AVG, TODAY);
    expect(result.toDateString()).toBe(daysFrom(TODAY, 50).toDateString());
  });

  test('returns a past date when car has already passed target mileage', () => {
    // car at 20000, target 19000 → 1000 miles overdue at 10/day = 100 days ago
    const item = { mileage_interval: null, specific_mileage: 19000, month_interval: null, specific_date: null };
    const result = calculateProjectedDate(item, null, CAR_MILEAGE, AVG, TODAY);
    expect(result.toDateString()).toBe(daysFrom(TODAY, -100).toDateString());
  });

  test('projects from month_interval + last event date', () => {
    const item = { mileage_interval: null, specific_mileage: null, month_interval: 6, specific_date: null };
    const lastEvent = { date: new Date(2025, 0, 1), mileage: 18000 }; // Jan 1 local
    const result = calculateProjectedDate(item, lastEvent, CAR_MILEAGE, AVG, TODAY);
    expect(result.toDateString()).toBe(new Date(2025, 6, 1).toDateString()); // Jul 1 local
  });

  test('uses specific_date directly', () => {
    const item = { mileage_interval: null, specific_mileage: null, month_interval: null, specific_date: '2025-09-15' };
    const result = calculateProjectedDate(item, null, CAR_MILEAGE, AVG, TODAY);
    expect(result.toDateString()).toBe(new Date('2025-09-15').toDateString());
  });

  test('returns the minimum of multiple candidates', () => {
    // mileage candidate: 100 days out (Sep 9)
    // month candidate: 6 months from Jan 1 = Jul 1 ← sooner
    // specific_date: Dec 1 (latest)
    const item = {
      mileage_interval: 2000,
      specific_mileage: null,
      month_interval: 6,
      specific_date: '2025-12-01',
    };
    const lastEvent = { date: new Date(2025, 0, 1), mileage: 19000 };
    const result = calculateProjectedDate(item, lastEvent, CAR_MILEAGE, AVG, TODAY);
    expect(result.toDateString()).toBe(new Date(2025, 6, 1).toDateString());
  });

  test('uses mileage 0 as base when no last event for mileage_interval', () => {
    // target = 0 + 2000 = 2000; car at 20000 → 18000 miles overdue at 10/day = 1800 days ago
    const item = { mileage_interval: 2000, specific_mileage: null, month_interval: null, specific_date: null };
    const result = calculateProjectedDate(item, null, CAR_MILEAGE, AVG, TODAY);
    expect(result.toDateString()).toBe(daysFrom(TODAY, -1800).toDateString());
  });

  test('projects future date from mileage_interval with no last event when target is ahead', () => {
    // car at 1000, target = 0 + 2000 = 2000 → need 1000 more at 10/day = 100 days
    const item = { mileage_interval: 2000, specific_mileage: null, month_interval: null, specific_date: null };
    const result = calculateProjectedDate(item, null, 1000, AVG, TODAY);
    expect(result.toDateString()).toBe(daysFrom(TODAY, 100).toDateString());
  });

  test('skips mileage projections when avgMilesPerDay is null', () => {
    const item = { mileage_interval: 2000, specific_mileage: 21000, month_interval: null, specific_date: null };
    const lastEvent = { date: new Date(2025, 0, 1), mileage: 19000 };
    expect(calculateProjectedDate(item, lastEvent, CAR_MILEAGE, null, TODAY)).toBeNull();
  });
});

// Regression: car with one service event total and multiple items with no events
// Previously returned N/A for all mileage-interval items because avgMilesPerDay was null
describe('regression: single-event car with un-serviced items', () => {
  test('produces a non-null projected date for a mileage-interval item with no lastEvent', () => {
    // Car has one service event (for a different item), current mileage is 12000
    const allEvents = [{ date: daysFrom(TODAY, -50), mileage: 10000 }];
    const carMileage = 12000; // 2000 miles in 50 days = 40 mi/day

    const avg = computeAvgMilesPerDay(allEvents, carMileage, TODAY);
    expect(avg).toBeCloseTo(40, 0); // fallback to single event + carMileage

    // Service item with mileage_interval, no events ever logged
    const item = { mileage_interval: 5000, specific_mileage: null, month_interval: null, specific_date: null };
    const result = calculateProjectedDate(item, null, carMileage, avg, TODAY);

    // target = 0 + 5000 = 5000; car already at 12000 → 7000 miles overdue at 40/day = 175 days ago
    expect(result).not.toBeNull();
    expect(result.toDateString()).toBe(daysFrom(TODAY, -175).toDateString());
  });

  test('produces a future projected date when mileage target is still ahead', () => {
    // Car has one event 10 days ago at 1000 mi; current mileage 1100 → 10 mi/day
    const allEvents = [{ date: daysFrom(TODAY, -10), mileage: 1000 }];
    const carMileage = 1100;

    const avg = computeAvgMilesPerDay(allEvents, carMileage, TODAY);
    expect(avg).toBeCloseTo(10, 1);

    // Service item: every 5000 miles, never done → target = 5000; need 3900 more at 10/day = 390 days
    const item = { mileage_interval: 5000, specific_mileage: null, month_interval: null, specific_date: null };
    const result = calculateProjectedDate(item, null, carMileage, avg, TODAY);

    expect(result).not.toBeNull();
    expect(result.toDateString()).toBe(daysFrom(TODAY, 390).toDateString());
  });
});
