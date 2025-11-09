const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/hello', (req, res) => {
    res.json({ message: 'Hello from CarGo!' });
  });

  router.use('/cars', require('./cars')(pool));

  return router;
};
