import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import { getDb } from '../database';
import { authenticate, isSuperAdmin, isTenantAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  if (req.user?.role === 'super_admin') {
    const users = db.prepare(`SELECT u.id, u.email, u.name, u.role, u.tenant_id, u.is_tenant_admin, u.created_at, t.name as tenant_name
      FROM users u LEFT JOIN tenants t ON u.tenant_id = t.id ORDER BY u.created_at DESC`).all();
    return res.json(users);
  }
  if (req.user?.is_tenant_admin && req.user?.tenant_id) {
    const users = db.prepare(`SELECT u.id, u.email, u.name, u.role, u.tenant_id, u.is_tenant_admin, u.created_at, t.name as tenant_name
      FROM users u LEFT JOIN tenants t ON u.tenant_id = t.id WHERE u.tenant_id = ? ORDER BY u.created_at DESC`).all(req.user.tenant_id);
    return res.json(users);
  }
  return res.status(403).json({ error: 'Access denied' });
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { name, email, role, is_tenant_admin } = req.body;

  if (req.user?.role === 'super_admin') {
    db.prepare('UPDATE users SET name=COALESCE(?,name), email=COALESCE(?,email), role=COALESCE(?,role), is_tenant_admin=COALESCE(?,is_tenant_admin) WHERE id=?')
      .run(name, email, role, is_tenant_admin ?? null, req.params.id);
  } else if (req.user?.is_tenant_admin && req.user?.tenant_id) {
    const target = db.prepare('SELECT tenant_id FROM users WHERE id = ?').get(req.params.id) as any;
    if (!target || target.tenant_id !== req.user.tenant_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    db.prepare('UPDATE users SET name=COALESCE(?,name), email=COALESCE(?,email) WHERE id=?')
      .run(name, email, req.params.id);
  } else {
    return res.status(403).json({ error: 'Access denied' });
  }
  const user = db.prepare('SELECT u.id, u.email, u.name, u.role, u.tenant_id, u.is_tenant_admin, u.created_at FROM users u WHERE u.id = ?').get(req.params.id);
  res.json(user);
});

router.post('/invite', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password required' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  let tenant_id = req.user?.tenant_id || null;
  if (req.user?.role === 'super_admin' && req.body.tenant_id) {
    tenant_id = req.body.tenant_id;
  }

  const id = uuid();
  const hashed = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, email, password, name, role, tenant_id) VALUES (?, ?, ?, ?, ?, ?)').run(id, email, hashed, name, role || 'user', tenant_id);
  const user = db.prepare('SELECT id, email, name, role, tenant_id, created_at FROM users WHERE id = ?').get(id);
  res.status(201).json(user);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  if (req.params.id === req.user!.id) return res.status(400).json({ error: 'Cannot delete yourself' });

  if (req.user?.role !== 'super_admin') {
    const target = db.prepare('SELECT tenant_id FROM users WHERE id = ?').get(req.params.id) as any;
    if (!target || target.tenant_id !== req.user?.tenant_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
