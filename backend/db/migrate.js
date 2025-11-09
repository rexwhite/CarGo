const pool = require('./pool');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    console.log('Running database migrations...');

    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);

    console.log('Database migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  }
}

migrate();
