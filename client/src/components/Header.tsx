import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/contacts': 'Contacts',
  '/companies': 'Companies',
  '/deals': 'Deals Pipeline',
  '/activities': 'Activities',
  '/notes': 'Notes',
}

export default function Header() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
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
        <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell size={20} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
        </button>
      </div>
    </header>
  )
}
