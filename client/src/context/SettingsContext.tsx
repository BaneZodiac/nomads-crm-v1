import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { apiUrl } from '../api'

interface SettingsContextType {
  currencySymbol: string
  currency: string
  formatCurrency: (value: number) => string
  settings: Record<string, string>
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [settings, setSettings] = useState<Record<string, string>>({})

  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/settings'), { headers })
      if (res.ok) setSettings(await res.json())
    } catch { /* ignore */ }
  }, [token])

  useEffect(() => { if (token) refreshSettings() }, [token, refreshSettings])

  const currencySymbol = settings.currency_symbol || '$'
  const currency = settings.currency || 'USD'

  const formatCurrency = (value: number) => `${currencySymbol}${value.toLocaleString()}`

  return (
    <SettingsContext.Provider value={{ currencySymbol, currency, formatCurrency, settings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
