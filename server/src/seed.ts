import { getDb } from './database';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

const db = getDb();

const password = bcrypt.hashSync('admin123', 10);

const tenantId = uuid();
const adminId = uuid();
const contact1 = uuid();
const contact2 = uuid();
const contact3 = uuid();
const company1 = uuid();
const company2 = uuid();
const deal1 = uuid();
const deal2 = uuid();
const deal3 = uuid();

// Create default tenant (Nomads Cipher)
db.prepare(`INSERT OR IGNORE INTO tenants (id, name, domain, plan, status) VALUES (?, ?, ?, ?, ?)`)
  .run(tenantId, 'Nomads Cipher', 'nomadscipher.com', 'enterprise', 'active');

// Super admin (no tenant_id, role = super_admin)
db.prepare(`INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)`)
  .run(adminId, 'admin@nomadscipher.com', password, 'Yasir Khan', 'super_admin');

// Seed data belongs to the default tenant
db.prepare(`INSERT OR IGNORE INTO companies (id, name, domain, industry, size, city, country, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(company1, 'TechFlow Inc', 'techflow.io', 'Technology', '50-200', 'San Francisco', 'USA', tenantId);
db.prepare(`INSERT OR IGNORE INTO companies (id, name, domain, industry, size, city, country, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(company2, 'GreenLeaf Ventures', 'greenleaf.co', 'Sustainability', '10-50', 'Berlin', 'Germany', tenantId);

db.prepare(`INSERT OR IGNORE INTO contacts (id, name, email, phone, job_title, company_id, status, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(contact1, 'Sarah Johnson', 'sarah@techflow.io', '+1-555-0101', 'CEO', company1, 'active', tenantId);
db.prepare(`INSERT OR IGNORE INTO contacts (id, name, email, phone, job_title, company_id, status, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(contact2, 'Michael Chen', 'michael@techflow.io', '+1-555-0102', 'CTO', company1, 'active', tenantId);
db.prepare(`INSERT OR IGNORE INTO contacts (id, name, email, phone, job_title, company_id, status, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(contact3, 'Emma Weber', 'emma@greenleaf.co', '+49-30-1234', 'COO', company2, 'active', tenantId);

db.prepare(`INSERT OR IGNORE INTO deals (id, title, value, stage, probability, contact_id, company_id, owner_id, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(deal1, 'Enterprise License', 50000, 'negotiation', 60, contact1, company1, adminId, tenantId);
db.prepare(`INSERT OR IGNORE INTO deals (id, title, value, stage, probability, contact_id, company_id, owner_id, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(deal2, 'Consulting Package', 15000, 'proposal', 30, contact3, company2, adminId, tenantId);
db.prepare(`INSERT OR IGNORE INTO deals (id, title, value, stage, probability, contact_id, company_id, owner_id, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(deal3, 'SaaS Subscription', 24000, 'closed_won', 100, contact2, company1, adminId, tenantId);

db.prepare(`INSERT OR IGNORE INTO activities (id, type, subject, description, status, priority, due_date, contact_id, company_id, assigned_to, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(uuid(), 'call', 'Follow up on proposal', 'Call Sarah about the enterprise license proposal', 'pending', 'high', new Date(Date.now() + 86400000 * 2).toISOString(), contact1, company1, adminId, tenantId);
db.prepare(`INSERT OR IGNORE INTO activities (id, type, subject, description, status, priority, due_date, contact_id, company_id, assigned_to, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(uuid(), 'meeting', 'Product demo', 'Demo new features to GreenLeaf team', 'scheduled', 'medium', new Date(Date.now() + 86400000 * 5).toISOString(), contact3, company2, adminId, tenantId);

console.log('Database seeded successfully!');
console.log('Super Admin Login: admin@nomadscipher.com / admin123');
