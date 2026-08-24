import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');

const supabaseUrl = process.env.SUPABASE_URL || 'https://qlrxlrnjvbzcjutswvit.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_Kba25fZcuUZcudMFVH0HlA_n-Iis574';

const useSupabase = Boolean(supabaseUrl && supabaseKey);
let supabase = null;

if (useSupabase) {
  console.log('[Database] Connecting to Supabase Cloud Database...');
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.log('[Database] Using local SQLite database (SUPABASE_URL / SUPABASE_KEY not set).');
}

let sqliteDb = null;

async function getSqliteDbConnection() {
  if (sqliteDb) return sqliteDb;

  sqliteDb = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create table if SQLite is used
  await sqliteDb.exec(`
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

  return sqliteDb;
}

// Helper to parse JSON safely
function parseJsonIfNeeded(val) {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
  return val;
}

// 1. Get All Deliverables
export async function getAllDeliverables() {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('deliverables')
      .select('id, client_name, type, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase Error] getAllDeliverables:', error);
      throw error;
    }
    return data || [];
  }

  const database = await getSqliteDbConnection();
  return database.all('SELECT id, client_name, type, created_at, updated_at FROM deliverables ORDER BY created_at DESC');
}

// 2. Get Deliverable By ID
export async function getDeliverableById(id) {
  if (useSupabase) {
    const cleanId = String(id).trim();
    const { data, error } = await supabase
      .from('deliverables')
      .select('*')
      .eq('id', cleanId)
      .maybeSingle();

    if (error) {
      console.error('[Supabase Error] getDeliverableById:', error);
      throw error;
    }

    if (data) {
      data.input_data = parseJsonIfNeeded(data.input_data);
      data.output_data = parseJsonIfNeeded(data.output_data);
    }
    return data;
  }

  const database = await getSqliteDbConnection();
  const deliverable = await database.get('SELECT * FROM deliverables WHERE id = ?', id);
  if (deliverable) {
    deliverable.input_data = parseJsonIfNeeded(deliverable.input_data);
    deliverable.output_data = parseJsonIfNeeded(deliverable.output_data);
  }
  return deliverable;
}

// 3. Create Deliverable
export async function createDeliverable({ id, client_name, type, input_data, output_data }) {
  if (useSupabase) {
    const now = new Date().toISOString();
    const payload = {
      id,
      client_name,
      type,
      input_data,
      output_data,
      created_at: now,
      updated_at: now
    };

    const { data, error } = await supabase
      .from('deliverables')
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Supabase Error] createDeliverable:', error);
      throw error;
    }

    return {
      ...data,
      input_data: parseJsonIfNeeded(data.input_data),
      output_data: parseJsonIfNeeded(data.output_data)
    };
  }

  const database = await getSqliteDbConnection();
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

// 4. Update Deliverable
export async function updateDeliverable(id, { output_data }) {
  if (useSupabase) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('deliverables')
      .update({
        output_data,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Supabase Error] updateDeliverable:', error);
      throw error;
    }

    if (!data) return null;
    return {
      ...data,
      input_data: parseJsonIfNeeded(data.input_data),
      output_data: parseJsonIfNeeded(data.output_data)
    };
  }

  const database = await getSqliteDbConnection();
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

// 5. Delete Deliverable
export async function deleteDeliverable(id) {
  if (useSupabase) {
    const { error } = await supabase
      .from('deliverables')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase Error] deleteDeliverable:', error);
      throw error;
    }
    return true;
  }

  const database = await getSqliteDbConnection();
  const existing = await database.get('SELECT * FROM deliverables WHERE id = ?', id);
  if (!existing) return false;

  await database.run('DELETE FROM deliverables WHERE id = ?', id);
  return true;
}
