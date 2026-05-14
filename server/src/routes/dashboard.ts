import { Router, Response } from 'express';
import { getDb } from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();

  const totalContacts = (db.prepare('SELECT COUNT(*) as count FROM contacts').get() as any).count;
  const totalCompanies = (db.prepare('SELECT COUNT(*) as count FROM companies').get() as any).count;
  const totalDeals = (db.prepare('SELECT COUNT(*) as count FROM deals').get() as any).count;
  const totalRevenue = (db.prepare("SELECT COALESCE(SUM(value), 0) as total FROM deals WHERE stage = 'closed_won'").get() as any).total;
  const pipelineValue = (db.prepare("SELECT COALESCE(SUM(value), 0) as total FROM deals WHERE stage NOT IN ('closed_won','closed_lost')").get() as any).total;

  const dealsByStage = db.prepare('SELECT stage, COUNT(*) as count, COALESCE(SUM(value), 0) as value FROM deals GROUP BY stage').all();
  const recentActivities = db.prepare(`SELECT a.*, u.name as assigned_name FROM activities a LEFT JOIN users u ON a.assigned_to = u.id ORDER BY a.created_at DESC LIMIT 5`).all();
  const upcomingActivities = db.prepare(`SELECT a.*, u.name as assigned_name FROM activities a LEFT JOIN users u ON a.assigned_to = u.id WHERE a.status IN ('pending','scheduled') AND a.due_date IS NOT NULL ORDER BY a.due_date ASC LIMIT 5`).all();
  const topContacts = db.prepare(`SELECT c.*, comp.name as company_name FROM contacts c LEFT JOIN companies comp ON c.company_id = comp.id ORDER BY c.created_at DESC LIMIT 5`).all();

  res.json({
    totalContacts,
    totalCompanies,
    totalDeals,
    totalRevenue,
    pipelineValue,
    dealsByStage,
    recentActivities,
    upcomingActivities,
    topContacts,
  });
});

export default router;
