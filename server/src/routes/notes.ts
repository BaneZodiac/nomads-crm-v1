import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { contact_id, company_id, deal_id } = req.query;
  let sql = `SELECT n.*, u.name as created_by_name FROM notes n LEFT JOIN users u ON n.created_by = u.id WHERE 1=1`;
  const params: any[] = [];
  if (contact_id) { sql += ` AND n.contact_id = ?`; params.push(contact_id); }
  if (company_id) { sql += ` AND n.company_id = ?`; params.push(company_id); }
  if (deal_id) { sql += ` AND n.deal_id = ?`; params.push(deal_id); }
  sql += ` ORDER BY n.created_at DESC`;
  res.json(db.prepare(sql).all(...params));
});

router.post('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = uuid();
  const { content, contact_id, company_id, deal_id } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });
  db.prepare('INSERT INTO notes (id, content, contact_id, company_id, deal_id, created_by) VALUES (?,?,?,?,?,?)')
    .run(id, content, contact_id, company_id, deal_id, req.user!.id);
  const note = db.prepare('SELECT n.*, u.name as created_by_name FROM notes n LEFT JOIN users u ON n.created_by = u.id WHERE n.id = ?').get(id);
  res.status(201).json(note);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
