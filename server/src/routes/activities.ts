import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { status, type, contact_id, company_id } = req.query;
  let sql = `SELECT a.*, c.name as contact_name, comp.name as company_name, u.name as assigned_name
    FROM activities a LEFT JOIN contacts c ON a.contact_id = c.id
    LEFT JOIN companies comp ON a.company_id = comp.id
    LEFT JOIN users u ON a.assigned_to = u.id WHERE 1=1`;
  const params: any[] = [];
  if (status) { sql += ` AND a.status = ?`; params.push(status); }
  if (type) { sql += ` AND a.type = ?`; params.push(type); }
  if (contact_id) { sql += ` AND a.contact_id = ?`; params.push(contact_id); }
  if (company_id) { sql += ` AND a.company_id = ?`; params.push(company_id); }
  sql += ` ORDER BY a.created_at DESC`;
  res.json(db.prepare(sql).all(...params));
});

router.post('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = uuid();
  const { type, subject, description, status, priority, due_date, contact_id, company_id, deal_id, assigned_to } = req.body;
  if (!type || !subject) return res.status(400).json({ error: 'Type and subject are required' });
  db.prepare(`INSERT INTO activities (id, type, subject, description, status, priority, due_date, contact_id, company_id, deal_id, assigned_to, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, type, subject, description, status || 'pending', priority || 'medium', due_date, contact_id, company_id, deal_id, assigned_to || req.user!.id, req.user!.id);
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
  res.status(201).json(activity);
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { type, subject, description, status, priority, due_date } = req.body;
  db.prepare(`UPDATE activities SET type=COALESCE(?,type), subject=COALESCE(?,subject), description=COALESCE(?,description), status=COALESCE(?,status), priority=COALESCE(?,priority), due_date=COALESCE(?,due_date), updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(type, subject, description, status, priority, due_date, req.params.id);
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  res.json(activity);
});

router.patch('/:id/status', (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('UPDATE activities SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.body.status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
