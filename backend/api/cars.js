const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM cars ORDER BY id');
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching cars:', err);
      res.status(500).json({ error: 'Failed to fetch cars' });
    }
  });

  return router;
};
