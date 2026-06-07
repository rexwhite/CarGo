const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all service events for a car with their items
  router.get('/car/:carId', async (req, res) => {
    try {
      const { carId } = req.params;
      const result = await pool.query(
        `SELECT se.*, sei.id AS sei_id, sei.service_item_id, si.title AS service_item_title, sei.notes AS item_notes
         FROM service_events se
         LEFT JOIN service_event_items sei ON sei.event_id = se.id
         LEFT JOIN service_items si ON si.id = sei.service_item_id
         WHERE se.car_id = $1
         ORDER BY se.date DESC, se.id DESC, sei.id`,
        [carId]
      );
      const events = groupEventRows(result.rows);
      res.json(events);
    } catch (err) {
      console.error('Error fetching service events:', err);
      res.status(500).json({ error: 'Failed to fetch service events' });
    }
  });

  // Get a single service event by ID with its items
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT se.*, sei.id AS sei_id, sei.service_item_id, si.title AS service_item_title, sei.notes AS item_notes
         FROM service_events se
         LEFT JOIN service_event_items sei ON sei.event_id = se.id
         LEFT JOIN service_items si ON si.id = sei.service_item_id
         WHERE se.id = $1
         ORDER BY sei.id`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Service event not found' });
      }
      res.json(groupEventRows(result.rows)[0]);
    } catch (err) {
      console.error('Error fetching service event:', err);
      res.status(500).json({ error: 'Failed to fetch service event' });
    }
  });

  // Create a new service event with items
  router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
      const { car_id, date, mileage, performed_by, description, notes, items } = req.body;
      await client.query('BEGIN');

      const eventResult = await client.query(
        `INSERT INTO service_events (car_id, date, mileage, performed_by, description, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [car_id, date, mileage, performed_by || null, description || null, notes || null]
      );
      const event = eventResult.rows[0];

      for (const item of (items || [])) {
        await client.query(
          `INSERT INTO service_event_items (event_id, service_item_id, notes) VALUES ($1, $2, $3)`,
          [event.id, item.service_item_id, item.notes || null]
        );
      }

      // Update car mileage if this event's mileage exceeds the current value
      await client.query(
        `UPDATE cars SET mileage = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND mileage < $1`,
        [mileage, car_id]
      );

      await client.query('COMMIT');

      const fullEvent = await getEventWithItems(pool, event.id);
      res.status(201).json(fullEvent);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error creating service event:', err);
      res.status(500).json({ error: 'Failed to create service event' });
    } finally {
      client.release();
    }
  });

  // Update a service event and replace its items
  router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const { date, mileage, performed_by, description, notes, items } = req.body;
      await client.query('BEGIN');

      const eventResult = await client.query(
        `UPDATE service_events
         SET date = $1, mileage = $2, performed_by = $3, description = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 RETURNING *`,
        [date, mileage, performed_by || null, description || null, notes || null, id]
      );
      if (eventResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Service event not found' });
      }

      await client.query('DELETE FROM service_event_items WHERE event_id = $1', [id]);
      for (const item of (items || [])) {
        await client.query(
          `INSERT INTO service_event_items (event_id, service_item_id, notes) VALUES ($1, $2, $3)`,
          [id, item.service_item_id, item.notes || null]
        );
      }

      await client.query('COMMIT');

      const fullEvent = await getEventWithItems(pool, id);
      res.json(fullEvent);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error updating service event:', err);
      res.status(500).json({ error: 'Failed to update service event' });
    } finally {
      client.release();
    }
  });

  // Delete a service event (CASCADE removes service_event_items)
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

async function getEventWithItems(pool, eventId) {
  const result = await pool.query(
    `SELECT se.*, sei.id AS sei_id, sei.service_item_id, si.title AS service_item_title, sei.notes AS item_notes
     FROM service_events se
     LEFT JOIN service_event_items sei ON sei.event_id = se.id
     LEFT JOIN service_items si ON si.id = sei.service_item_id
     WHERE se.id = $1
     ORDER BY sei.id`,
    [eventId]
  );
  return groupEventRows(result.rows)[0];
}

function groupEventRows(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        car_id: row.car_id,
        date: row.date,
        mileage: row.mileage,
        performed_by: row.performed_by,
        description: row.description,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        items: [],
      });
    }
    if (row.sei_id) {
      map.get(row.id).items.push({
        id: row.sei_id,
        service_item_id: row.service_item_id,
        service_item_title: row.service_item_title,
        notes: row.item_notes,
      });
    }
  }
  return Array.from(map.values());
}
