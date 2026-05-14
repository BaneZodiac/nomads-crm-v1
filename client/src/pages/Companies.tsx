import { useEffect, useState } from 'react'
import { useData } from '../context/DataContext'
import { Plus, Search, MoreHorizontal, Edit2, Trash2, Globe, MapPin } from 'lucide-react'
import Modal from '../components/Modal'
import DeleteConfirm from '../components/DeleteConfirm'
import { Company } from '../types'

export default function Companies() {
  const { companies, fetchCompanies, createCompany, updateCompany, deleteCompany } = useData()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Company | null>(null)
  const [deleting, setDeleting] = useState<Company | null>(null)
  const [form, setForm] = useState({ name: '', domain: '', industry: '', size: '', city: '', country: '', website: '', notes: '' })
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => { fetchCompanies() }, [])

  const filtered = companies.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.domain?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', domain: '', industry: '', size: '', city: '', country: '', website: '', notes: '' })
    setShowForm(true)
  }

  const openEdit = (c: Company) => {
    setEditing(c)
    setForm({ name: c.name, domain: c.domain || '', industry: c.industry || '', size: c.size || '', city: c.city || '', country: c.country || '', website: c.website || '', notes: c.notes || '' })
    setShowForm(true)
    setMenuOpen(null)
  }

  const handleSave = async () => {
    if (editing) await updateCompany(editing.id, form)
    else await createCompany(form)
    setShowForm(false)
    fetchCompanies()
  }

  const handleDelete = async () => {
    if (deleting) { await deleteCompany(deleting.id); setDeleting(null); fetchCompanies() }
  }

  return (
    <div>
      <div className="page-header">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 w-72" />
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="card-hover p-5 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                <span className="text-lg font-bold text-brand-600">{c.name.charAt(0)}</span>
              </div>
              <button onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)} className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal size={16} className="text-gray-400" />
              </button>
            </div>
            {menuOpen === c.id && (
              <div className="absolute right-5 top-14 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                <button onClick={() => openEdit(c)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => { setDeleting(c); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{c.name}</h3>
            {c.domain && <p className="text-sm text-gray-400 mb-3">{c.domain}</p>}
            <div className="space-y-1.5">
              {c.industry && <p className="text-sm text-gray-500 flex items-center gap-2"><Globe size={14} className="text-gray-300" />{c.industry}</p>}
              {(c.city || c.country) && <p className="text-sm text-gray-500 flex items-center gap-2"><MapPin size={14} className="text-gray-300" />{c.city}{c.city && c.country ? ', ' : ''}{c.country}</p>}
              {c.contact_count !== undefined && <p className="text-xs text-brand-500 font-medium">{c.contact_count} contact{c.contact_count !== 1 ? 's' : ''}</p>}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400"><p>No companies found</p></div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Company' : 'New Company'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input type="text" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} className="input-field" placeholder="example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input type="text" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <select value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} className="input-field">
                <option value="">Select size</option>
                <option value="1-10">1-10</option>
                <option value="10-50">10-50</option>
                <option value="50-200">50-200</option>
                <option value="200-1000">200-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input type="text" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input type="text" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field" rows={3} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={!form.name} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <DeleteConfirm open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete Company" message={`Are you sure you want to delete ${deleting?.name}?`} />
    </div>
  )
}
