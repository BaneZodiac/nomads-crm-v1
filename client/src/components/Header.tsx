import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, CheckCheck, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { useMenuClose } from '../hooks/useClickOutside'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/contacts': 'Contacts',
  '/companies': 'Companies',
  '/deals': 'Deals Pipeline',
  '/activities': 'Activities',
  '/notes': 'Notes',
  '/finance': 'Finance',
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [menuOpen, setMenuOpen] = useState(false)
  useMenuClose(menuOpen ? 'open' : null, () => setMenuOpen(false))
  const title = pageTitles[location.pathname] || 'Dashboard'

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {user?.tenant_name && user?.role !== 'super_admin' && (
            <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-xs font-medium rounded-full">
              {user.tenant_name}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white w-64 transition-all"
          />
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {menuOpen && (
            <div onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()} className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
                ) : notifications.map(n => (
                  <div key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-brand-50/50' : ''}`}
                    onClick={() => { markRead(n.id); if (n.link) navigate(n.link); setMenuOpen(false) }}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.is_read ? 'bg-transparent' : 'bg-brand-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{n.title}</p>
                      {n.message && <p className="text-xs text-gray-400 mt-0.5 truncate">{n.message}</p>}
                      <p className="text-xs text-gray-300 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                    {n.link && <ExternalLink size={14} className="text-gray-300 mt-1 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
