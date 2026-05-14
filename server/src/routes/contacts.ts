import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, AuthRequest, tenantScope } from '../middleware/auth';

function computeLeadScore(contact: any, db: any): { score: number; factors: { label: string; points: number }[] } {
  const factors: { label: string; points: number }[] = [];
  if (contact.email) { factors.push({ label: 'Email on file', points: 10 }); }
  if (contact.phone) { factors.push({ label: 'Phone on file', points: 10 }); }
  if (contact.company_id) { factors.push({ label: 'Linked to company', points: 15 }); }
  if (contact.job_title) { factors.push({ label: 'Job title on file', points: 5 }); }
  if (contact.source) { factors.push({ label: 'Source on file', points: 5 }); }
  if (contact.status === 'active') { factors.push({ label: 'Active status', points: 10 }); }
  const dealCount = (db.prepare('SELECT COUNT(*) as c FROM deals WHERE contact_id = ?').get(contact.id) as any).c;
  if (dealCount > 0) { factors.push({ label: `${dealCount} deal${dealCount > 1 ? 's' : ''}`, points: dealCount * 10 }); }
  const activityCount = (db.prepare('SELECT COUNT(*) as c FROM activities WHERE contact_id = ?').get(contact.id) as any).c;
  if (activityCount > 0) { factors.push({ label: `${activityCount} activit${activityCount > 1 ? 'ies' : 'y'}`, points: activityCount * 5 }); }
  const total = Math.min(factors.reduce((s, f) => s + f.points, 0), 100);
  return { score: total, factors };
}

function enrichContact(contact: any, db: any) {
  if (!contact) return contact;
  const scoring = computeLeadScore(contact, db);
  return { ...contact, lead_score: scoring.score, lead_factors: scoring.factors };
}

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { search, status, company_id } = req.query;
  const scope = tenantScope(req);
  let sql = `SELECT c.*, comp.name as company_name FROM contacts c LEFT JOIN companies comp ON c.company_id = comp.id WHERE 1=1${scope.filter}`;
  const params: any[] = [...scope.params];
  if (search) { sql += ` AND (c.name LIKE ? OR c.email LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
  if (status) { sql += ` AND c.status = ?`; params.push(status); }
  if (company_id) { sql += ` AND c.company_id = ?`; params.push(company_id); }
  sql += ` ORDER BY c.created_at DESC`;
  const contacts = db.prepare(sql).all(...params);
  res.json(contacts.map((c: any) => enrichContact(c, db)));
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const contact = db.prepare(`SELECT c.*, comp.name as company_name FROM contacts c LEFT JOIN companies comp ON c.company_id = comp.id WHERE c.id = ?${scope.filter}`).get(req.params.id, ...scope.params);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json(enrichContact(contact, db));
});

router.post('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = uuid();
  const { name, email, phone, job_title, company_id, status, source, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  db.prepare(`INSERT INTO contacts (id, name, email, phone, job_title, company_id, status, source, notes, created_by, tenant_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, name, email, phone, job_title, company_id, status || 'active', source, notes, req.user!.id, req.user!.tenant_id || null);
  const contact = db.prepare('SELECT c.*, comp.name as company_name FROM contacts c LEFT JOIN companies comp ON c.company_id = comp.id WHERE c.id = ?').get(id);
  res.status(201).json(enrichContact(contact, db));
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { name, email, phone, job_title, company_id, status, source, notes } = req.body;
  db.prepare(`UPDATE contacts SET name=COALESCE(?,name), email=COALESCE(?,email), phone=COALESCE(?,phone), job_title=COALESCE(?,job_title), company_id=COALESCE(?,company_id), status=COALESCE(?,status), source=COALESCE(?,source), notes=COALESCE(?,notes), updated_at=CURRENT_TIMESTAMP WHERE id=?${scope.filter}`)
    .run(name, email, phone, job_title, company_id, status, source, notes, req.params.id, ...scope.params);
  const contact = db.prepare('SELECT c.*, comp.name as company_name FROM contacts c LEFT JOIN companies comp ON c.company_id = comp.id WHERE c.id = ?').get(req.params.id);
  res.json(enrichContact(contact, db));
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  db.prepare(`DELETE FROM contacts WHERE id = ?${scope.filter}`).run(req.params.id, ...scope.params);
  res.json({ success: true });
});

export default router;
