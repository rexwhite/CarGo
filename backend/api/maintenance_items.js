const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all maintenance items for a specific car
  router.get('/car/:carId', async (req, res) => {
    try {
      const { carId } = req.params;
      const result = await pool.query(
        'SELECT * FROM maintenance_items WHERE car_id = $1 ORDER BY id',
        [carId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching maintenance items:', err);
      res.status(500).json({ error: 'Failed to fetch maintenance items' });
    }
  });

  // Get a single maintenance item by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM maintenance_items WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Maintenance item not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching maintenance item:', err);
      res.status(500).json({ error: 'Failed to fetch maintenance item' });
    }
  });

  // Create a new maintenance item
  router.post('/', async (req, res) => {
    try {
      const { car_id, title, description, mileage_interval, month_interval } = req.body;
      const result = await pool.query(
        'INSERT INTO maintenance_items (car_id, title, description, mileage_interval, month_interval) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [car_id, title, description, mileage_interval, month_interval]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating maintenance item:', err);
      res.status(500).json({ error: 'Failed to create maintenance item' });
    }
  });

  // Update a maintenance item
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, mileage_interval, month_interval } = req.body;
      const result = await pool.query(
        'UPDATE maintenance_items SET title = $1, description = $2, mileage_interval = $3, month_interval = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
        [title, description, mileage_interval, month_interval, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Maintenance item not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating maintenance item:', err);
      res.status(500).json({ error: 'Failed to update maintenance item' });
    }
  });

  // Delete a maintenance item
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM maintenance_items WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Maintenance item not found' });
      }
      res.json({ message: 'Maintenance item deleted successfully', maintenance_item: result.rows[0] });
    } catch (err) {
      console.error('Error deleting maintenance item:', err);
      res.status(500).json({ error: 'Failed to delete maintenance item' });
    }
  });

  return router;
};
