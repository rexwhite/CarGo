#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const name = process.argv[2];
if (!name) {
  console.error('Usage: node db/migration-create.js <migration-name>');
  process.exit(1);
}

const timestamp = Date.now();
const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
const filename = `${timestamp}_${slug}.js`;
const filepath = path.join(__dirname, 'migrations', filename);

const template = `/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // TODO: implement migration
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  // TODO: implement rollback
};
`;

fs.writeFileSync(filepath, template);
console.log(`Created migration: db/migrations/${filename}`);
