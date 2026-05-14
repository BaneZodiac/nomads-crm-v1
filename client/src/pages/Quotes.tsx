import { useEffect, useState } from 'react'
import { useData } from '../context/DataContext'
import { useSettings } from '../context/SettingsContext'
import { Plus, Search, DollarSign, MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react'
import Modal from '../components/Modal'
import DeleteConfirm from '../components/DeleteConfirm'
import { apiUrl } from '../api'
import { useAuth } from '../context/AuthContext'
import { Quote } from '../types'

export default function Quotes() {
  const { contacts, companies, fetchContacts, fetchCompanies } = useData()
  const { token } = useAuth()
  const { formatCurrency } = useSettings()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Quote | null>(null)
  const [deleting, setDeleting] = useState<Quote | null>(null)
  const [form, setForm] = useState({ title: '', value: 0, contact_id: '', company_id: '', notes: '' })
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })
  const api = (url: string, opts?: any) => fetch(apiUrl(url), { headers: headers(), ...opts }).then(r => r.json())

  useEffect(() => { fetchContacts(); fetchCompanies(); loadQuotes() }, [])

  const loadQuotes = async () => setQuotes(await api('/api/quotes'))

  const filtered = quotes.filter(q => !search || q.title.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => { setEditing(null); setForm({ title: '', value: 0, contact_id: '', company_id: '', notes: '' }); setShowForm(true) }
  const openEdit = (q: Quote) => { setEditing(q); setForm({ title: q.title, value: q.value, contact_id: q.contact_id || '', company_id: q.company_id || '', notes: q.notes || '' }); setShowForm(true); setMenuOpen(null) }

  const handleSave = async () => {
    if (editing) await api(`/api/quotes/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) })
    else await api('/api/quotes', { method: 'POST', body: JSON.stringify(form) })
    setShowForm(false); loadQuotes()
  }

  const handleDelete = async () => {
    if (deleting) { await api(`/api/quotes/${deleting.id}`, { method: 'DELETE' }); setDeleting(null); loadQuotes() }
  }

  return (
    <div>
      <div className="page-header">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search quotes..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 w-72" />
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Quote</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="table-header">Title</th>
              <th className="table-header">Contact</th>
              <th className="table-header">Company</th>
              <th className="table-header">Value</th>
              <th className="table-header">Status</th>
              <th className="table-header w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(q => (
              <tr key={q.id} className="hover:bg-brand-50/30 transition-colors">
                <td className="table-cell font-medium text-gray-900">{q.title}</td>
                <td className="table-cell">{q.contact_name || '-'}</td>
                <td className="table-cell">{q.company_name || '-'}</td>
                <td className="table-cell">{formatCurrency(q.value)}</td>
                <td className="table-cell">
                  <span className={q.status === 'approved' ? 'badge-green' : q.status === 'sent' ? 'badge-blue' : 'badge-gray'}>{q.status}</span>
                </td>
                <td className="table-cell relative">
                  <button onClick={() => setMenuOpen(menuOpen === q.id ? null : q.id)} className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </button>
                  {menuOpen === q.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                      <button onClick={() => openEdit(q)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Edit2 size={14} /> Edit</button>
                      <button onClick={() => { setDeleting(q); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 size={14} /> Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><p>No quotes yet</p></div>}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Quote' : 'New Quote'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <select value={form.contact_id} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))} className="input-field">
                <option value="">None</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select value={form.company_id} onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))} className="input-field">
              <option value="">None</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field" rows={3} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={!form.title} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <DeleteConfirm open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete Quote" message="Are you sure?" />
    </div>
  )
}
