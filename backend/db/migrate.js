const { runner: migrate } = require('node-pg-migrate');
const { Client } = require('pg');
const { db, env } = require('../config');

const connectionConfig = {
  user: db.user,
  host: db.host,
  password: db.password,
  port: db.port,
};

const dbName = db.name;

async function runMigrations() {
  // Connect to postgres (not the app DB) to create the database if needed
  const adminClient = new Client({ ...connectionConfig, database: 'postgres' });

  try {
    await adminClient.connect();
    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    if (result.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Created database: ${dbName}`);
    } else {
      console.log(`Database already exists: ${dbName}`);
    }
  } finally {
    await adminClient.end();
  }

  const databaseUrl = { ...connectionConfig, database: dbName };

  // Run schema migrations
  console.log('Applying schema migrations...');
  await migrate({
    databaseUrl,
    migrationsTable: 'pgmigrations',
    dir: `${__dirname}/migrations`,
    direction: 'up',
    log: (msg) => console.log(msg),
  });

  // Run seed migrations in development and test only
  if (env === 'development' || env === 'test') {
    console.log('Applying seed migrations...');
    await migrate({
      databaseUrl,
      migrationsTable: 'pgmigrations_seeds',
      dir: `${__dirname}/migrations/seeds`,
      direction: 'up',
      log: (msg) => console.log(msg),
    });
  }

  console.log('Migrations complete.');
}

module.exports = { runMigrations, dbName, connectionConfig };

if (require.main === module) {
  runMigrations().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
