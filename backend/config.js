const env = process.env.NODE_ENV || 'development';

const DB_NAMES = {
  development: 'cargo_db_dev',
  test: 'cargo_db_test',
  production: 'cargo_db',
};

module.exports = {
  env,
  port: parseInt(process.env.PORT || '8000'),
  db: {
    user: process.env.DB_USER || 'cargo_user',
    host: process.env.DB_HOST || 'localhost',
    name: process.env.DB_NAME || DB_NAMES[env] || `cargo_db_${env}`,
    password: process.env.DB_PASSWORD || 'cargo_password',
    port: parseInt(process.env.DB_PORT || '5432'),
  },
};
