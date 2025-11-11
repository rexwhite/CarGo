const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all service events for a specific service item
  router.get('/service-item/:serviceItemId', async (req, res) => {
    try {
      const { serviceItemId } = req.params;
      const result = await pool.query(
        'SELECT * FROM service_events WHERE service_item_id = $1 ORDER BY date DESC',
        [serviceItemId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching service events:', err);
      res.status(500).json({ error: 'Failed to fetch service events' });
    }
  });

  // Get a single service event by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM service_events WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Service event not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching service event:', err);
      res.status(500).json({ error: 'Failed to fetch service event' });
    }
  });

  // Create a new service event
  router.post('/', async (req, res) => {
    try {
      const { service_item_id, date, mileage, performed_by, notes } = req.body;
      const result = await pool.query(
        'INSERT INTO service_events (service_item_id, date, mileage, performed_by, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [service_item_id, date, mileage, performed_by, notes]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating service event:', err);
      res.status(500).json({ error: 'Failed to create service event' });
    }
  });

  // Update a service event
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { date, mileage, performed_by, notes } = req.body;
      const result = await pool.query(
        'UPDATE service_events SET date = $1, mileage = $2, performed_by = $3, notes = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
        [date, mileage, performed_by, notes, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Service event not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating service event:', err);
      res.status(500).json({ error: 'Failed to update service event' });
    }
  });

  // Delete a service event
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM service_events WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Service event not found' });
      }
      res.json({ message: 'Service event deleted successfully', service_event: result.rows[0] });
    } catch (err) {
      console.error('Error deleting service event:', err);
      res.status(500).json({ error: 'Failed to delete service event' });
    }
  });

  return router;
};
