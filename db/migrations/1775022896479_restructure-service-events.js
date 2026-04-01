/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // 1. Add car_id and description to service_events
  pgm.addColumns('service_events', {
    car_id: { type: 'integer', references: '"cars"', onDelete: 'CASCADE' },
    description: { type: 'text' },
  });

  // 2. Backfill car_id from service_items
  pgm.sql(`
    UPDATE service_events se
    SET car_id = si.car_id
    FROM service_items si
    WHERE se.service_item_id = si.id
  `);

  // 3. Add NOT NULL constraint to car_id
  pgm.alterColumn('service_events', 'car_id', { notNull: true });

  // 4. Create service_event_items table
  pgm.createTable('service_event_items', {
    id: { type: 'serial', primaryKey: true },
    event_id: {
      type: 'integer',
      notNull: true,
      references: '"service_events"',
      onDelete: 'CASCADE',
    },
    service_item_id: {
      type: 'integer',
      notNull: true,
      references: '"service_items"',
      onDelete: 'CASCADE',
    },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // 5. Migrate existing event-item links and notes
  pgm.sql(`
    INSERT INTO service_event_items (event_id, service_item_id, notes)
    SELECT id, service_item_id, notes
    FROM service_events
  `);

  // 6. Drop only service_item_id from service_events (notes stays as event-level field)
  pgm.dropColumn('service_events', 'service_item_id');
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  // Re-add service_item_id to service_events
  pgm.addColumn('service_events', {
    service_item_id: { type: 'integer', references: '"service_items"', onDelete: 'CASCADE' },
  });

  // Restore service_item_id from service_event_items (first entry per event)
  pgm.sql(`
    UPDATE service_events se
    SET service_item_id = sei.service_item_id
    FROM (
      SELECT DISTINCT ON (event_id) event_id, service_item_id
      FROM service_event_items
      ORDER BY event_id, id
    ) sei
    WHERE se.id = sei.event_id
  `);

  // Drop service_event_items table
  pgm.dropTable('service_event_items');

  // Drop car_id and description from service_events
  pgm.dropColumn('service_events', 'car_id');
  pgm.dropColumn('service_events', 'description');
};
