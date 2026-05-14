import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '../api'
import { Plus, Trash2, Shield, UserCog, MoreHorizontal } from 'lucide-react'
import Modal from '../components/Modal'
import DeleteConfirm from '../components/DeleteConfirm'

interface AppUser {
  id: string
  email: string
  name: string
  role: string
  created_at: string
}

export default function AdminUsers() {
  const { token } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [deleting, setDeleting] = useState<AppUser | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    const res = await fetch(apiUrl('/api/users'), { headers: headers() })
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  const handleInvite = async () => {
    await fetch(apiUrl('/api/users/invite'), {
      method: 'POST', headers: headers(),
      body: JSON.stringify(form),
    })
    setShowInvite(false)
    setForm({ name: '', email: '', password: '', role: 'user' })
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

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <p className="text-sm text-gray-400">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowInvite(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Invite User
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="table-header">Name</th>
              <th className="table-header">Email</th>
              <th className="table-header">Role</th>
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
                  <span className={u.role === 'admin' ? 'badge-purple' : 'badge-blue'}>{u.role}</span>
                </td>
                <td className="table-cell text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="table-cell relative">
                  <button onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)} className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </button>
                  {menuOpen === u.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                      {u.role !== 'admin' && (
                        <button onClick={() => { changeRole(u.id, 'admin'); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Shield size={14} /> Make Admin
                        </button>
                      )}
                      {u.role === 'admin' && (
                        <button onClick={() => { changeRole(u.id, 'user'); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <UserCog size={14} /> Make User
                        </button>
                      )}
                      <button onClick={() => { setDeleting(u); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input-field">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
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
