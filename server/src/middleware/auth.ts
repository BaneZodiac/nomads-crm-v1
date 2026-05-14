import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nomads-cipher-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenant_id?: string | null;
    is_tenant_admin?: number;
    tenant_name?: string;
    modules?: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function isSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
}

export function isTenantAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role === 'super_admin') return next();
  if (req.user?.is_tenant_admin) return next();
  return res.status(403).json({ error: 'Tenant admin access required' });
}

export function tenantScope(req: AuthRequest): { filter: string; params: any[] } {
  if (req.user?.role === 'super_admin' || !req.user?.tenant_id) {
    return { filter: '', params: [] };
  }
  return { filter: ' AND tenant_id = ?', params: [req.user.tenant_id] };
}

export function generateToken(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  tenant_id?: string | null;
  is_tenant_admin?: number;
  tenant_name?: string;
  modules?: string;
}): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}
