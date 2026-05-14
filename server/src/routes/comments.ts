import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, AuthRequest, tenantScope } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { contact_id, deal_id } = req.query;
  let sql = `SELECT c.*, u.name as created_by_name FROM comments c LEFT JOIN users u ON c.created_by = u.id WHERE 1=1${scope.filter}`;
  const params: any[] = [...scope.params];
  if (contact_id) { sql += ` AND c.contact_id = ?`; params.push(contact_id); }
  if (deal_id) { sql += ` AND c.deal_id = ?`; params.push(deal_id); }
  sql += ` ORDER BY c.created_at ASC`;
  res.json(db.prepare(sql).all(...params));
});

router.post('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = uuid();
  const { content, contact_id, deal_id } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });
  db.prepare('INSERT INTO comments (id, content, contact_id, deal_id, created_by, tenant_id) VALUES (?,?,?,?,?,?)')
    .run(id, content, contact_id || null, deal_id || null, req.user!.id, req.user!.tenant_id || null);
  const comment = db.prepare('SELECT c.*, u.name as created_by_name FROM comments c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ?').get(id);
  res.status(201).json(comment);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  db.prepare(`DELETE FROM comments WHERE id = ?${scope.filter}`).run(req.params.id, ...scope.params);
  res.json({ success: true });
});

export default router;
