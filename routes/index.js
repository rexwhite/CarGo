const { Router } = require('express');

module.exports = (pool) => {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM cars ORDER BY name');
      res.render('index', { cars: result.rows });
    } catch (err) {
      console.error('Error fetching cars:', err);
      res.status(500).send('Error loading cars');
    }
  });

  return router;
};
