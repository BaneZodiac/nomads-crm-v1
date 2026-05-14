import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import { getDb } from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function isAdmin(req: AuthRequest, res: Response, next: any) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

router.get('/', isAdmin, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const users = db.prepare('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

router.put('/:id', isAdmin, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { name, email, role } = req.body;
  db.prepare('UPDATE users SET name=COALESCE(?,name), email=COALESCE(?,email), role=COALESCE(?,role) WHERE id=?')
    .run(name, email, role, req.params.id);
  const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(req.params.id);
  res.json(user);
});

router.post('/invite', isAdmin, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password required' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const id = uuid();
  const hashed = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)').run(id, email, hashed, name, role || 'user');
  const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(id);
  res.status(201).json(user);
});

router.delete('/:id', isAdmin, (req: AuthRequest, res: Response) => {
  const db = getDb();
  if (req.params.id === req.user!.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
