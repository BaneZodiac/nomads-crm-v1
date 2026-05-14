import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { apiUrl } from '../api'
import { Plus, Edit2, Trash2, MoreHorizontal, Receipt, TrendingDown, DollarSign, Wallet } from 'lucide-react'
import Modal from '../components/Modal'
import DeleteConfirm from '../components/DeleteConfirm'
import { Invoice, Expense, EXPENSE_CATEGORIES, INVOICE_STATUSES, INVOICE_STATUS_COLORS } from '../types'

type Tab = 'overview' | 'invoices' | 'expenses'

export default function Finance() {
  const { token } = useAuth()
  const { formatCurrency } = useSettings()
  const [tab, setTab] = useState<Tab>('overview')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleting, setDeleting] = useState<any>(null)
  const [deleteType, setDeleteType] = useState<'invoice' | 'expense'>('invoice')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [invoiceForm, setInvoiceForm] = useState({ amount: 0, issue_date: '', due_date: '', notes: '' })
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: 0, category: 'other', expense_date: '', description: '' })
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [stats, setStats] = useState({ totalInvoiced: 0, totalExpenses: 0, pendingInvoices: 0, paidInvoices: 0 })

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [invRes, expRes] = await Promise.all([
      fetch(apiUrl('/api/invoices'), { headers: headers() }),
      fetch(apiUrl('/api/expenses'), { headers: headers() }),
    ])
    if (invRes.ok) {
      const data = await invRes.json()
      setInvoices(data)
      setStats(s => ({
        ...s,
        totalInvoiced: data.reduce((sum: number, i: Invoice) => i.status !== 'cancelled' ? sum + i.amount : sum, 0),
        pendingInvoices: data.filter((i: Invoice) => i.status === 'draft' || i.status === 'sent' || i.status === 'overdue').length,
        paidInvoices: data.filter((i: Invoice) => i.status === 'paid').length,
      }))
    }
    if (expRes.ok) {
      const data = await expRes.json()
      setExpenses(data)
      setStats(s => ({ ...s, totalExpenses: data.reduce((sum: number, e: Expense) => sum + e.amount, 0) }))
    }
    setLoading(false)
  }

  const openInvoiceModal = (inv?: Invoice) => {
    if (inv) {
      setEditing(inv)
      setInvoiceForm({ amount: inv.amount, issue_date: inv.issue_date || '', due_date: inv.due_date || '', notes: inv.notes || '' })
    } else {
      setEditing(null)
      setInvoiceForm({ amount: 0, issue_date: new Date().toISOString().split('T')[0], due_date: '', notes: '' })
    }
    setShowInvoiceModal(true)
  }

  const openExpenseModal = (exp?: Expense) => {
    if (exp) {
      setEditing(exp)
      setExpenseForm({ title: exp.title, amount: exp.amount, category: exp.category, expense_date: exp.expense_date || '', description: exp.description || '' })
    } else {
      setEditing(null)
      setExpenseForm({ title: '', amount: 0, category: 'other', expense_date: new Date().toISOString().split('T')[0], description: '' })
    }
    setShowExpenseModal(true)
  }

  const saveInvoice = async () => {
    const url = editing ? apiUrl(`/api/invoices/${editing.id}`) : apiUrl('/api/invoices')
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: headers(), body: JSON.stringify(invoiceForm) })
    setShowInvoiceModal(false)
    loadData()
  }

  const saveExpense = async () => {
    const url = editing ? apiUrl(`/api/expenses/${editing.id}`) : apiUrl('/api/expenses')
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: headers(), body: JSON.stringify(expenseForm) })
    setShowExpenseModal(false)
    loadData()
  }

  const updateInvoiceStatus = async (id: string, status: string) => {
    const body: any = { status }
    if (status === 'paid') body.paid_date = new Date().toISOString().split('T')[0]
    await fetch(apiUrl(`/api/invoices/${id}/status`), { method: 'PATCH', headers: headers(), body: JSON.stringify(body) })
    loadData()
  }

  const confirmDelete = async () => {
    const endpoint = deleteType === 'invoice' ? `/api/invoices/${deleting.id}` : `/api/expenses/${deleting.id}`
    await fetch(apiUrl(endpoint), { method: 'DELETE', headers: headers() })
    setDeleting(null)
    loadData()
  }

  const filteredInvoices = statusFilter ? invoices.filter(i => i.status === statusFilter) : invoices
  const filteredExpenses = categoryFilter ? expenses.filter(e => e.category === categoryFilter) : expenses
  const netBalance = stats.totalInvoiced - stats.totalExpenses

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  return (
    <div>
      <div className="flex items-center gap-1 mb-6">
        {(['overview', 'invoices', 'expenses'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t ? 'bg-brand-50 text-brand-600 border border-brand-100' : 'text-gray-500 hover:bg-gray-50'
            }`}>
            {t === 'overview' ? 'Overview' : t === 'invoices' ? 'Invoices' : 'Expenses'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><DollarSign size={20} className="text-green-600" /></div>
                <p className="text-sm text-gray-400">Total Invoiced</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalInvoiced)}</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><TrendingDown size={20} className="text-red-600" /></div>
                <p className="text-sm text-gray-400">Total Expenses</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center"><Wallet size={20} className="text-brand-600" /></div>
                <p className="text-sm text-gray-400">Net Balance</p>
              </div>
              <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                {formatCurrency(netBalance)}
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Receipt size={20} className="text-blue-600" /></div>
                <p className="text-sm text-gray-400">Pending Invoices</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingInvoices}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoices by Status</h3>
              {invoices.length === 0 ? <p className="text-sm text-gray-400">No invoices yet</p> : (
                <div className="space-y-3">
                  {invoices.reduce((acc: any[], i) => {
                    const existing = acc.find(a => a.status === i.status)
                    if (existing) { existing.count++; existing.value += i.amount }
                    else acc.push({ status: i.status, count: 1, value: i.amount })
                    return acc
                  }, []).map((s: any) => (
                    <div key={s.status} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className={INVOICE_STATUS_COLORS[s.status] || 'badge-gray'}>{INVOICE_STATUSES[s.status] || s.status}</span>
                        <span className="text-sm text-gray-400">({s.count})</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(s.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
              {expenses.length === 0 ? <p className="text-sm text-gray-400">No expenses yet</p> : (
                <div className="space-y-3">
                  {expenses.reduce((acc: any[], e) => {
                    const existing = acc.find(a => a.category === e.category)
                    if (existing) existing.total += e.amount
                    else acc.push({ category: e.category, total: e.amount })
                    return acc
                  }, []).map((s: any) => (
                    <div key={s.category} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-700">{EXPENSE_CATEGORIES[s.category] || s.category}</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(s.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'invoices' && (
        <>
          <div className="page-header">
            <div className="flex items-center gap-2">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-sm py-1.5">
                <option value="">All Statuses</option>
                {Object.entries(INVOICE_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <button onClick={() => openInvoiceModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Invoice</button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-gray-50">
                <th className="table-header">Invoice #</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Issue Date</th>
                <th className="table-header">Due Date</th>
                <th className="table-header w-20">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-brand-50/30">
                    <td className="table-cell"><span className="font-medium text-gray-900">{inv.invoice_number}</span></td>
                    <td className="table-cell font-medium text-gray-900">{formatCurrency(inv.amount)}</td>
                    <td className="table-cell"><span className={INVOICE_STATUS_COLORS[inv.status]}>{INVOICE_STATUSES[inv.status] || inv.status}</span></td>
                    <td className="table-cell text-gray-500">{inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : '-'}</td>
                    <td className="table-cell text-gray-500">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</td>
                    <td className="table-cell relative">
                      <button onClick={() => setMenuOpen(menuOpen === inv.id ? null : inv.id)} className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal size={16} className="text-gray-400" />
                      </button>
                      {menuOpen === inv.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                          <button onClick={() => { openInvoiceModal(inv); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Edit2 size={14} /> Edit
                          </button>
                          {inv.status !== 'paid' && (
                            <button onClick={() => { updateInvoiceStatus(inv.id, 'paid'); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-600 hover:bg-green-50">
                              <DollarSign size={14} /> Mark Paid
                            </button>
                          )}
                          <button onClick={() => { setDeleting(inv); setDeleteType('invoice'); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'expenses' && (
        <>
          <div className="page-header">
            <div className="flex items-center gap-2">
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input-field text-sm py-1.5">
                <option value="">All Categories</option>
                {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <button onClick={() => openExpenseModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Expense</button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-gray-50">
                <th className="table-header">Title</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Category</th>
                <th className="table-header">Date</th>
                <th className="table-header">Description</th>
                <th className="table-header w-20">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-brand-50/30">
                    <td className="table-cell"><span className="font-medium text-gray-900">{exp.title}</span></td>
                    <td className="table-cell font-medium text-red-600">-{formatCurrency(exp.amount)}</td>
                    <td className="table-cell"><span className="badge-gray">{EXPENSE_CATEGORIES[exp.category] || exp.category}</span></td>
                    <td className="table-cell text-gray-500">{exp.expense_date ? new Date(exp.expense_date).toLocaleDateString() : '-'}</td>
                    <td className="table-cell text-gray-500 max-w-[200px] truncate">{exp.description || '-'}</td>
                    <td className="table-cell relative">
                      <button onClick={() => setMenuOpen(menuOpen === exp.id ? null : exp.id)} className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal size={16} className="text-gray-400" />
                      </button>
                      {menuOpen === exp.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                          <button onClick={() => { openExpenseModal(exp); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Edit2 size={14} /> Edit
                          </button>
                          <button onClick={() => { setDeleting(exp); setDeleteType('expense'); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title={editing ? 'Edit Invoice' : 'New Invoice'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input type="date" value={invoiceForm.issue_date} onChange={e => setInvoiceForm(f => ({ ...f, issue_date: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" value={invoiceForm.due_date} onChange={e => setInvoiceForm(f => ({ ...f, due_date: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={invoiceForm.notes} onChange={e => setInvoiceForm(f => ({ ...f, notes: e.target.value }))} className="input-field" rows={3} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowInvoiceModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={saveInvoice} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <Modal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} title={editing ? 'Edit Expense' : 'New Expense'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={expenseForm.title} onChange={e => setExpenseForm(f => ({ ...f, title: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))} className="input-field">
              {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={expenseForm.expense_date} onChange={e => setExpenseForm(f => ({ ...f, expense_date: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} className="input-field" rows={2} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowExpenseModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={saveExpense} disabled={!expenseForm.title} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <DeleteConfirm open={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete}
        title={`Delete ${deleteType === 'invoice' ? 'Invoice' : 'Expense'}`}
        message={`Are you sure you want to delete this ${deleteType}?`} />
    </div>
  )
}
