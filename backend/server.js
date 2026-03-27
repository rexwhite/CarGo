const express = require('express');
const path = require('path');
const pool = require('./db/pool');
const { runMigrations } = require('./db/migrate');
const { port: PORT } = require('./config');

const app = express();

// Set up Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use('/api', require('./api')(pool));

// Main page - list all cars
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars ORDER BY name');
    res.render('index', { cars: result.rows });
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).send('Error loading cars');
  }
});

// Car details page
app.get('/car/:id', async (req, res) => {
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

runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`CarGo server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to run migrations:', err);
  process.exit(1);
});
