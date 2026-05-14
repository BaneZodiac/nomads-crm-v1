import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '../api'
import { ArrowLeft, Check, X, Users, Globe, Package } from 'lucide-react'
import { Tenant } from '../types'

const ALL_MODULES = [
  { key: 'contacts', label: 'Contacts' },
  { key: 'companies', label: 'Companies' },
  { key: 'deals', label: 'Deals' },
  { key: 'activities', label: 'Activities' },
  { key: 'notes', label: 'Notes' },
  { key: 'quotes', label: 'Quotes' },
]

export default function AdminTenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedModules, setSelectedModules] = useState<string[]>([])

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })

  useEffect(() => {
    loadTenant()
    loadUsers()
  }, [id])

  const loadTenant = async () => {
    const res = await fetch(apiUrl(`/api/tenants`), { headers: headers() })
    if (res.ok) {
      const all = await res.json()
      const t = all.find((x: any) => x.id === id)
      setTenant(t)
      try { setSelectedModules(JSON.parse(t.modules || '[]')) } catch { setSelectedModules([]) }
    }
    setLoading(false)
  }

  const loadUsers = async () => {
    const res = await fetch(apiUrl('/api/users'), { headers: headers() })
    if (res.ok) {
      const all = await res.json()
      setUsers(all.filter((u: any) => u.tenant_id === id))
    }
  }

  const toggleModule = (key: string) => {
    setSelectedModules(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    )
  }

  const saveModules = async () => {
    setSaving(true)
    await fetch(apiUrl(`/api/tenants/${id}`), {
      method: 'PUT', headers: headers(),
      body: JSON.stringify({ modules: selectedModules }),
    })
    setSaving(false)
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>
  if (!tenant) return <div className="text-center py-12 text-gray-400">Tenant not found</div>

  return (
    <div>
      <button onClick={() => navigate('/admin/tenants')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to Tenants
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
                {tenant.domain && <p className="text-gray-400 mt-1">{tenant.domain}</p>}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                tenant.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {tenant.status}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1.5"><Users size={16} /> {users.length} users</span>
              <span className="flex items-center gap-1.5"><Package size={16} /> {tenant.plan}</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Modules</h3>
              <button onClick={saveModules} disabled={saving} className="btn-primary text-sm">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">Enable or disable CRM modules for this tenant</p>
            <div className="space-y-3">
              {ALL_MODULES.map(m => (
                <label key={m.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => toggleModule(m.key)}>
                  <span className="text-sm font-medium text-gray-700">{m.label}</span>
                  <div className={`w-10 h-6 rounded-full transition-colors relative pointer-events-none ${
                    selectedModules.includes(m.key) ? 'bg-brand-500' : 'bg-gray-200'
                  }`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      selectedModules.includes(m.key) ? 'translate-x-[18px]' : 'translate-x-0'
                    }`} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
          {users.length === 0 ? (
            <p className="text-sm text-gray-400">No users assigned</p>
          ) : (
            <div className="space-y-3">
              {users.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white text-sm font-semibold">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  {u.is_tenant_admin ? (
                    <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">Admin</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">User</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
