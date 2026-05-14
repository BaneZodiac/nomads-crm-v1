import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '../api'
import { Save, Globe, DollarSign, Clock, CalendarDays, Building2, Languages, Sun } from 'lucide-react'

const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Asia/Dubai', 'Asia/Kolkata',
  'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland',
]

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
]

export default function AdminSettings() {
  const { token } = useAuth()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })

  useEffect(() => {
    fetch(apiUrl('/api/settings'), { headers: headers() })
      .then(r => r.json())
      .then(setSettings)
      .finally(() => setLoading(false))
  }, [])

  const update = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    await fetch(apiUrl('/api/settings'), {
      method: 'PUT', headers: headers(),
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading settings...</div>

  return (
    <div className="max-w-3xl">
      <div className="page-header">
        <h2 className="page-title">Admin Settings</h2>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
          Settings saved successfully
        </div>
      )}

      <div className="space-y-6">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-brand-500" /> General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" value={settings.company_name || ''} onChange={e => update('company_name', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select value={settings.language || 'en'} onChange={e => update('language', e.target.value)} className="input-field">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-brand-500" /> Localization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select value={settings.timezone || 'UTC'} onChange={e => { update('timezone', e.target.value) }} className="input-field">
                {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select value={settings.currency || 'USD'} onChange={e => {
                const cur = currencies.find(c => c.code === e.target.value)
                update('currency', e.target.value)
                if (cur) update('currency_symbol', cur.symbol)
              }} className="input-field">
                {currencies.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name} ({c.symbol})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
              <select value={settings.date_format || 'MM/DD/YYYY'} onChange={e => update('date_format', e.target.value)} className="input-field">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD.MM.YYYY">DD.MM.YYYY</option>
              </select>
            </div>
          </div>
          <div className="mt-3 p-3 bg-brand-50 rounded-lg text-sm text-brand-700">
            Currency: <strong>{settings.currency || 'USD'}</strong> ({settings.currency_symbol || '$'}) · Timezone: <strong>{settings.timezone || 'UTC'}</strong>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-brand-500" /> Business Hours
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input type="time" value={settings.business_hours_start || '09:00'} onChange={e => update('business_hours_start', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input type="time" value={settings.business_hours_end || '17:00'} onChange={e => update('business_hours_end', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
