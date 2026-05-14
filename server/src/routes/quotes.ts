import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, AuthRequest, tenantScope } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { status, contact_id, company_id } = req.query;
  let sql = `SELECT q.*, c.name as contact_name, comp.name as company_name, u.name as created_by_name
    FROM quotes q LEFT JOIN contacts c ON q.contact_id = c.id
    LEFT JOIN companies comp ON q.company_id = comp.id
    LEFT JOIN users u ON q.created_by = u.id WHERE 1=1${scope.filter}`;
  const params: any[] = [...scope.params];
  if (status) { sql += ` AND q.status = ?`; params.push(status); }
  if (contact_id) { sql += ` AND q.contact_id = ?`; params.push(contact_id); }
  if (company_id) { sql += ` AND q.company_id = ?`; params.push(company_id); }
  sql += ` ORDER BY q.created_at DESC`;
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const quote = db.prepare(`SELECT q.*, c.name as contact_name, comp.name as company_name, u.name as created_by_name
    FROM quotes q LEFT JOIN contacts c ON q.contact_id = c.id
    LEFT JOIN companies comp ON q.company_id = comp.id
    LEFT JOIN users u ON q.created_by = u.id WHERE q.id = ?${scope.filter}`).get(req.params.id, ...scope.params);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  res.json(quote);
});

router.post('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = uuid();
  const { title, value, contact_id, company_id, deal_id, items, notes } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  db.prepare(`INSERT INTO quotes (id, title, value, contact_id, company_id, deal_id, items, notes, created_by, tenant_id) VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(id, title, value || 0, contact_id || null, company_id || null, deal_id || null, JSON.stringify(items || []), notes, req.user!.id, req.user!.tenant_id || null);
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
  res.status(201).json(quote);
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { title, value, status, items, notes } = req.body;
  db.prepare(`UPDATE quotes SET title=COALESCE(?,title), value=COALESCE(?,value), status=COALESCE(?,status), items=COALESCE(?,items), notes=COALESCE(?,notes), updated_at=CURRENT_TIMESTAMP WHERE id=?${scope.filter}`)
    .run(title, value, status, items ? JSON.stringify(items) : null, notes, req.params.id, ...scope.params);
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  res.json(quote);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  db.prepare(`DELETE FROM quotes WHERE id = ?${scope.filter}`).run(req.params.id, ...scope.params);
  res.json({ success: true });
});

export default router;
