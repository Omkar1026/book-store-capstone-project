/**
 * Seed script — populates server/db.json with realistic demo data.
 * Run: npx ts-node scripts/seed-db.ts
 *
 * This is a placeholder; full seed data will be added in Sub-Task 2.
 */
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = path.join(__dirname, '..', 'server', 'db.json');

const db = {
  users: [],
  books: [],
  categories: [],
  publishers: [],
  carts: [],
  orders: [],
  addresses: [],
  recommendations: [],
  reviews: [],
  giftPointsBalances: [],
  paymentMethods: []
};

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
console.log(`Seed complete — wrote empty DB to ${DB_PATH}`);
