-- Create cars table
CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO cars (name, make, model, year, mileage) VALUES
    ('Daily Driver', 'Toyota', 'Camry', 2018, 45230),
    ('Weekend Cruiser', 'Honda', 'Civic', 2020, 12500),
    ('Old Reliable', 'Ford', 'F-150', 2015, 89000);

-- Create maintenance_items table
CREATE TABLE IF NOT EXISTS maintenance_items (
    id SERIAL PRIMARY KEY,
    car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    mileage_interval INTEGER,
    month_interval INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample maintenance items for Daily Driver (Toyota Camry)
INSERT INTO maintenance_items (car_id, title, description, mileage_interval, month_interval) VALUES
    (1, 'Oil Change', 'Replace engine oil and filter', 5000, 6),
    (1, 'Tire Rotation', 'Rotate tires to ensure even wear', 7500, NULL),
    (1, 'Air Filter Replacement', 'Replace engine air filter', 15000, 12),
    (1, 'Brake Inspection', 'Inspect brake pads and rotors', 10000, 12),
    (1, 'Transmission Fluid', 'Change transmission fluid', 60000, 48);

-- Insert sample maintenance items for Weekend Cruiser (Honda Civic)
INSERT INTO maintenance_items (car_id, title, description, mileage_interval, month_interval) VALUES
    (2, 'Oil Change', 'Synthetic oil change', 7500, 6),
    (2, 'Tire Rotation', 'Rotate and balance tires', 7500, NULL),
    (2, 'Cabin Air Filter', 'Replace cabin air filter', 15000, 12),
    (2, 'Coolant Flush', 'Flush and replace coolant', 30000, 24),
    (2, 'Spark Plugs', 'Replace spark plugs', 30000, NULL);

-- Insert sample maintenance items for Old Reliable (Ford F-150)
INSERT INTO maintenance_items (car_id, title, description, mileage_interval, month_interval) VALUES
    (3, 'Oil Change', 'Heavy duty oil change', 5000, 6),
    (3, 'Tire Rotation', 'Rotate all four tires', 5000, NULL),
    (3, 'Battery Check', 'Test battery and clean terminals', NULL, 6),
    (3, 'Differential Service', 'Change differential fluid', 30000, 24),
    (3, 'Fuel Filter', 'Replace fuel filter', 20000, 24),
    (3, 'Brake Fluid', 'Flush and replace brake fluid', 30000, 36);
