import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, AuthRequest, tenantScope } from '../middleware/auth';
import { createNotification } from './notifications';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { status, type, contact_id, company_id } = req.query;
  let sql = `SELECT a.*, c.name as contact_name, comp.name as company_name, u.name as assigned_name
    FROM activities a LEFT JOIN contacts c ON a.contact_id = c.id
    LEFT JOIN companies comp ON a.company_id = comp.id
    LEFT JOIN users u ON a.assigned_to = u.id WHERE 1=1${scope.filter}`;
  const params: any[] = [...scope.params];
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
  const assignee = assigned_to || req.user!.id;
  db.prepare(`INSERT INTO activities (id, type, subject, description, status, priority, due_date, contact_id, company_id, deal_id, assigned_to, created_by, tenant_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, type, subject, description, status || 'pending', priority || 'medium', due_date, contact_id, company_id, deal_id, assignee, req.user!.id, req.user!.tenant_id || null);
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
  if (assignee !== req.user!.id) {
    createNotification(assignee, 'activity_assigned', `Activity assigned: ${subject}`, `Type: ${type}`, `/activities`, req.user!.tenant_id || undefined);
  }
  res.status(201).json(activity);
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { type, subject, description, status, priority, due_date } = req.body;
  db.prepare(`UPDATE activities SET type=COALESCE(?,type), subject=COALESCE(?,subject), description=COALESCE(?,description), status=COALESCE(?,status), priority=COALESCE(?,priority), due_date=COALESCE(?,due_date), updated_at=CURRENT_TIMESTAMP WHERE id=?${scope.filter}`)
    .run(type, subject, description, status, priority, due_date, req.params.id, ...scope.params);
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  res.json(activity);
});

router.patch('/:id/status', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  db.prepare(`UPDATE activities SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?${scope.filter}`).run(req.body.status, req.params.id, ...scope.params);
  res.json({ success: true });
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  db.prepare(`DELETE FROM activities WHERE id = ?${scope.filter}`).run(req.params.id, ...scope.params);
  res.json({ success: true });
});

export default router;
