const { Router } = require('express');

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

      res.render('car', { car, serviceItems, allServiceItems, serviceEvents });
    } catch (err) {
      console.error('Error fetching car details:', err);
      res.status(500).send('Error loading car details');
    }
  });

  return router;
};
