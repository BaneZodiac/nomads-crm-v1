import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useMenuClose } from '../hooks/useClickOutside'
import { Plus, Search, Mail, Phone, MoreHorizontal, Edit2, Trash2, ExternalLink } from 'lucide-react'
import Modal from '../components/Modal'
import DeleteConfirm from '../components/DeleteConfirm'
import { Contact } from '../types'

export default function Contacts() {
  const navigate = useNavigate()
  const { contacts, companies, fetchContacts, fetchCompanies, createContact, updateContact, deleteContact } = useData()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [deleting, setDeleting] = useState<Contact | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', job_title: '', company_id: '', status: 'active', notes: '' })
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  useMenuClose(menuOpen, setMenuOpen)

  useEffect(() => { fetchContacts(); fetchCompanies() }, [])

  const filtered = contacts.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', email: '', phone: '', job_title: '', company_id: '', status: 'active', notes: '' })
    setShowForm(true)
  }

  const openEdit = (c: Contact) => {
    setEditing(c)
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', job_title: c.job_title || '', company_id: c.company_id || '', status: c.status, notes: c.notes || '' })
    setShowForm(true)
    setMenuOpen(null)
  }

  const handleSave = async () => {
    if (editing) {
      await updateContact(editing.id, form)
    } else {
      await createContact(form)
    }
    setShowForm(false)
    fetchContacts()
  }

  const handleDelete = async () => {
    if (deleting) {
      await deleteContact(deleting.id)
      setDeleting(null)
      fetchContacts()
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 w-72" />
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Contact
        </button>
      </div>

      <div className="card overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Company</th>
                <th className="table-header">Job Title</th>
                <th className="table-header">Status</th>
                <th className="table-header">Lead Score</th>
                <th className="table-header w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-brand-50/30 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white text-sm font-semibold">
                        {c.name.charAt(0)}
                      </div>
                      <button onClick={() => navigate(`/contacts/${c.id}`)} className="font-medium text-gray-900 hover:text-brand-600 flex items-center gap-1 transition-colors">
                        {c.name} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} className="text-gray-300" />
                      <span>{c.email || '-'}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} className="text-gray-300" />
                      <span>{c.phone || '-'}</span>
                    </div>
                  </td>
                  <td className="table-cell">{c.company_name || '-'}</td>
                  <td className="table-cell">{c.job_title || '-'}</td>
                  <td className="table-cell">
                    <span className={c.status === 'active' ? 'badge-green' : 'badge-gray'}>{c.status}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${(c.lead_score ?? 0) >= 70 ? 'bg-green-100 text-green-700' : (c.lead_score ?? 0) >= 40 ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.lead_score ?? 0}/100
                    </span>
                  </td>
                  <td className="table-cell relative">
                    <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === c.id ? null : c.id) }} className="p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal size={16} className="text-gray-400" />
                    </button>
                    {menuOpen === c.id && (
                      <div onClick={e => e.stopPropagation()} className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                        <button onClick={() => openEdit(c)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={() => { setDeleting(c); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
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
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No contacts found</p>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Contact' : 'New Contact'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input type="text" value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} className="input-field" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="lead">Lead</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field" rows={3} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={!form.name} className="btn-primary">
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <DeleteConfirm
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete ${deleting?.name}? This action cannot be undone.`}
      />
    </div>
  )
}
