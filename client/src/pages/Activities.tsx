import { useEffect, useState } from 'react'
import { useData } from '../context/DataContext'
import { Plus, MoreHorizontal, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react'
import Modal from '../components/Modal'
import DeleteConfirm from '../components/DeleteConfirm'
import { Activity, ACTIVITY_TYPES, ACTIVITY_TYPE_COLORS } from '../types'
import { apiUrl } from '../api'

export default function Activities() {
  const { activities, contacts, companies, fetchActivities, fetchContacts, fetchCompanies, createActivity, updateActivityStatus, deleteActivity } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Activity | null>(null)
  const [deleting, setDeleting] = useState<Activity | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ type: 'task', subject: '', description: '', status: 'pending', priority: 'medium', due_date: '', contact_id: '', company_id: '' })

  useEffect(() => { fetchActivities(); fetchContacts(); fetchCompanies() }, [])

  const filtered = activities.filter(a => filter === 'all' || a.status === filter)

  const openCreate = () => {
    setEditing(null)
    setForm({ type: 'task', subject: '', description: '', status: 'pending', priority: 'medium', due_date: '', contact_id: '', company_id: '' })
    setShowForm(true)
  }

  const openEdit = (a: Activity) => {
    setEditing(a)
    setForm({ type: a.type, subject: a.subject, description: a.description || '', status: a.status, priority: a.priority, due_date: a.due_date?.split('T')[0] || '', contact_id: a.contact_id || '', company_id: a.company_id || '' })
    setShowForm(true)
    setMenuOpen(null)
  }

  const handleSave = async () => {
    if (editing) {
      await fetch(apiUrl(`/api/activities/${editing.id}`), {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form),
      })
    } else {
      await createActivity(form)
    }
    setShowForm(false)
    fetchActivities()
  }

  const handleDelete = async () => {
    if (deleting) { await deleteActivity(deleting.id); setDeleting(null); fetchActivities() }
  }

  const toggleStatus = async (a: Activity) => {
    const newStatus = a.status === 'completed' ? 'pending' : 'completed'
    await updateActivityStatus(a.id, newStatus)
    fetchActivities()
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-2">
          {['all', 'pending', 'scheduled', 'completed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-brand-500 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Activity
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Type</th>
                <th className="table-header">Subject</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Company</th>
                <th className="table-header">Priority</th>
                <th className="table-header">Due Date</th>
                <th className="table-header">Status</th>
                <th className="table-header w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-brand-50/30 transition-colors">
                  <td className="table-cell">
                    <span className={ACTIVITY_TYPE_COLORS[a.type]}>{ACTIVITY_TYPES[a.type] || a.type}</span>
                  </td>
                  <td className="table-cell font-medium text-gray-900">{a.subject}</td>
                  <td className="table-cell">{a.contact_name || '-'}</td>
                  <td className="table-cell">{a.company_name || '-'}</td>
                  <td className="table-cell">
                    <span className={`badge ${a.priority === 'high' ? 'badge-red' : a.priority === 'medium' ? 'badge-orange' : 'badge-gray'}`}>
                      {a.priority}
                    </span>
                  </td>
                  <td className="table-cell text-gray-500">
                    {a.due_date ? new Date(a.due_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="table-cell">
                    <span className={a.status === 'completed' ? 'badge-green' : a.status === 'scheduled' ? 'badge-blue' : 'badge-orange'}>
                      {a.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleStatus(a)} className="p-1 hover:bg-gray-100 rounded" title={a.status === 'completed' ? 'Reopen' : 'Complete'}>
                        {a.status === 'completed' ? <XCircle size={16} className="text-gray-400" /> : <CheckCircle size={16} className="text-green-400" />}
                      </button>
                      <div className="relative">
                        <button onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)} className="p-1 hover:bg-gray-100 rounded">
                          <MoreHorizontal size={16} className="text-gray-400" />
                        </button>
                        {menuOpen === a.id && (
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                            <button onClick={() => openEdit(a)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Edit2 size={14} /> Edit
                            </button>
                            <button onClick={() => { setDeleting(a); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><p>No activities found</p></div>}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Activity' : 'New Activity'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                {Object.entries(ACTIVITY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-field">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <select value={form.contact_id} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))} className="input-field">
                <option value="">No contact</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <select value={form.company_id} onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))} className="input-field">
                <option value="">No company</option>
                {companies.map(co => <option key={co.id} value={co.id}>{co.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="input-field" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={!form.subject} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <DeleteConfirm open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete Activity" message="Are you sure you want to delete this activity?" />
    </div>
  )
}
