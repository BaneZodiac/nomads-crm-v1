import { useEffect } from 'react'
import { useData } from '../context/DataContext'
import { Building2, Users, TrendingUp, DollarSign, Flame, Clock, AlertCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { STAGE_LABELS, ACTIVITY_TYPES } from '../types'

const COLORS = ['#FB923C', '#F97316', '#FDBA74', '#FED7AA', '#22C55E', '#EF4444']

export default function Dashboard() {
  const { dashboard, fetchDashboard, loading } = useData()

  useEffect(() => { fetchDashboard() }, [])

  if (loading.dashboard || !dashboard) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 animate-pulse"><div className="h-16 bg-gray-100 rounded-lg" /></div>
        ))}
      </div>
    )
  }

  const pieData = dashboard.dealsByStage
    .filter(d => d.stage !== 'closed_lost')
    .map(d => ({ name: STAGE_LABELS[d.stage] || d.stage, value: d.count }))

  const barData = dashboard.dealsByStage.map(d => ({
    name: STAGE_LABELS[d.stage] || d.stage,
    value: d.value,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <Users size={24} className="text-brand-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Contacts</p>
            <p className="text-2xl font-bold text-gray-900">{dashboard.totalContacts}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Building2 size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Companies</p>
            <p className="text-2xl font-bold text-gray-900">{dashboard.totalCompanies}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={24} className="text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Active Deals</p>
            <p className="text-2xl font-bold text-gray-900">{dashboard.totalDeals}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <DollarSign size={24} className="text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Revenue (Closed Won)</p>
            <p className="text-2xl font-bold text-gray-900">${dashboard.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {dashboard.alerts && (dashboard.alerts.staleDeals.length > 0 || dashboard.alerts.hotLeads.length > 0 || dashboard.alerts.overdueActivities.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboard.alerts.overdueActivities.length > 0 && (
            <div className="card p-4 border-l-4 border-red-400">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={18} className="text-red-500" />
                <h3 className="text-sm font-semibold text-red-700">Overdue Tasks</h3>
              </div>
              {dashboard.alerts.overdueActivities.slice(0, 3).map((a: any) => (
                <p key={a.id} className="text-xs text-gray-600 truncate">{a.subject}</p>
              ))}
            </div>
          )}
          {dashboard.alerts.hotLeads.length > 0 && (
            <div className="card p-4 border-l-4 border-brand-400">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={18} className="text-brand-500" />
                <h3 className="text-sm font-semibold text-brand-700">Hot Leads</h3>
              </div>
              {dashboard.alerts.hotLeads.slice(0, 3).map((d: any) => (
                <p key={d.id} className="text-xs text-gray-600 truncate">{d.title} — ${d.value.toLocaleString()}</p>
              ))}
            </div>
          )}
          {dashboard.alerts.staleDeals.length > 0 && (
            <div className="card p-4 border-l-4 border-gray-400">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Stale Deals</h3>
              </div>
              {dashboard.alerts.staleDeals.slice(0, 3).map((d: any) => (
                <p key={d.id} className="text-xs text-gray-600 truncate">{d.title} — {d.contact_name || 'No contact'}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Value by Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#FB923C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deals by Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Activities</h3>
          <div className="space-y-3">
            {dashboard.upcomingActivities.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming activities</p>
            ) : (
              dashboard.upcomingActivities.map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className={`badge ${a.status === 'scheduled' ? 'badge-blue' : 'badge-orange'}`}>
                    {ACTIVITY_TYPES[a.type] || a.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.subject}</p>
                    {a.due_date && <p className="text-xs text-gray-400">{new Date(a.due_date).toLocaleDateString()}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Contacts</h3>
          <div className="space-y-3">
            {dashboard.topContacts.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white text-sm font-semibold">
                  {c.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.company_name || c.email || 'No company'}</p>
                </div>
                <span className={`badge ${c.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
