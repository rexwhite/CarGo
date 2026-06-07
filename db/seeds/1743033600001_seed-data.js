/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO cars (name, make, model, year, mileage, vin, license_plate) VALUES
      ('Daily Driver', 'Toyota', 'Camry', 2018, 45230, '1ABC234567890DEFG', 'ABC-1234'),
      ('Weekend Cruiser', 'Honda', 'Civic', 2020, 12500, '2H1GH567890JKLMNO', 'CRUISIN'),
      ('Old Reliable', 'Ford', 'F-150', 2015, 89300, NULL, 'PLOW-TRK');

    INSERT INTO service_items (car_id, title, description, mileage_interval, month_interval) VALUES
      (1, 'Oil Change', 'Replace engine oil and filter', 5000, 6),
      (1, 'Tire Rotation', 'Rotate tires to ensure even wear', 7500, NULL),
      (1, 'Air Filter Replacement', 'Replace engine air filter', 15000, 12),
      (1, 'Brake Inspection', 'Inspect brake pads and rotors', 10000, 12),
      (1, 'Transmission Fluid', 'Change transmission fluid', 60000, 48),
      (2, 'Oil Change', 'Synthetic oil change', 7500, 6),
      (2, 'Tire Rotation', 'Rotate and balance tires', 7500, NULL),
      (2, 'Cabin Air Filter', 'Replace cabin air filter', 15000, 12),
      (2, 'Coolant Flush', 'Flush and replace coolant', 30000, 24),
      (2, 'Spark Plugs', 'Replace spark plugs', 30000, NULL),
      (3, 'Oil Change', 'Heavy duty oil change', 5000, 6),
      (3, 'Tire Rotation', 'Rotate all four tires', 5000, NULL),
      (3, 'Battery Check', 'Test battery and clean terminals', NULL, 6),
      (3, 'Differential Service', 'Change differential fluid', 30000, 24),
      (3, 'Fuel Filter', 'Replace fuel filter', 20000, 24),
      (3, 'Brake Fluid', 'Flush and replace brake fluid', 30000, 36);

    WITH
      ev1  AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (1, '2024-01-15', 40000, 'Quick Lube')    RETURNING id),
      ev2  AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (1, '2024-02-05', 41000, 'Brake Masters') RETURNING id),
      ev3  AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (1, '2024-03-10', 42000, 'Tire Shop')     RETURNING id),
      ev4  AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (1, '2024-06-20', 45000, 'Quick Lube')    RETURNING id),
      ev5  AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (1, '2025-04-15', 45100, 'Brake Masters') RETURNING id),
      ev6  AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (1, '2026-01-15', 45200, 'DIY')           RETURNING id),
      ev7  AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (2, '2024-04-12', 10000, 'Honda Dealer')  RETURNING id),
      ev8  AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (2, '2025-10-01', 11000, 'Tire Shop')     RETURNING id),
      ev9  AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (3, '2024-01-08', 85000, 'DIY')           RETURNING id),
      ev10 AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (3, '2024-03-20', 87000, 'DIY')           RETURNING id),
      ev11 AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (3, '2024-05-01', 88000, 'AutoZone')      RETURNING id),
      ev12 AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (3, '2024-06-15', 89000, 'DIY')           RETURNING id),
      ev13 AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (3, '2025-03-01', 89100, 'DIY')           RETURNING id),
      ev14 AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (3, '2025-06-01', 89200, 'Ford Dealer')   RETURNING id),
      ev15 AS (INSERT INTO service_events (car_id, date, mileage, performed_by) VALUES (3, '2025-09-01', 89300, 'DIY')           RETURNING id)
    INSERT INTO service_event_items (event_id, service_item_id, notes)
      SELECT ev1.id,  1,  'Used synthetic blend oil'         FROM ev1
      UNION ALL SELECT ev2.id,  4,  'Brake pads at 50% life'         FROM ev2
      UNION ALL SELECT ev3.id,  2,  'Rotated all four tires'         FROM ev3
      UNION ALL SELECT ev4.id,  1,  'Replaced oil filter'            FROM ev4
      UNION ALL SELECT ev5.id,  4,  'Brake pads at 30% life'         FROM ev5
      UNION ALL SELECT ev6.id,  3,  'Replaced engine air filter'     FROM ev6
      UNION ALL SELECT ev7.id,  6,  'First oil change, complimentary' FROM ev7
      UNION ALL SELECT ev7.id,  7,  'Rotated during oil change'      FROM ev7
      UNION ALL SELECT ev8.id,  7,  'Rotated and balanced tires'     FROM ev8
      UNION ALL SELECT ev9.id,  11, 'Changed oil in garage'          FROM ev9
      UNION ALL SELECT ev10.id, 12, 'Rotated tires, checked pressure' FROM ev10
      UNION ALL SELECT ev11.id, 13, 'Battery tested, cleaned terminals' FROM ev11
      UNION ALL SELECT ev12.id, 11, 'Used Mobil 1 synthetic'         FROM ev12
      UNION ALL SELECT ev13.id, 15, 'Replaced fuel filter'           FROM ev13
      UNION ALL SELECT ev14.id, 14, 'Changed differential fluid'     FROM ev14
      UNION ALL SELECT ev15.id, 16, 'Flushed and replaced brake fluid' FROM ev15;
  `);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.sql(`
    TRUNCATE cars RESTART IDENTITY CASCADE;
  `);
};
