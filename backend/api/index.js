const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/hello', (req, res) => {
    res.json({ message: 'Hello from CarGo!' });
  });

  router.use('/cars', require('./cars')(pool));
  router.use('/maintenance-items', require('./maintenance_items')(pool));

  return router;
};
