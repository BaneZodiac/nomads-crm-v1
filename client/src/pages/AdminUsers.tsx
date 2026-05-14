import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ActionMenu from '../components/ActionMenu'
import { useMenuClose } from '../hooks/useClickOutside'
import { apiUrl } from '../api'
import { Plus, Trash2, Shield, UserCog, MoreHorizontal, Crown } from 'lucide-react'
import Modal from '../components/Modal'
import DeleteConfirm from '../components/DeleteConfirm'
import { Tenant } from '../types'

interface AppUser {
  id: string
  email: string
  name: string
  role: string
  tenant_id?: string | null
  tenant_name?: string | null
  is_tenant_admin?: number
  created_at: string
}

export default function AdminUsers() {
  const { user: currentUser, token } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [deleting, setDeleting] = useState<AppUser | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', tenant_id: '' })
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const isSuper = currentUser?.role === 'super_admin'
  const isTenantAdmin = currentUser?.is_tenant_admin

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })

  useEffect(() => { loadUsers(); if (isSuper) loadTenants() }, [])

  const loadTenants = async () => {
    const res = await fetch(apiUrl('/api/tenants'), { headers: headers() })
    if (res.ok) setTenants(await res.json())
  }

  const loadUsers = async () => {
    const res = await fetch(apiUrl('/api/users'), { headers: headers() })
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  const handleInvite = async () => {
    const body: any = { ...form }
    if (isTenantAdmin && currentUser?.tenant_id) {
      body.tenant_id = currentUser.tenant_id
    }
    await fetch(apiUrl('/api/users/invite'), {
      method: 'POST', headers: headers(),
      body: JSON.stringify(body),
    })
    setShowInvite(false)
    setForm({ name: '', email: '', password: '', role: 'user', tenant_id: '' })
    loadUsers()
  }

  const handleDelete = async () => {
    if (deleting) {
      await fetch(apiUrl(`/api/users/${deleting.id}`), { method: 'DELETE', headers: headers() })
      setDeleting(null)
      loadUsers()
    }
  }

  const changeRole = async (id: string, role: string) => {
    await fetch(apiUrl(`/api/users/${id}`), {
      method: 'PUT', headers: headers(),
      body: JSON.stringify({ role }),
    })
    loadUsers()
  }

  const toggleTenantAdmin = async (id: string, is_tenant_admin: number) => {
    await fetch(apiUrl(`/api/users/${id}`), {
      method: 'PUT', headers: headers(),
      body: JSON.stringify({ is_tenant_admin }),
    })
    loadUsers()
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <p className="text-sm text-gray-400">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowInvite(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Invite User
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="table-header">Name</th>
              <th className="table-header">Email</th>
              <th className="table-header">Role</th>
              {isSuper && <th className="table-header">Tenant</th>}
              <th className="table-header">Joined</th>
              <th className="table-header w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-brand-50/30 transition-colors">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white text-sm font-semibold">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{u.name}</span>
                  </div>
                </td>
                <td className="table-cell text-gray-500">{u.email}</td>
                <td className="table-cell">
                  {u.role === 'super_admin' ? (
                    <span className="badge-purple flex items-center gap-1 w-fit"><Crown size={12} /> Super Admin</span>
                  ) : u.is_tenant_admin ? (
                    <span className="badge-orange flex items-center gap-1 w-fit"><Shield size={12} /> Tenant Admin</span>
                  ) : (
                    <span className="badge-blue">{u.role}</span>
                  )}
                </td>
                {isSuper && (
                  <td className="table-cell text-gray-500">{u.tenant_name || '-'}</td>
                )}
                <td className="table-cell text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="table-cell relative">
                  {u.id !== currentUser?.id && u.role !== 'super_admin' && (
                    <>
                      <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === u.id ? null : u.id) }} className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal size={16} className="text-gray-400" />
                      </button>
                      <ActionMenu open={menuOpen === u.id} className="absolute right-0 top-full mt-1 w-44">
                        {isSuper && !u.is_tenant_admin && (
                          <button onClick={() => { toggleTenantAdmin(u.id, 1); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Shield size={14} /> Make Tenant Admin
                          </button>
                        )}
                        {isSuper && u.is_tenant_admin && (
                          <button onClick={() => { toggleTenantAdmin(u.id, 0); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <UserCog size={14} /> Remove Admin
                          </button>
                        )}
                        <button onClick={() => { setDeleting(u); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                          <Trash2 size={14} /> Remove
                        </button>
                      </ActionMenu>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite User">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-field" />
          </div>
          {isSuper && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
              <select value={form.tenant_id} onChange={e => setForm(f => ({ ...f, tenant_id: e.target.value }))} className="input-field">
                <option value="">Select tenant...</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowInvite(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleInvite} disabled={!form.name || !form.email || !form.password} className="btn-primary">Invite</button>
          </div>
        </div>
      </Modal>

      <DeleteConfirm open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Remove User" message="Are you sure?" />
    </div>
  )
}
