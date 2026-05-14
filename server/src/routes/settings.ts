import { Router, Response } from 'express';
import { getDb } from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as any[];
  const settings: Record<string, string> = {};
  rows.forEach((r: any) => { settings[r.key] = r.value });
  res.json(settings);
});

router.put('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  if (req.user?.role !== 'super_admin') return res.status(403).json({ error: 'Super admin access required' });
  const allowed = ['timezone', 'currency', 'currency_symbol', 'date_format', 'company_name', 'language', 'business_hours_start', 'business_hours_end'];
  const upsert = db.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP');
  const tx = db.transaction(() => {
    for (const [key, value] of Object.entries(req.body)) {
      if (allowed.includes(key)) upsert.run(key, String(value));
    }
  });
  tx();
  const rows = db.prepare('SELECT key, value FROM settings').all() as any[];
  const settings: Record<string, string> = {};
  rows.forEach((r: any) => { settings[r.key] = r.value });
  res.json(settings);
});

export default router;
