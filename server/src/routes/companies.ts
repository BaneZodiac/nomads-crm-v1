import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import { authenticate, AuthRequest, tenantScope } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { search } = req.query;
  let sql = `SELECT c.*, (SELECT COUNT(*) FROM contacts WHERE company_id = c.id) as contact_count FROM companies c WHERE 1=1${scope.filter}`;
  const params: any[] = [...scope.params];
  if (search) { sql += ` AND (c.name LIKE ? OR c.domain LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
  sql += ` ORDER BY c.created_at DESC`;
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const company = db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM contacts WHERE company_id = c.id) as contact_count FROM companies c WHERE c.id = ?${scope.filter}`).get(req.params.id, ...scope.params);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  res.json(company);
});

router.post('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = uuid();
  const { name, domain, industry, size, phone, address, city, country, website, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  db.prepare(`INSERT INTO companies (id, name, domain, industry, size, phone, address, city, country, website, notes, created_by, tenant_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, name, domain, industry, size, phone, address, city, country, website, notes, req.user!.id, req.user!.tenant_id || null);
  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
  res.status(201).json(company);
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  const { name, domain, industry, size, phone, address, city, country, website, notes } = req.body;
  db.prepare(`UPDATE companies SET name=COALESCE(?,name), domain=COALESCE(?,domain), industry=COALESCE(?,industry), size=COALESCE(?,size), phone=COALESCE(?,phone), address=COALESCE(?,address), city=COALESCE(?,city), country=COALESCE(?,country), website=COALESCE(?,website), notes=COALESCE(?,notes), updated_at=CURRENT_TIMESTAMP WHERE id=?${scope.filter}`)
    .run(name, domain, industry, size, phone, address, city, country, website, notes, req.params.id, ...scope.params);
  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.params.id);
  res.json(company);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const scope = tenantScope(req);
  db.prepare(`DELETE FROM companies WHERE id = ?${scope.filter}`).run(req.params.id, ...scope.params);
  res.json({ success: true });
});

export default router;
