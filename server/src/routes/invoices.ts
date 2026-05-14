import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, AuthRequest, tenantScope } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function nextInvoiceNumber(db: any): string {
  const last = db.prepare("SELECT invoice_number FROM invoices ORDER BY rowid DESC LIMIT 1").get() as any;
  const num = last ? parseInt(last.invoice_number.replace('INV-', '')) + 1 : 1;
  return `INV-${String(num).padStart(5, '0')}`;
}

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { status } = req.query;
  let sql = `SELECT i.*, c.name as contact_name, comp.name as company_name, d.title as deal_title, u.name as created_by_name
    FROM invoices i LEFT JOIN contacts c ON i.contact_id = c.id
    LEFT JOIN companies comp ON i.company_id = comp.id
    LEFT JOIN deals d ON i.deal_id = d.id
    LEFT JOIN users u ON i.created_by = u.id WHERE 1=1${scope.filter}`;
  const params: any[] = [...scope.params];
  if (status) { sql += ` AND i.status = ?`; params.push(status); }
  sql += ` ORDER BY i.created_at DESC`;
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const invoice = db.prepare(`SELECT i.*, c.name as contact_name, comp.name as company_name, d.title as deal_title, u.name as created_by_name
    FROM invoices i LEFT JOIN contacts c ON i.contact_id = c.id
    LEFT JOIN companies comp ON i.company_id = comp.id
    LEFT JOIN deals d ON i.deal_id = d.id
    LEFT JOIN users u ON i.created_by = u.id WHERE i.id = ?${scope.filter}`).get(req.params.id, ...scope.params);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
});

router.post('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = uuid();
  const { deal_id, contact_id, company_id, amount, issue_date, due_date, notes } = req.body;
  const invoice_number = nextInvoiceNumber(db);
  db.prepare(`INSERT INTO invoices (id, invoice_number, deal_id, contact_id, company_id, amount, issue_date, due_date, notes, created_by, tenant_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, invoice_number, deal_id || null, contact_id || null, company_id || null, amount || 0, issue_date || new Date().toISOString().split('T')[0], due_date || null, notes, req.user!.id, req.user!.tenant_id || null);
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  res.status(201).json(invoice);
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { amount, status, issue_date, due_date, paid_date, notes } = req.body;
  db.prepare(`UPDATE invoices SET amount=COALESCE(?,amount), status=COALESCE(?,status), issue_date=COALESCE(?,issue_date), due_date=COALESCE(?,due_date), paid_date=COALESCE(?,paid_date), notes=COALESCE(?,notes), updated_at=CURRENT_TIMESTAMP WHERE id=?${scope.filter}`)
    .run(amount, status, issue_date, due_date, paid_date, notes, req.params.id, ...scope.params);
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  res.json(invoice);
});

router.patch('/:id/status', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { status, paid_date } = req.body;
  db.prepare(`UPDATE invoices SET status = ?, paid_date = COALESCE(?,paid_date), updated_at = CURRENT_TIMESTAMP WHERE id = ?${scope.filter}`)
    .run(status, paid_date || null, req.params.id, ...scope.params);
  res.json({ success: true });
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  db.prepare(`DELETE FROM invoices WHERE id = ?${scope.filter}`).run(req.params.id, ...scope.params);
  res.json({ success: true });
});

export default router;
