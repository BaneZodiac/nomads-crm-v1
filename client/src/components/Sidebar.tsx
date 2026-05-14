import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Building2, TrendingUp, CalendarCheck, FileText, LogOut, Compass, FileSignature, Settings, Shield, Building, UserCog, Receipt } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

const modules = [
  { key: 'contacts', icon: Users },
  { key: 'companies', icon: Building2 },
  { key: 'deals', icon: TrendingUp },
  { key: 'activities', icon: CalendarCheck },
  { key: 'notes', icon: FileText },
  { key: 'quotes', icon: FileSignature },
  { key: 'finance', icon: Receipt },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { t } = useI18n()
  const isSuper = user?.role === 'super_admin'
  const isTenantAdmin = user?.is_tenant_admin
  const enabledModules = user?.modules || modules.map(m => m.key)

  const mainItems = modules
    .filter(m => isSuper || enabledModules.includes(m.key))
    .map(m => ({ to: `/${m.key}`, icon: m.icon, label: t(`nav.${m.key}`) }))

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-40">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-200">
            <Compass size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{t('app.name')}</h1>
            <p className="text-xs text-gray-400">{t('app.platform')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-brand-50 text-brand-600 border border-brand-100'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`
          }
        >
          <LayoutDashboard size={20} />
          {t('nav.dashboard')}
        </NavLink>

        {mainItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
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

        <div className="pt-4 pb-2">
          <div className="border-t border-gray-100" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-1 px-3">{t('nav.administration')}</p>
        </div>

        {isSuper && (
          <NavLink
            to="/admin/tenants"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-50 text-brand-600 border border-brand-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`
            }
          >
            <Building size={20} />
            {t('nav.tenants')}
          </NavLink>
        )}

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-brand-50 text-brand-600 border border-brand-100'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`
          }
        >
          <UserCog size={20} />
          {t('nav.users')}
        </NavLink>

        {isSuper && (
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-50 text-brand-600 border border-brand-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`
            }
          >
            <Settings size={20} />
            {t('nav.settings')}
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3 px-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            {user?.tenant_name && (
              <p className="text-xs text-brand-500 truncate">{user.tenant_name}</p>
            )}
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut size={20} />
          {t('nav.sign_out')}
        </button>
      </div>
    </aside>
  )
}
