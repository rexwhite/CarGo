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
