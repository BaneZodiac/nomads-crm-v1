import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { Contact, Company, Deal, Activity, Note, DashboardData } from '../types'
import { apiUrl } from '../api'

interface DataContextType {
  contacts: Contact[]
  companies: Company[]
  deals: Deal[]
  activities: Activity[]
  notes: Note[]
  dashboard: DashboardData | null
  loading: Record<string, boolean>
  fetchContacts: (params?: string) => Promise<void>
  fetchCompanies: (params?: string) => Promise<void>
  fetchDeals: (params?: string) => Promise<void>
  fetchActivities: (params?: string) => Promise<void>
  fetchNotes: (params?: string) => Promise<void>
  fetchDashboard: () => Promise<void>
  createContact: (data: Partial<Contact>) => Promise<Contact>
  updateContact: (id: string, data: Partial<Contact>) => Promise<Contact>
  deleteContact: (id: string) => Promise<void>
  createCompany: (data: Partial<Company>) => Promise<Company>
  updateCompany: (id: string, data: Partial<Company>) => Promise<Company>
  deleteCompany: (id: string) => Promise<void>
  createDeal: (data: Partial<Deal>) => Promise<Deal>
  updateDeal: (id: string, data: Partial<Deal>) => Promise<Deal>
  updateDealStage: (id: string, stage: string) => Promise<Deal>
  deleteDeal: (id: string) => Promise<void>
  createActivity: (data: Partial<Activity>) => Promise<Activity>
  updateActivityStatus: (id: string, status: string) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  createNote: (data: Partial<Note>) => Promise<Note>
  deleteNote: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextType>({} as DataContextType)

export function DataProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const headers = useCallback(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) h['Authorization'] = `Bearer ${token}`
    return h
  }, [token])

  const api = useCallback(async (url: string, options?: RequestInit) => {
    const res = await fetch(url, { headers: headers(), ...options })
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Request failed') }
    return res.json()
  }, [headers])

  const fetchContacts = useCallback(async (params?: string) => {
    setLoading(l => ({ ...l, contacts: true }))
    try { setContacts(await api(apiUrl(`/api/contacts${params ? `?${params}` : ''}`))) }
    finally { setLoading(l => ({ ...l, contacts: false })) }
  }, [api])

  const fetchCompanies = useCallback(async (params?: string) => {
    setLoading(l => ({ ...l, companies: true }))
    try { setCompanies(await api(apiUrl(`/api/companies${params ? `?${params}` : ''}`))) }
    finally { setLoading(l => ({ ...l, companies: false })) }
  }, [api])

  const fetchDeals = useCallback(async (params?: string) => {
    setLoading(l => ({ ...l, deals: true }))
    try { setDeals(await api(apiUrl(`/api/deals${params ? `?${params}` : ''}`))) }
    finally { setLoading(l => ({ ...l, deals: false })) }
  }, [api])

  const fetchActivities = useCallback(async (params?: string) => {
    setLoading(l => ({ ...l, activities: true }))
    try { setActivities(await api(apiUrl(`/api/activities${params ? `?${params}` : ''}`))) }
    finally { setLoading(l => ({ ...l, activities: false })) }
  }, [api])

  const fetchNotes = useCallback(async (params?: string) => {
    setLoading(l => ({ ...l, notes: true }))
    try { setNotes(await api(apiUrl(`/api/notes${params ? `?${params}` : ''}`))) }
    finally { setLoading(l => ({ ...l, notes: false })) }
  }, [api])

  const fetchDashboard = useCallback(async () => {
    setLoading(l => ({ ...l, dashboard: true }))
    try { setDashboard(await api(apiUrl('/api/dashboard'))) }
    finally { setLoading(l => ({ ...l, dashboard: false })) }
  }, [api])

  const createContact = useCallback(async (data: Partial<Contact>) =>
    api(apiUrl('/api/contacts'), { method: 'POST', body: JSON.stringify(data) }), [api])
  const updateContact = useCallback(async (id: string, data: Partial<Contact>) =>
    api(apiUrl(`/api/contacts/${id}`), { method: 'PUT', body: JSON.stringify(data) }), [api])
  const deleteContact = useCallback(async (id: string) =>
    api(apiUrl(`/api/contacts/${id}`), { method: 'DELETE' }), [api])

  const createCompany = useCallback(async (data: Partial<Company>) =>
    api(apiUrl('/api/companies'), { method: 'POST', body: JSON.stringify(data) }), [api])
  const updateCompany = useCallback(async (id: string, data: Partial<Company>) =>
    api(apiUrl(`/api/companies/${id}`), { method: 'PUT', body: JSON.stringify(data) }), [api])
  const deleteCompany = useCallback(async (id: string) =>
    api(apiUrl(`/api/companies/${id}`), { method: 'DELETE' }), [api])

  const createDeal = useCallback(async (data: Partial<Deal>) =>
    api(apiUrl('/api/deals'), { method: 'POST', body: JSON.stringify(data) }), [api])
  const updateDeal = useCallback(async (id: string, data: Partial<Deal>) =>
    api(apiUrl(`/api/deals/${id}`), { method: 'PUT', body: JSON.stringify(data) }), [api])
  const updateDealStage = useCallback(async (id: string, stage: string) =>
    api(apiUrl(`/api/deals/${id}/stage`), { method: 'PATCH', body: JSON.stringify({ stage }) }), [api])
  const deleteDeal = useCallback(async (id: string) =>
    api(apiUrl(`/api/deals/${id}`), { method: 'DELETE' }), [api])

  const createActivity = useCallback(async (data: Partial<Activity>) =>
    api(apiUrl('/api/activities'), { method: 'POST', body: JSON.stringify(data) }), [api])
  const updateActivityStatus = useCallback(async (id: string, status: string) =>
    api(apiUrl(`/api/activities/${id}/status`), { method: 'PATCH', body: JSON.stringify({ status }) }), [api])
  const deleteActivity = useCallback(async (id: string) =>
    api(apiUrl(`/api/activities/${id}`), { method: 'DELETE' }), [api])

  const createNote = useCallback(async (data: Partial<Note>) =>
    api(apiUrl('/api/notes'), { method: 'POST', body: JSON.stringify(data) }), [api])
  const deleteNote = useCallback(async (id: string) =>
    api(apiUrl(`/api/notes/${id}`), { method: 'DELETE' }), [api])

  return (
    <DataContext.Provider value={{
      contacts, companies, deals, activities, notes, dashboard, loading,
      fetchContacts, fetchCompanies, fetchDeals, fetchActivities, fetchNotes, fetchDashboard,
      createContact, updateContact, deleteContact,
      createCompany, updateCompany, deleteCompany,
      createDeal, updateDeal, updateDealStage, deleteDeal,
      createActivity, updateActivityStatus, deleteActivity,
      createNote, deleteNote,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
