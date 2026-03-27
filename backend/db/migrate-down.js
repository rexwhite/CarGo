const { migrate } = require('node-pg-migrate');
const { dbName, connectionConfig } = require('./migrate');
const { env } = require('../config');

const databaseUrl = { ...connectionConfig, database: dbName };
const target = process.argv[2]; // optional: "seeds" to roll back seeds instead

const dir = target === 'seeds'
  ? `${__dirname}/migrations/seeds`
  : `${__dirname}/migrations`;

const migrationsTable = target === 'seeds' ? 'pgmigrations_seeds' : 'pgmigrations';

if (target === 'seeds' && env !== 'development' && env !== 'test') {
  console.error('Seed rollback is only allowed in development and test environments.');
  process.exit(1);
}

migrate({
  databaseUrl,
  migrationsTable,
  dir,
  direction: 'down',
  count: 1,
  log: (msg) => console.log(msg),
}).then(() => {
  console.log('Rolled back one migration.');
}).catch((err) => {
  console.error('Rollback failed:', err);
  process.exit(1);
});
