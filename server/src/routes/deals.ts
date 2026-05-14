import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { stage } = req.query;
  let sql = `SELECT d.*, c.name as contact_name, comp.name as company_name, u.name as owner_name
    FROM deals d LEFT JOIN contacts c ON d.contact_id = c.id
    LEFT JOIN companies comp ON d.company_id = comp.id
    LEFT JOIN users u ON d.owner_id = u.id WHERE 1=1`;
  const params: any[] = [];
  if (stage) { sql += ` AND d.stage = ?`; params.push(stage); }
  sql += ` ORDER BY d.created_at DESC`;
  res.json(db.prepare(sql).all(...params));
});

router.get('/stages', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const deals = db.prepare(`SELECT d.*, c.name as contact_name, comp.name as company_name, u.name as owner_name
    FROM deals d LEFT JOIN contacts c ON d.contact_id = c.id
    LEFT JOIN companies comp ON d.company_id = comp.id
    LEFT JOIN users u ON d.owner_id = u.id ORDER BY d.created_at DESC`).all();
  const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const grouped: any = {};
  stages.forEach(s => grouped[s] = []);
  deals.forEach((d: any) => { if (grouped[d.stage]) grouped[d.stage].push(d); });
  res.json(grouped);
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const deal = db.prepare(`SELECT d.*, c.name as contact_name, comp.name as company_name, u.name as owner_name
    FROM deals d LEFT JOIN contacts c ON d.contact_id = c.id
    LEFT JOIN companies comp ON d.company_id = comp.id
    LEFT JOIN users u ON d.owner_id = u.id WHERE d.id = ?`).get(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  res.json(deal);
});

router.post('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = uuid();
  const { title, value, stage, probability, contact_id, company_id, notes, expected_close_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  db.prepare(`INSERT INTO deals (id, title, value, stage, probability, contact_id, company_id, owner_id, notes, expected_close_date) VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(id, title, value || 0, stage || 'lead', probability || 10, contact_id, company_id, req.user!.id, notes, expected_close_date);
  const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(id);
  res.status(201).json(deal);
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { title, value, stage, probability, contact_id, company_id, notes, expected_close_date } = req.body;
  db.prepare(`UPDATE deals SET title=COALESCE(?,title), value=COALESCE(?,value), stage=COALESCE(?,stage), probability=COALESCE(?,probability), contact_id=COALESCE(?,contact_id), company_id=COALESCE(?,company_id), notes=COALESCE(?,notes), expected_close_date=COALESCE(?,expected_close_date), updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(title, value, stage, probability, contact_id, company_id, notes, expected_close_date, req.params.id);
  const deal = db.prepare(`SELECT d.*, c.name as contact_name, comp.name as company_name FROM deals d LEFT JOIN contacts c ON d.contact_id = c.id LEFT JOIN companies comp ON d.company_id = comp.id WHERE d.id = ?`).get(req.params.id);
  res.json(deal);
});

router.patch('/:id/stage', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { stage } = req.body;
  db.prepare('UPDATE deals SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(stage, req.params.id);
  const deal = db.prepare(`SELECT d.*, c.name as contact_name, comp.name as company_name FROM deals d LEFT JOIN contacts c ON d.contact_id = c.id LEFT JOIN companies comp ON d.company_id = comp.id WHERE d.id = ?`).get(req.params.id);
  res.json(deal);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM deals WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
