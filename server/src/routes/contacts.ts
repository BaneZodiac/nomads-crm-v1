import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { search, status, company_id } = req.query;
  let sql = `SELECT c.*, comp.name as company_name FROM contacts c LEFT JOIN companies comp ON c.company_id = comp.id WHERE 1=1`;
  const params: any[] = [];
  if (search) { sql += ` AND (c.name LIKE ? OR c.email LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
  if (status) { sql += ` AND c.status = ?`; params.push(status); }
  if (company_id) { sql += ` AND c.company_id = ?`; params.push(company_id); }
  sql += ` ORDER BY c.created_at DESC`;
  const contacts = db.prepare(sql).all(...params);
  res.json(contacts);
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const contact = db.prepare('SELECT c.*, comp.name as company_name FROM contacts c LEFT JOIN companies comp ON c.company_id = comp.id WHERE c.id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json(contact);
});

router.post('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = uuid();
  const { name, email, phone, job_title, company_id, status, source, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  db.prepare(`INSERT INTO contacts (id, name, email, phone, job_title, company_id, status, source, notes, created_by) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, name, email, phone, job_title, company_id, status || 'active', source, notes, req.user!.id);
  const contact = db.prepare('SELECT c.*, comp.name as company_name FROM contacts c LEFT JOIN companies comp ON c.company_id = comp.id WHERE c.id = ?').get(id);
  res.status(201).json(contact);
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { name, email, phone, job_title, company_id, status, source, notes } = req.body;
  db.prepare(`UPDATE contacts SET name=COALESCE(?,name), email=COALESCE(?,email), phone=COALESCE(?,phone), job_title=COALESCE(?,job_title), company_id=COALESCE(?,company_id), status=COALESCE(?,status), source=COALESCE(?,source), notes=COALESCE(?,notes), updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(name, email, phone, job_title, company_id, status, source, notes, req.params.id);
  const contact = db.prepare('SELECT c.*, comp.name as company_name FROM contacts c LEFT JOIN companies comp ON c.company_id = comp.id WHERE c.id = ?').get(req.params.id);
  res.json(contact);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
