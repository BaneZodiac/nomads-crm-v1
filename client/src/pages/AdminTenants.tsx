import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '../api'
import { Plus, Building, Users, Globe, Package } from 'lucide-react'
import Modal from '../components/Modal'
import DeleteConfirm from '../components/DeleteConfirm'
import { Tenant } from '../types'

const MODULES = ['contacts', 'companies', 'deals', 'activities', 'notes', 'quotes', 'finance']

export default function AdminTenants() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleting, setDeleting] = useState<Tenant | null>(null)
  const [form, setForm] = useState({ name: '', domain: '', plan: 'free' })

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })

  useEffect(() => { loadTenants() }, [])

  const loadTenants = async () => {
    const res = await fetch(apiUrl('/api/tenants'), { headers: headers() })
    if (res.ok) setTenants(await res.json())
    setLoading(false)
  }

  const handleCreate = async () => {
    await fetch(apiUrl('/api/tenants'), {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ ...form, modules: MODULES }),
    })
    setShowCreate(false)
    setForm({ name: '', domain: '', plan: 'free' })
    loadTenants()
  }

  const handleDelete = async () => {
    if (deleting) {
      await fetch(apiUrl(`/api/tenants/${deleting.id}`), { method: 'DELETE', headers: headers() })
      setDeleting(null)
      loadTenants()
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <p className="text-sm text-gray-400">{tenants.length} tenant{tenants.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Tenant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map(t => (
          <div
            key={t.id}
            className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/admin/tenants/${t.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-200">
                <Building size={24} className="text-white" />
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                t.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {t.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.name}</h3>
            {t.domain && <p className="text-sm text-gray-400 mb-4">{t.domain}</p>}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users size={14} /> {t.user_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <Package size={14} /> {t.plan}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Tenant">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <input type="text" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} className="input-field" placeholder="company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} className="input-field">
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={!form.name} className="btn-primary">Create</button>
          </div>
        </div>
      </Modal>

      <DeleteConfirm open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete Tenant" message="This will permanently remove the tenant and all associated data." />
    </div>
  )
}
