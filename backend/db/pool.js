const { Pool } = require('pg');
const { db } = require('../config');

const pool = new Pool({
  user: db.user,
  host: db.host,
  database: db.name,
  password: db.password,
  port: db.port,
});

module.exports = pool;
