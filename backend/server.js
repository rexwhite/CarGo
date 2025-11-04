const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8000;

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'cargo_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cargo_db',
  password: process.env.DB_PASSWORD || 'cargo_password',
  port: process.env.DB_PORT || 5432,
});

app.use(express.json());

// API routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from CarGo!' });
});

app.get('/api/cars', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The "catchall" handler: for any request that doesn't
// match an API route, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`CarGo server running on port ${PORT}`);
});
