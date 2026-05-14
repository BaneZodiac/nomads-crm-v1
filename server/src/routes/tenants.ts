import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, isSuperAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', isSuperAdmin, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const tenants = db.prepare(`SELECT t.*,
    (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) as user_count
    FROM tenants t ORDER BY t.created_at DESC`).all();
  res.json(tenants);
});

router.post('/', isSuperAdmin, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = uuid();
  const { name, domain, plan, modules } = req.body;
  if (!name) return res.status(400).json({ error: 'Tenant name is required' });
  db.prepare('INSERT INTO tenants (id, name, domain, plan, modules) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, domain || null, plan || 'free', JSON.stringify(modules || ['contacts', 'companies', 'deals', 'activities', 'notes', 'quotes']));
  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(id);
  res.status(201).json(tenant);
});

router.put('/:id', isSuperAdmin, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { name, domain, plan, status, modules } = req.body;
  db.prepare(`UPDATE tenants SET name=COALESCE(?,name), domain=COALESCE(?,domain), plan=COALESCE(?,plan), status=COALESCE(?,status), modules=COALESCE(?,modules), updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(name, domain, plan, status, modules ? JSON.stringify(modules) : null, req.params.id);
  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.params.id);
  res.json(tenant);
});

router.delete('/:id', isSuperAdmin, (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM tenants WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
