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

      // Fetch all service items (used for dropdowns and event history)
      const allServiceItemsResult = await pool.query(
        'SELECT * FROM service_items WHERE car_id = $1 ORDER BY title',
        [carId]
      );
      const allServiceItems = allServiceItemsResult.rows;

      // Scheduled service table: exclude non-repeating items with no specific date
      const serviceItems = allServiceItems.filter(item =>
        item.mileage_interval != null || item.month_interval != null || item.specific_date != null
      );

      // Fetch service events for all service items
      const serviceEvents = [];
      for (const item of allServiceItems) {
        const eventsResult = await pool.query(
          'SELECT * FROM service_events WHERE service_item_id = $1 ORDER BY date DESC',
          [item.id]
        );
        eventsResult.rows.forEach(event => {
          serviceEvents.push({
            ...event,
            service_item_title: item.title
          });
        });
      }

      // Sort all events by date descending
      serviceEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Calculate average miles per day and projected dates
      const avgMilesPerDay = computeAvgMilesPerDay(serviceEvents, car.mileage);

      for (const item of serviceItems) {
        const lastEvent = serviceEvents
          .filter(e => e.service_item_id === item.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
        item.projected_date = calculateProjectedDate(item, lastEvent, car, avgMilesPerDay);
      }

      // Tag each item with a urgency status based on projected date
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 86400000);
      const inOneYear = new Date(now.getTime() + 365 * 86400000);

      for (const item of serviceItems) {
        if (!item.projected_date) {
          item.urgency = 'unknown';
        } else if (new Date(item.projected_date) > inOneYear) {
          item.urgency = 'distant';
        } else if (new Date(item.projected_date) <= now) {
          item.urgency = 'overdue';
        } else if (new Date(item.projected_date) <= in30Days) {
          item.urgency = 'due-soon';
        } else {
          item.urgency = 'ok';
        }
      }

      // Sort scheduled items by projected date, nulls and distant items last
      serviceItems.sort((a, b) => {
        if (!a.projected_date && !b.projected_date) return 0;
        if (!a.projected_date) return 1;
        if (!b.projected_date) return -1;

        const aDistant = new Date(a.projected_date) > inOneYear;
        const bDistant = new Date(b.projected_date) > inOneYear;

        if (aDistant && !bDistant) return 1;
        if (!aDistant && bDistant) return -1;

        return new Date(a.projected_date) - new Date(b.projected_date);
      });

      res.render('car', { car, serviceItems, allServiceItems, serviceEvents });
    } catch (err) {
      console.error('Error fetching car details:', err);
      res.status(500).send('Error loading car details');
    }
  });

  return router;
};
