import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { Contact, Deal, Activity, Note } from '../types'
import { ArrowLeft, Mail, Phone, Building2, Briefcase, TrendingUp, CalendarCheck, FileText, MessageSquare } from 'lucide-react'
import Comments from '../components/Comments'

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { contacts, fetchContacts, fetchDeals, fetchActivities, fetchNotes, fetchCompanies, companies, deals, activities, notes } = useData()
  const [contact, setContact] = useState<Contact | null>(null)
  const [contactDeals, setContactDeals] = useState<Deal[]>([])
  const [contactActivities, setContactActivities] = useState<Activity[]>([])
  const [contactNotes, setContactNotes] = useState<Note[]>([])
  const [tab, setTab] = useState<'activity' | 'notes' | 'comments'>('activity')

  useEffect(() => {
    fetchContacts(); fetchDeals(); fetchActivities(); fetchNotes(); fetchCompanies()
  }, [])

  useEffect(() => {
    if (contacts.length > 0 && id) setContact(contacts.find(c => c.id === id) || null)
  }, [contacts, id])

  useEffect(() => {
    if (deals.length > 0 && id) setContactDeals(deals.filter(d => d.contact_id === id))
  }, [deals, id])

  useEffect(() => {
    if (activities.length > 0 && id) setContactActivities(activities.filter(a => a.contact_id === id))
  }, [activities, id])

  useEffect(() => {
    if (notes.length > 0 && id) setContactNotes(notes.filter(n => n.contact_id === id))
  }, [notes, id])

  if (!contact) return <div className="text-center py-12 text-gray-400">Loading...</div>

  const score = contact.lead_score ?? 0
  const scoreColor = score >= 70 ? 'text-green-600 bg-green-100' : score >= 40 ? 'text-brand-600 bg-brand-100' : 'text-gray-600 bg-gray-100'

  return (
    <div>
      <button onClick={() => navigate('/contacts')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Contacts
      </button>

      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white text-2xl font-bold">
            {contact.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${scoreColor}`}>
                Score: {score}/100
              </span>
              <span className={contact.status === 'active' ? 'badge-green' : 'badge-gray'}>{contact.status}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              {contact.email && <span className="flex items-center gap-1.5 text-sm text-gray-500"><Mail size={14} />{contact.email}</span>}
              {contact.phone && <span className="flex items-center gap-1.5 text-sm text-gray-500"><Phone size={14} />{contact.phone}</span>}
              {contact.company_name && <span className="flex items-center gap-1.5 text-sm text-gray-500"><Building2 size={14} />{contact.company_name}</span>}
              {contact.job_title && <span className="flex items-center gap-1.5 text-sm text-gray-500"><Briefcase size={14} />{contact.job_title}</span>}
            </div>
          </div>
        </div>
      </div>

      {contactDeals.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingUp size={16} /> Deals ({contactDeals.length})</h3>
          <div className="space-y-2">
            {contactDeals.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{d.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">${d.value.toLocaleString()}</span>
                  <span className={d.stage === 'closed_won' ? 'badge-green' : d.stage === 'closed_lost' ? 'badge-red' : 'badge-blue'}>
                    {d.stage.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="border-b border-gray-100">
          <div className="flex">
            {(['activity', 'notes', 'comments'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {t === 'activity' ? 'Activity' : t === 'notes' ? 'Notes' : 'Comments'}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {tab === 'activity' && (
            <div className="space-y-3">
              {contactActivities.length === 0 ? <p className="text-sm text-gray-400">No activities</p> : (
                contactActivities.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CalendarCheck size={16} className="text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{a.subject}</p>
                      <p className="text-xs text-gray-400">{a.type} · {a.status} · {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No date'}</p>
                    </div>
                    <span className={a.status === 'completed' ? 'badge-green' : 'badge-orange'}>{a.status}</span>
                  </div>
                ))
              )}
            </div>
          )}
          {tab === 'notes' && (
            <div className="space-y-3">
              {contactNotes.length === 0 ? <p className="text-sm text-gray-400">No notes</p> : (
                contactNotes.map(n => (
                  <div key={n.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.created_by_name} · {new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
          {tab === 'comments' && <Comments contactId={contact.id} />}
        </div>
      </div>
    </div>
  )
}
