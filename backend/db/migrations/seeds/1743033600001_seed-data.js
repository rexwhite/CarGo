/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO cars (name, make, model, year, mileage) VALUES
      ('Daily Driver', 'Toyota', 'Camry', 2018, 45230),
      ('Weekend Cruiser', 'Honda', 'Civic', 2020, 12500),
      ('Old Reliable', 'Ford', 'F-150', 2015, 89000);

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

    INSERT INTO service_events (service_item_id, date, mileage, performed_by, notes) VALUES
      (1, '2024-01-15', 40000, 'Quick Lube', 'Used synthetic blend oil'),
      (1, '2024-06-20', 45000, 'Quick Lube', 'Replaced oil filter'),
      (2, '2024-03-10', 42000, 'Tire Shop', 'Rotated all four tires'),
      (4, '2024-02-05', 41000, 'Brake Masters', 'Brake pads at 50% life'),
      (6, '2024-04-12', 10000, 'Honda Dealer', 'First oil change, complimentary'),
      (7, '2024-04-12', 10000, 'Honda Dealer', 'Rotated during oil change'),
      (11, '2024-01-08', 85000, 'DIY', 'Changed oil in garage'),
      (11, '2024-06-15', 89000, 'DIY', 'Used Mobil 1 synthetic'),
      (12, '2024-03-20', 87000, 'DIY', 'Rotated tires, checked pressure'),
      (13, '2024-05-01', 88000, 'AutoZone', 'Battery tested, cleaned terminals');
  `);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM service_events;
    DELETE FROM service_items;
    DELETE FROM cars;
  `);
};
