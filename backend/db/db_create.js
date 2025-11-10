const pool = require('./pool');

async function db_create() {
    try {
        console.log('Running database initialization...');

        const sql = " \
            -- Drop existing tables if they exist\n\
            DROP TABLE IF EXISTS maintenance_items CASCADE;\n\
            DROP TABLE IF EXISTS cars CASCADE;\n\
            \n\
            -- Create cars table\n\
            CREATE TABLE cars (\n\
                id SERIAL PRIMARY KEY,\n\
                name VARCHAR(255) NOT NULL,\n\
                make VARCHAR(100) NOT NULL,\n\
                model VARCHAR(100) NOT NULL,\n\
                year INTEGER NOT NULL,\n\
                mileage INTEGER NOT NULL,\n\
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n\
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n\
            );\n\
            -- Create maintenance_items table\n\
            CREATE TABLE maintenance_items (\n\
                id SERIAL PRIMARY KEY,\n\
                car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,\n\
                title VARCHAR(255) NOT NULL,\n\
                description TEXT,\n\
                mileage_interval INTEGER,\n\
                month_interval INTEGER,\n\
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n\
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n\
            );";

        await pool.query(sql);

        console.log('Database initialization completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error running initialization:', err);
        process.exit(1);
    }
}

module.exports = db_create;