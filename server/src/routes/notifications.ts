import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, AuthRequest, tenantScope } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const notifications = db.prepare(
    `SELECT * FROM notifications WHERE user_id = ?${scope.filter} ORDER BY is_read ASC, created_at DESC LIMIT 50`
  ).all(req.user!.id, ...scope.params);
  res.json(notifications);
});

router.get('/unread-count', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const result = db.prepare(
    `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0${scope.filter}`
  ).get(req.user!.id, ...scope.params) as any;
  res.json({ count: result.count });
});

router.patch('/:id/read', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  db.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?${scope.filter}`)
    .run(req.params.id, req.user!.id, ...scope.params);
  res.json({ success: true });
});

router.patch('/read-all', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0${scope.filter}`)
    .run(req.user!.id, ...scope.params);
  res.json({ success: true });
});

export function createNotification(userId: string, type: string, title: string, message?: string, link?: string, tenantId?: string) {
  const db = getDb();
  const id = uuid();
  db.prepare('INSERT INTO notifications (id, user_id, type, title, message, link, tenant_id) VALUES (?,?,?,?,?,?,?)')
    .run(id, userId, type, title, message || null, link || null, tenantId || null);
  return id;
}

export default router;
