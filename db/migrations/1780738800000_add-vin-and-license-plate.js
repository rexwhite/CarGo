/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.addColumns('cars', {
    vin: { type: 'varchar(17)' },
    license_plate: { type: 'varchar(20)' },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropColumns('cars', ['vin', 'license_plate']);
};
