import { getDb } from './database';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

const db = getDb();

const password = bcrypt.hashSync('admin123', 10);

const adminId = uuid();
const contact1 = uuid();
const contact2 = uuid();
const contact3 = uuid();
const company1 = uuid();
const company2 = uuid();
const deal1 = uuid();
const deal2 = uuid();
const deal3 = uuid();

db.prepare(`INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)`).run(adminId, 'admin@nomadscipher.com', password, 'Yasir Khan', 'admin');

db.prepare(`INSERT OR IGNORE INTO companies (id, name, domain, industry, size, city, country) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(company1, 'TechFlow Inc', 'techflow.io', 'Technology', '50-200', 'San Francisco', 'USA');
db.prepare(`INSERT OR IGNORE INTO companies (id, name, domain, industry, size, city, country) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(company2, 'GreenLeaf Ventures', 'greenleaf.co', 'Sustainability', '10-50', 'Berlin', 'Germany');

db.prepare(`INSERT OR IGNORE INTO contacts (id, name, email, phone, job_title, company_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(contact1, 'Sarah Johnson', 'sarah@techflow.io', '+1-555-0101', 'CEO', company1, 'active');
db.prepare(`INSERT OR IGNORE INTO contacts (id, name, email, phone, job_title, company_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(contact2, 'Michael Chen', 'michael@techflow.io', '+1-555-0102', 'CTO', company1, 'active');
db.prepare(`INSERT OR IGNORE INTO contacts (id, name, email, phone, job_title, company_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(contact3, 'Emma Weber', 'emma@greenleaf.co', '+49-30-1234', 'COO', company2, 'active');

db.prepare(`INSERT OR IGNORE INTO deals (id, title, value, stage, probability, contact_id, company_id, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(deal1, 'Enterprise License', 50000, 'negotiation', 60, contact1, company1, adminId);
db.prepare(`INSERT OR IGNORE INTO deals (id, title, value, stage, probability, contact_id, company_id, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(deal2, 'Consulting Package', 15000, 'proposal', 30, contact3, company2, adminId);
db.prepare(`INSERT OR IGNORE INTO deals (id, title, value, stage, probability, contact_id, company_id, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(deal3, 'SaaS Subscription', 24000, 'closed_won', 100, contact2, company1, adminId);

db.prepare(`INSERT OR IGNORE INTO activities (id, type, subject, description, status, priority, due_date, contact_id, company_id, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(uuid(), 'call', 'Follow up on proposal', 'Call Sarah about the enterprise license proposal', 'pending', 'high', new Date(Date.now() + 86400000 * 2).toISOString(), contact1, company1, adminId);
db.prepare(`INSERT OR IGNORE INTO activities (id, type, subject, description, status, priority, due_date, contact_id, company_id, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(uuid(), 'meeting', 'Product demo', 'Demo new features to GreenLeaf team', 'scheduled', 'medium', new Date(Date.now() + 86400000 * 5).toISOString(), contact3, company2, adminId);

console.log('Database seeded successfully!');
console.log('Login: admin@nomadscipher.com / admin123');
