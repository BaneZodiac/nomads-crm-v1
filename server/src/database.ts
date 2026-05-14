import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'crm.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    migrate();
  }
  return db;
}

function hasColumn(table: string, column: string): boolean {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
  return cols.some((c: any) => c.name === column);
}

function migrate() {
  const migrations = [
    ['users', 'tenant_id', 'TEXT REFERENCES tenants(id)'],
    ['users', 'is_tenant_admin', "INTEGER DEFAULT 0"],
    ['contacts', 'tenant_id', 'TEXT REFERENCES tenants(id)'],
    ['companies', 'tenant_id', 'TEXT REFERENCES tenants(id)'],
    ['deals', 'tenant_id', 'TEXT REFERENCES tenants(id)'],
    ['activities', 'tenant_id', 'TEXT REFERENCES tenants(id)'],
    ['notes', 'tenant_id', 'TEXT REFERENCES tenants(id)'],
    ['comments', 'tenant_id', 'TEXT REFERENCES tenants(id)'],
    ['quotes', 'tenant_id', 'TEXT REFERENCES tenants(id)'],
  ];
  for (const [table, column, def] of migrations) {
    if (!hasColumn(table, column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
    }
  }

  const superAdmin = db.prepare("SELECT id FROM users WHERE role = 'super_admin'").get();
  if (!superAdmin) {
    const existingAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin'").get() as any;
    if (existingAdmin) {
      db.prepare("UPDATE users SET role = 'super_admin' WHERE id = ?").run(existingAdmin.id);
    }
  }
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT,
      plan TEXT DEFAULT 'free',
      status TEXT DEFAULT 'active',
      modules TEXT DEFAULT '["contacts","companies","deals","activities","notes","quotes"]',
      settings TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      job_title TEXT,
      company_id TEXT,
      status TEXT DEFAULT 'active',
      source TEXT,
      notes TEXT,
      avatar TEXT,
      created_by TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT,
      industry TEXT,
      size TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      country TEXT,
      website TEXT,
      notes TEXT,
      logo TEXT,
      created_by TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      value REAL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      stage TEXT DEFAULT 'lead',
      probability INTEGER DEFAULT 10,
      contact_id TEXT REFERENCES contacts(id),
      company_id TEXT REFERENCES companies(id),
      owner_id TEXT REFERENCES users(id),
      notes TEXT,
      expected_close_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      contact_id TEXT REFERENCES contacts(id),
      company_id TEXT REFERENCES companies(id),
      deal_id TEXT REFERENCES deals(id),
      assigned_to TEXT REFERENCES users(id),
      created_by TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      contact_id TEXT REFERENCES contacts(id),
      company_id TEXT REFERENCES companies(id),
      deal_id TEXT REFERENCES deals(id),
      created_by TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      contact_id TEXT REFERENCES contacts(id),
      deal_id TEXT REFERENCES deals(id),
      created_by TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      value REAL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      contact_id TEXT REFERENCES contacts(id),
      company_id TEXT REFERENCES companies(id),
      deal_id TEXT REFERENCES deals(id),
      items TEXT DEFAULT '[]',
      notes TEXT,
      created_by TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const existingSettings = db.prepare('SELECT COUNT(*) as count FROM settings').get() as any;
  if (existingSettings.count === 0) {
    const defaults = [
      ['timezone', 'UTC'],
      ['currency', 'USD'],
      ['currency_symbol', '$'],
      ['date_format', 'MM/DD/YYYY'],
      ['company_name', 'Nomads Cipher'],
      ['language', 'en'],
      ['business_hours_start', '09:00'],
      ['business_hours_end', '17:00'],
    ];
    const insert = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    defaults.forEach(([k, v]) => insert.run(k, v));
  }
}
