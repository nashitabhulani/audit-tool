import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');

let db = null;

export async function getDbConnection() {
  if (db) return db;

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS deliverables (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      type TEXT NOT NULL,
      input_data TEXT NOT NULL,
      output_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

export async function getAllDeliverables() {
  const database = await getDbConnection();
  return database.all('SELECT id, client_name, type, created_at, updated_at FROM deliverables ORDER BY created_at DESC');
}

export async function getDeliverableById(id) {
  const database = await getDbConnection();
  const deliverable = await database.get('SELECT * FROM deliverables WHERE id = ?', id);
  if (deliverable) {
    deliverable.input_data = JSON.parse(deliverable.input_data);
    deliverable.output_data = JSON.parse(deliverable.output_data);
  }
  return deliverable;
}

export async function createDeliverable({ id, client_name, type, input_data, output_data }) {
  const database = await getDbConnection();
  await database.run(
    `INSERT INTO deliverables (id, client_name, type, input_data, output_data, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    id,
    client_name,
    type,
    JSON.stringify(input_data),
    JSON.stringify(output_data)
  );
  return { id, client_name, type, input_data, output_data };
}

export async function updateDeliverable(id, { output_data }) {
  const database = await getDbConnection();
  const existing = await database.get('SELECT * FROM deliverables WHERE id = ?', id);
  if (!existing) return null;
  
  await database.run(
    `UPDATE deliverables 
     SET output_data = ?, updated_at = datetime('now') 
     WHERE id = ?`,
    JSON.stringify(output_data),
    id
  );
  return getDeliverableById(id);
}

export async function deleteDeliverable(id) {
  const database = await getDbConnection();
  const existing = await database.get('SELECT * FROM deliverables WHERE id = ?', id);
  if (!existing) return false;
  
  await database.run('DELETE FROM deliverables WHERE id = ?', id);
  return true;
}
