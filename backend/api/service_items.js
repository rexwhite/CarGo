const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all service items for a specific car
  router.get('/car/:carId', async (req, res) => {
    try {
      const { carId } = req.params;
      const result = await pool.query(
        'SELECT * FROM service_items WHERE car_id = $1 ORDER BY id',
        [carId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching service items:', err);
      res.status(500).json({ error: 'Failed to fetch service items' });
    }
  });

  // Get a single service item by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM service_items WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Service item not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching service item:', err);
      res.status(500).json({ error: 'Failed to fetch service item' });
    }
  });

  // Create a new service item
  router.post('/', async (req, res) => {
    try {
      const { car_id, title, description, mileage_interval, month_interval } = req.body;
      const result = await pool.query(
        'INSERT INTO service_items (car_id, title, description, mileage_interval, month_interval) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [car_id, title, description, mileage_interval, month_interval]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating service item:', err);
      res.status(500).json({ error: 'Failed to create service item' });
    }
  });

  // Update a service item
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, mileage_interval, month_interval } = req.body;
      const result = await pool.query(
        'UPDATE service_items SET title = $1, description = $2, mileage_interval = $3, month_interval = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
        [title, description, mileage_interval, month_interval, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Service item not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating service item:', err);
      res.status(500).json({ error: 'Failed to update service item' });
    }
  });

  // Delete a service item
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM service_items WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Service item not found' });
      }
      res.json({ message: 'Service item deleted successfully', service_item: result.rows[0] });
    } catch (err) {
      console.error('Error deleting service item:', err);
      res.status(500).json({ error: 'Failed to delete service item' });
    }
  });

  return router;
};
