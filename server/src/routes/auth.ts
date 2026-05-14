import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  let tenant = null;
  let modules = null;
  if (user.tenant_id) {
    tenant = db.prepare('SELECT id, name, domain, plan, status FROM tenants WHERE id = ?').get(user.tenant_id) as any;
    modules = tenant ? tenant.modules : null;
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenant_id: user.tenant_id,
    is_tenant_admin: user.is_tenant_admin,
    tenant_name: tenant?.name || null,
    modules: modules || null,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      tenant_id: user.tenant_id,
      is_tenant_admin: user.is_tenant_admin,
      tenant_name: tenant?.name || null,
      modules: modules ? JSON.parse(modules) : null,
    },
  });
});

router.post('/register', (req: AuthRequest, res: Response) => {
  const { email, password, name, tenant_id } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const id = uuid();
  const hashed = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, email, password, name, tenant_id) VALUES (?, ?, ?, ?, ?)').run(id, email, hashed, name, tenant_id);
  const token = generateToken({ id, email, name, role: 'user', tenant_id, is_tenant_admin: 0 });
  res.status(201).json({ token, user: { id, email, name, role: 'user', tenant_id, is_tenant_admin: 0 } });
});

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, name, role, avatar, tenant_id, is_tenant_admin, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });

  let tenant = null;
  let modules = null;
  if (user.tenant_id) {
    tenant = db.prepare('SELECT id, name, domain, plan, status, modules FROM tenants WHERE id = ?').get(user.tenant_id) as any;
    modules = tenant ? tenant.modules : null;
  }

  res.json({
    ...user,
    tenant_name: tenant?.name || null,
    modules: modules ? JSON.parse(modules) : null,
  });
});

export default router;
