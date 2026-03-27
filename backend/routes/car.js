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

      // Fetch service items
      const serviceItemsResult = await pool.query(
        'SELECT * FROM service_items WHERE car_id = $1 ORDER BY title',
        [carId]
      );
      const serviceItems = serviceItemsResult.rows;

      // Fetch service events for all service items
      const serviceEvents = [];
      for (const item of serviceItems) {
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

      res.render('car', { car, serviceItems, serviceEvents });
    } catch (err) {
      console.error('Error fetching car details:', err);
      res.status(500).send('Error loading car details');
    }
  });

  return router;
};
