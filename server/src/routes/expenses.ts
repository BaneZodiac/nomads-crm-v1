import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, AuthRequest, tenantScope } from '../middleware/auth';

const EXPENSE_CATEGORIES = ['office', 'travel', 'software', 'marketing', 'salary', 'utilities', 'professional', 'other'];

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { category } = req.query;
  let sql = `SELECT e.*, d.title as deal_title, u.name as created_by_name
    FROM expenses e LEFT JOIN deals d ON e.deal_id = d.id
    LEFT JOIN users u ON e.created_by = u.id WHERE 1=1${scope.filter}`;
  const params: any[] = [...scope.params];
  if (category) { sql += ` AND e.category = ?`; params.push(category); }
  sql += ` ORDER BY e.created_at DESC`;
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const expense = db.prepare(`SELECT e.*, d.title as deal_title, u.name as created_by_name
    FROM expenses e LEFT JOIN deals d ON e.deal_id = d.id
    LEFT JOIN users u ON e.created_by = u.id WHERE e.id = ?${scope.filter}`).get(req.params.id, ...scope.params);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  res.json(expense);
});

router.post('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = uuid();
  const { title, amount, category, expense_date, description, deal_id } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  db.prepare(`INSERT INTO expenses (id, title, amount, category, expense_date, description, deal_id, created_by, tenant_id) VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, title, amount || 0, category || 'other', expense_date || new Date().toISOString().split('T')[0], description, deal_id || null, req.user!.id, req.user!.tenant_id || null);
  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  res.status(201).json(expense);
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { title, amount, category, expense_date, description } = req.body;
  db.prepare(`UPDATE expenses SET title=COALESCE(?,title), amount=COALESCE(?,amount), category=COALESCE(?,category), expense_date=COALESCE(?,expense_date), description=COALESCE(?,description), updated_at=CURRENT_TIMESTAMP WHERE id=?${scope.filter}`)
    .run(title, amount, category, expense_date, description, req.params.id, ...scope.params);
  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  res.json(expense);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  db.prepare(`DELETE FROM expenses WHERE id = ?${scope.filter}`).run(req.params.id, ...scope.params);
  res.json({ success: true });
});

export default router;
