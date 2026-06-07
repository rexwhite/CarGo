const { Router } = require('express');
const { computeAvgMilesPerDay, calculateProjectedDate } = require('../api/projectedDate');

module.exports = (pool) => {
  const router = Router();

  router.get('/:id', async (req, res) => {
    try {
      const carId = req.params.id;

      // Fetch car details
      const carResult = await pool.query('SELECT * FROM cars WHERE id = $1', [carId]);
      if (carResult.rows.length === 0) {
        return res.status(404).send('Car not found');
      }
      const car = carResult.rows[0];

      // Fetch all service items for dropdowns and scheduled service table
      const allServiceItemsResult = await pool.query(
        'SELECT * FROM service_items WHERE car_id = $1 ORDER BY title',
        [carId]
      );
      const allServiceItems = allServiceItemsResult.rows;
      const serviceItems = allServiceItems;

      // Fetch all service events with their items, ordered newest first
      const eventsResult = await pool.query(
        `SELECT se.*, sei.id AS sei_id, sei.service_item_id, si.title AS service_item_title, sei.notes AS item_notes
         FROM service_events se
         LEFT JOIN service_event_items sei ON sei.event_id = se.id
         LEFT JOIN service_items si ON si.id = sei.service_item_id
         WHERE se.car_id = $1
         ORDER BY se.date DESC, se.id DESC, sei.id`,
        [carId]
      );

      // Group rows into event objects with items arrays
      const eventMap = new Map();
      for (const row of eventsResult.rows) {
        if (!eventMap.has(row.id)) {
          eventMap.set(row.id, {
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
          eventMap.get(row.id).items.push({
            id: row.sei_id,
            service_item_id: row.service_item_id,
            service_item_title: row.service_item_title,
            notes: row.item_notes,
          });
        }
      }
      const serviceEvents = Array.from(eventMap.values());

      // Calculate average miles per day using event-level date/mileage
      const avgMilesPerDay = computeAvgMilesPerDay(serviceEvents, car.mileage);

      // For each service item, find the most recent event that includes it
      for (const item of serviceItems) {
        let lastEvent = null;
        let lastDate = null;
        for (const event of serviceEvents) {
          const hasItem = event.items.some(i => i.service_item_id === item.id);
          if (hasItem) {
            const eventDate = new Date(event.date);
            if (!lastDate || eventDate > lastDate) {
              lastDate = eventDate;
              lastEvent = { date: event.date, mileage: event.mileage };
            }
          }
        }
        item.projected_date = calculateProjectedDate(item, lastEvent, car, avgMilesPerDay);
      }

      // Tag each item with urgency status based on projected date
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 86400000);

      for (const item of serviceItems) {
        if (!item.projected_date) {
          item.urgency = 'unknown';
        } else if (new Date(item.projected_date) <= now) {
          item.urgency = 'overdue';
        } else if (new Date(item.projected_date) <= in30Days) {
          item.urgency = 'due-soon';
        } else {
          item.urgency = 'ok';
        }
      }

      // Sort scheduled items by projected date, nulls last
      serviceItems.sort((a, b) => {
        if (!a.projected_date && !b.projected_date) return 0;
        if (!a.projected_date) return 1;
        if (!b.projected_date) return -1;

        return new Date(a.projected_date) - new Date(b.projected_date);
      });

      res.render('car', { car, serviceItems, allServiceItems, serviceEvents });
    } catch (err) {
      console.error('Error fetching car details:', err);
      res.status(500).send('Error loading car details');
    }
  });

  router.get('/:id/print', async (req, res) => {
    try {
      const carId = req.params.id;

      // Fetch car details
      const carResult = await pool.query('SELECT * FROM cars WHERE id = $1', [carId]);
      if (carResult.rows.length === 0) {
        return res.status(404).send('Car not found');
      }
      const car = carResult.rows[0];

      // Fetch all service events with their items, ordered newest first
      const eventsResult = await pool.query(
        `SELECT se.*, sei.id AS sei_id, sei.service_item_id, si.title AS service_item_title, sei.notes AS item_notes
         FROM service_events se
         LEFT JOIN service_event_items sei ON sei.event_id = se.id
         LEFT JOIN service_items si ON si.id = sei.service_item_id
         WHERE se.car_id = $1
         ORDER BY se.date DESC, se.id DESC, sei.id`,
        [carId]
      );

      // Group rows into event objects with items arrays
      const eventMap = new Map();
      for (const row of eventsResult.rows) {
        if (!eventMap.has(row.id)) {
          eventMap.set(row.id, {
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
          eventMap.get(row.id).items.push({
            id: row.sei_id,
            service_item_id: row.service_item_id,
            service_item_title: row.service_item_title,
            notes: row.item_notes,
          });
        }
      }
      const serviceEvents = Array.from(eventMap.values());

      res.render('car_print', { car, serviceEvents });
    } catch (err) {
      console.error('Error fetching car print details:', err);
      res.status(500).send('Error loading print view');
    }
  });

  router.get('/:id/events/:eventId', async (req, res) => {
    try {
      const { id: carId, eventId } = req.params;

      // Fetch car details
      const carResult = await pool.query('SELECT * FROM cars WHERE id = $1', [carId]);
      if (carResult.rows.length === 0) {
        return res.status(404).send('Car not found');
      }
      const car = carResult.rows[0];

      // Fetch the specific service event
      const eventResult = await pool.query(
        `SELECT se.*, sei.id AS sei_id, sei.service_item_id, si.title AS service_item_title, sei.notes AS item_notes
         FROM service_events se
         LEFT JOIN service_event_items sei ON sei.event_id = se.id
         LEFT JOIN service_items si ON si.id = sei.service_item_id
         WHERE se.car_id = $1 AND se.id = $2`,
        [carId, eventId]
      );

      if (eventResult.rows.length === 0) {
        return res.status(404).send('Service event not found');
      }

      // Group rows into a single event object
      const rows = eventResult.rows;
      const event = {
        id: rows[0].id,
        car_id: rows[0].car_id,
        date: rows[0].date,
        mileage: rows[0].mileage,
        performed_by: rows[0].performed_by,
        description: rows[0].description,
        notes: rows[0].notes,
        created_at: rows[0].created_at,
        updated_at: rows[0].updated_at,
        items: [],
      };

      for (const row of rows) {
        if (row.sei_id) {
          event.items.push({
            id: row.sei_id,
            service_item_id: row.service_item_id,
            service_item_title: row.service_item_title,
            notes: row.item_notes,
          });
        }
      }

      res.render('event_details', { car, event });
    } catch (err) {
      console.error('Error fetching event details:', err);
      res.status(500).send('Error loading event details');
    }
  });

  return router;
};
