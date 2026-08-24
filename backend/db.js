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
  console.log('[Database] Using local SQLite database.');
}

// In-Memory Fast Cache Store
const memoryStore = new Map();

let sqliteDb = null;

async function getSqliteDbConnection() {
  if (sqliteDb) return sqliteDb;

  try {
    sqliteDb = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

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
  } catch (err) {
    console.warn('[SQLite] SQLite initialization skipped in serverless environment.');
  }

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
  let dbList = [];

  if (useSupabase) {
    try {
      const { data, error } = await supabase
        .from('deliverables')
        .select('id, client_name, type, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbList = data;
      }
    } catch (err) {
      console.warn('[Database] Supabase list read warning:', err.message);
    }
  } else {
    try {
      const database = await getSqliteDbConnection();
      if (database) {
        dbList = await database.all('SELECT id, client_name, type, created_at, updated_at FROM deliverables ORDER BY created_at DESC');
      }
    } catch (err) {
      console.warn('[Database] SQLite list read warning:', err.message);
    }
  }

  // Merge with memory store items
  const dbIds = new Set(dbList.map(item => item.id));
  const memList = [];
  for (const [id, item] of memoryStore.entries()) {
    if (!dbIds.has(id)) {
      memList.push({
        id: item.id,
        client_name: item.client_name,
        type: item.type,
        created_at: item.created_at,
        updated_at: item.updated_at
      });
    }
  }

  return [...memList, ...dbList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// 2. Get Deliverable By ID
export async function getDeliverableById(id) {
  const cleanId = String(id).trim();

  // Fast check: Memory Store
  if (memoryStore.has(cleanId)) {
    return memoryStore.get(cleanId);
  }

  // Check Supabase
  if (useSupabase) {
    try {
      const { data, error } = await supabase
        .from('deliverables')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();

      if (data) {
        data.input_data = parseJsonIfNeeded(data.input_data);
        data.output_data = parseJsonIfNeeded(data.output_data);
        memoryStore.set(cleanId, data);
        return data;
      }
    } catch (err) {
      console.warn('[Database] Supabase getById warning:', err.message);
    }
  }

  // Check SQLite
  try {
    const database = await getSqliteDbConnection();
    if (database) {
      const deliverable = await database.get('SELECT * FROM deliverables WHERE id = ?', cleanId);
      if (deliverable) {
        deliverable.input_data = parseJsonIfNeeded(deliverable.input_data);
        deliverable.output_data = parseJsonIfNeeded(deliverable.output_data);
        memoryStore.set(cleanId, deliverable);
        return deliverable;
      }
    }
  } catch (err) {
    console.warn('[Database] SQLite getById warning:', err.message);
  }

  return null;
}

// 3. Create Deliverable
export async function createDeliverable({ id, client_name, type, input_data, output_data }) {
  const now = new Date().toISOString();
  const record = {
    id,
    client_name,
    type,
    input_data: parseJsonIfNeeded(input_data),
    output_data: parseJsonIfNeeded(output_data),
    created_at: now,
    updated_at: now
  };

  // Always store in memory store immediately
  memoryStore.set(id, record);

  // Write to Supabase asynchronously
  if (useSupabase) {
    try {
      const payload = {
        id,
        client_name,
        type,
        input_data: typeof input_data === 'object' ? JSON.stringify(input_data) : input_data,
        output_data: typeof output_data === 'object' ? JSON.stringify(output_data) : output_data,
        created_at: now,
        updated_at: now
      };
      await supabase.from('deliverables').upsert([payload]);
    } catch (err) {
      console.warn('[Database Warning] Supabase upsert error:', err.message);
    }
  }

  // Write to SQLite asynchronously
  try {
    const database = await getSqliteDbConnection();
    if (database) {
      await database.run(
        `INSERT OR REPLACE INTO deliverables (id, client_name, type, input_data, output_data, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        id,
        client_name,
        type,
        JSON.stringify(input_data),
        JSON.stringify(output_data)
      );
    }
  } catch (err) {
    // Silent fallback
  }

  return record;
}

// 4. Update Deliverable
export async function updateDeliverable(id, { output_data }) {
  const cleanId = String(id).trim();
  const existing = await getDeliverableById(cleanId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updatedRecord = {
    ...existing,
    output_data: parseJsonIfNeeded(output_data),
    updated_at: now
  };

  memoryStore.set(cleanId, updatedRecord);

  if (useSupabase) {
    try {
      const payload = {
        output_data: typeof output_data === 'object' ? JSON.stringify(output_data) : output_data,
        updated_at: now
      };
      await supabase.from('deliverables').update(payload).eq('id', cleanId);
    } catch (err) {
      console.warn('[Database Warning] Supabase update error:', err.message);
    }
  }

  try {
    const database = await getSqliteDbConnection();
    if (database) {
      await database.run(
        `UPDATE deliverables SET output_data = ?, updated_at = datetime('now') WHERE id = ?`,
        JSON.stringify(output_data),
        cleanId
      );
    }
  } catch (err) {
    // Silent fallback
  }

  return updatedRecord;
}

// 5. Delete Deliverable
export async function deleteDeliverable(id) {
  const cleanId = String(id).trim();
  memoryStore.delete(cleanId);

  if (useSupabase) {
    try {
      await supabase.from('deliverables').delete().eq('id', cleanId);
    } catch (err) {
      console.warn('[Database Warning] Supabase delete error:', err.message);
    }
  }

  try {
    const database = await getSqliteDbConnection();
    if (database) {
      await database.run('DELETE FROM deliverables WHERE id = ?', cleanId);
    }
  } catch (err) {
    // Silent fallback
  }

  return true;
}
