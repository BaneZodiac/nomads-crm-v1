export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  tenant_id?: string | null
  is_tenant_admin?: number
  tenant_name?: string | null
  modules?: string[] | null
}

export interface Tenant {
  id: string
  name: string
  domain?: string
  plan: string
  status: string
  modules: string
  settings?: string
  user_count?: number
  created_at: string
}

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  job_title?: string
  company_id?: string
  company_name?: string
  status: string
  source?: string
  notes?: string
  avatar?: string
  created_by?: string
  created_at: string
  updated_at: string
  lead_score?: number
  lead_factors?: { label: string; points: number }[]
}

export interface Company {
  id: string
  name: string
  domain?: string
  industry?: string
  size?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  website?: string
  notes?: string
  logo?: string
  contact_count?: number
  created_at: string
}

export interface Deal {
  id: string
  title: string
  value: number
  currency: string
  stage: string
  probability: number
  contact_id?: string
  contact_name?: string
  company_id?: string
  company_name?: string
  owner_id?: string
  owner_name?: string
  notes?: string
  expected_close_date?: string
  created_at: string
}

export interface Activity {
  id: string
  type: string
  subject: string
  description?: string
  status: string
  priority: string
  due_date?: string
  contact_id?: string
  contact_name?: string
  company_id?: string
  company_name?: string
  deal_id?: string
  assigned_to?: string
  assigned_name?: string
  created_at: string
}

export interface Note {
  id: string
  content: string
  contact_id?: string
  company_id?: string
  deal_id?: string
  created_by?: string
  created_by_name?: string
  created_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  deal_id?: string
  deal_title?: string
  contact_id?: string
  contact_name?: string
  company_id?: string
  company_name?: string
  amount: number
  status: string
  issue_date?: string
  due_date?: string
  paid_date?: string
  notes?: string
  created_by_name?: string
  created_at: string
}

export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  expense_date?: string
  description?: string
  deal_id?: string
  deal_title?: string
  created_by_name?: string
  created_at: string
}

export const INVOICE_STATUSES: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
}

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'badge-gray',
  sent: 'badge-blue',
  paid: 'badge-green',
  overdue: 'badge-red',
  cancelled: 'badge-gray',
}

export const EXPENSE_CATEGORIES: Record<string, string> = {
  office: 'Office',
  travel: 'Travel',
  software: 'Software',
  marketing: 'Marketing',
  salary: 'Salary',
  utilities: 'Utilities',
  professional: 'Professional Services',
  other: 'Other',
}

export interface DashboardData {
  totalContacts: number
  totalCompanies: number
  totalDeals: number
  totalRevenue: number
  pipelineValue: number
  totalInvoiced: number
  totalExpenses: number
  dealsByStage: { stage: string; count: number; value: number }[]
  recentActivities: Activity[]
  upcomingActivities: Activity[]
  topContacts: Contact[]
  invoicesByStatus: { status: string; count: number; value: number }[]
  expensesByCategory: { category: string; total: number }[]
  alerts: {
    staleDeals: Deal[]
    hotLeads: Deal[]
    overdueActivities: Activity[]
  }
}

export const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
}

export interface Comment {
  id: string
  content: string
  contact_id?: string
  deal_id?: string
  created_by?: string
  created_by_name?: string
  created_at: string
}

export interface Quote {
  id: string
  title: string
  value: number
  status: string
  contact_id?: string
  contact_name?: string
  company_id?: string
  company_name?: string
  deal_id?: string
  items: string
  notes?: string
  created_by_name?: string
  created_at: string
}

export const STAGE_COLORS: Record<string, string> = {
  lead: 'badge-gray',
  qualified: 'badge-blue',
  proposal: 'badge-purple',
  negotiation: 'badge-orange',
  closed_won: 'badge-green',
  closed_lost: 'badge-red',
}

export const ACTIVITY_TYPES: Record<string, string> = {
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
  task: 'Task',
  demo: 'Demo',
  lunch: 'Lunch',
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message?: string
  link?: string
  is_read: number
  tenant_id?: string
  created_at: string
}

export const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  call: 'badge-blue',
  email: 'badge-purple',
  meeting: 'badge-orange',
  task: 'badge-gray',
  demo: 'badge-green',
  lunch: 'badge-red',
}
