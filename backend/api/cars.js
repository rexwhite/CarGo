const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all cars
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM cars ORDER BY id');
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching cars:', err);
      res.status(500).json({ error: 'Failed to fetch cars' });
    }
  });

  // Get a single car by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Car not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching car:', err);
      res.status(500).json({ error: 'Failed to fetch car' });
    }
  });

  // Create a new car
  router.post('/', async (req, res) => {
    try {
      const { name, make, model, year, mileage } = req.body;
      const result = await pool.query(
        'INSERT INTO cars (name, make, model, year, mileage) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, make, model, year, mileage]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating car:', err);
      res.status(500).json({ error: 'Failed to create car' });
    }
  });

  // Update a car
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, make, model, year, mileage } = req.body;
      const result = await pool.query(
        'UPDATE cars SET name = $1, make = $2, model = $3, year = $4, mileage = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
        [name, make, model, year, mileage, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Car not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating car:', err);
      res.status(500).json({ error: 'Failed to update car' });
    }
  });

  // Delete a car
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Car not found' });
      }
      res.json({ message: 'Car deleted successfully', car: result.rows[0] });
    } catch (err) {
      console.error('Error deleting car:', err);
      res.status(500).json({ error: 'Failed to delete car' });
    }
  });

  return router;
};
