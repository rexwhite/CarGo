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

// Mount page routes
app.use('/', require('./routes/index')(pool));
app.use('/car', require('./routes/car')(pool));

runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`CarGo server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to run migrations:', err);
  process.exit(1);
});
