/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('cars', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    make: { type: 'varchar(100)', notNull: true },
    model: { type: 'varchar(100)', notNull: true },
    year: { type: 'integer', notNull: true },
    mileage: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('service_items', {
    id: { type: 'serial', primaryKey: true },
    car_id: {
      type: 'integer',
      notNull: true,
      references: '"cars"',
      onDelete: 'CASCADE',
    },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    mileage_interval: { type: 'integer' },
    month_interval: { type: 'integer' },
    specific_mileage: { type: 'integer' },
    specific_date: { type: 'date' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('service_events', {
    id: { type: 'serial', primaryKey: true },
    service_item_id: {
      type: 'integer',
      notNull: true,
      references: '"service_items"',
      onDelete: 'CASCADE',
    },
    date: { type: 'date', notNull: true },
    mileage: { type: 'integer', notNull: true },
    performed_by: { type: 'varchar(255)' },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('service_events');
  pgm.dropTable('service_items');
  pgm.dropTable('cars');
};
