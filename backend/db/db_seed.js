const pool = require('./pool');

async function db_seed() {
  try {
    console.log('Running database migrations...');

    const sql = "-- Insert sample data\n" +
        "INSERT INTO cars (name, make, model, year, mileage) VALUES\n" +
        "    ('Daily Driver', 'Toyota', 'Camry', 2018, 45230),\n" +
        "    ('Weekend Cruiser', 'Honda', 'Civic', 2020, 12500),\n" +
        "    ('Old Reliable', 'Ford', 'F-150', 2015, 89000);" +
        "-- Insert sample maintenance items for Daily Driver (Toyota Camry)\n" +
        "\n" +
        "INSERT INTO maintenance_items (car_id, title, description, mileage_interval, month_interval) VALUES\n" +
        "    (1, 'Oil Change', 'Replace engine oil and filter', 5000, 6),\n" +
        "    (1, 'Tire Rotation', 'Rotate tires to ensure even wear', 7500, NULL),\n" +
        "    (1, 'Air Filter Replacement', 'Replace engine air filter', 15000, 12),\n" +
        "    (1, 'Brake Inspection', 'Inspect brake pads and rotors', 10000, 12),\n" +
        "    (1, 'Transmission Fluid', 'Change transmission fluid', 60000, 48);\n" +
        "\n" +
        "-- Insert sample maintenance items for Weekend Cruiser (Honda Civic)\n" +
        "INSERT INTO maintenance_items (car_id, title, description, mileage_interval, month_interval) VALUES\n" +
        "    (2, 'Oil Change', 'Synthetic oil change', 7500, 6),\n" +
        "    (2, 'Tire Rotation', 'Rotate and balance tires', 7500, NULL),\n" +
        "    (2, 'Cabin Air Filter', 'Replace cabin air filter', 15000, 12),\n" +
        "    (2, 'Coolant Flush', 'Flush and replace coolant', 30000, 24),\n" +
        "    (2, 'Spark Plugs', 'Replace spark plugs', 30000, NULL);\n" +
        "\n" +
        "-- Insert sample maintenance items for Old Reliable (Ford F-150)\n" +
        "INSERT INTO maintenance_items (car_id, title, description, mileage_interval, month_interval) VALUES\n" +
        "    (3, 'Oil Change', 'Heavy duty oil change', 5000, 6),\n" +
        "    (3, 'Tire Rotation', 'Rotate all four tires', 5000, NULL),\n" +
        "    (3, 'Battery Check', 'Test battery and clean terminals', NULL, 6),\n" +
        "    (3, 'Differential Service', 'Change differential fluid', 30000, 24),\n" +
        "    (3, 'Fuel Filter', 'Replace fuel filter', 20000, 24),\n" +
        "    (3, 'Brake Fluid', 'Flush and replace brake fluid', 30000, 36);";

    await pool.query(sql);

    console.log('Database migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  }
}

module.exports = db_seed;
