const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'cargo_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cargo_db',
  password: process.env.DB_PASSWORD || 'cargo_password',
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;
