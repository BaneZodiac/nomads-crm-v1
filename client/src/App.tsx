import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { SettingsProvider } from './context/SettingsContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import Companies from './pages/Companies'
import Deals from './pages/Deals'
import Activities from './pages/Activities'
import Notes from './pages/Notes'
import ContactDetail from './pages/ContactDetail'
import Quotes from './pages/Quotes'
import Finance from './pages/Finance'
import AdminSettings from './pages/AdminSettings'
import AdminUsers from './pages/AdminUsers'
import AdminTenants from './pages/AdminTenants'
import AdminTenantDetail from './pages/AdminTenantDetail'
import { Compass } from 'lucide-react'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-200">
          <Compass size={30} className="text-white" />
        </div>
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Connecting to server...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <SettingsProvider>
          <DataProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/contacts/:id" element={<ContactDetail />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/tenants" element={<AdminTenants />} />
                <Route path="/admin/tenants/:id" element={<AdminTenantDetail />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </DataProvider>
          </SettingsProvider>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
