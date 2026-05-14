import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Building2, TrendingUp, CalendarCheck, FileText, LogOut, Compass, FileSignature } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/deals', icon: TrendingUp, label: 'Deals' },
  { to: '/activities', icon: CalendarCheck, label: 'Activities' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/quotes', icon: FileSignature, label: 'Quotes' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-40">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-200">
            <Compass size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Nomads Cipher</h1>
            <p className="text-xs text-gray-400">CRM Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-50 text-brand-600 border border-brand-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3 px-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
