import { useEffect, useState } from 'react'
import { useData } from '../context/DataContext'
import { Plus, Trash2, Clock, User } from 'lucide-react'
import DeleteConfirm from '../components/DeleteConfirm'

export default function Notes() {
  const { notes, contacts, companies, deals, fetchNotes, fetchContacts, fetchCompanies, fetchDeals, createNote, deleteNote } = useData()
  const [showForm, setShowForm] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [linkType, setLinkType] = useState('none')
  const [linkId, setLinkId] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { fetchNotes(); fetchContacts(); fetchCompanies(); fetchDeals() }, [])

  const handleCreate = async () => {
    if (!newContent.trim()) return
    const payload: any = { content: newContent }
    if (linkType === 'contact' && linkId) payload.contact_id = linkId
    if (linkType === 'company' && linkId) payload.company_id = linkId
    if (linkType === 'deal' && linkId) payload.deal_id = linkId
    await createNote(payload)
    setNewContent('')
    setLinkType('none')
    setLinkId('')
    setShowForm(false)
    fetchNotes()
  }

  const handleDelete = async () => {
    if (deleting) { await deleteNote(deleting); setDeleting(null); fetchNotes() }
  }

  const getLinkedEntity = (note: any) => {
    if (note.contact_id) return `Contact: ${note.contact_name || note.contact_id}`
    if (note.company_id) return `Company: ${note.company_name || note.company_id}`
    if (note.deal_id) return `Deal: ${note.deal_name || note.deal_id}`
    return null
  }

  return (
    <div>
      <div className="page-header">
        <h3 className="text-lg text-gray-400">{notes.length} note{notes.length !== 1 ? 's' : ''}</h3>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Note
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <div key={note.id} className="card-hover p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <User size={14} />
                <span>{note.created_by_name || 'Unknown'}</span>
                <Clock size={14} className="ml-1" />
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
              <button onClick={() => setDeleting(note.id)} className="p-1 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
            {(note.contact_id || note.company_id || note.deal_id) && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-brand-500 font-medium">
                  {note.contact_id && `Linked to Contact`}
                  {note.company_id && `Linked to Company`}
                  {note.deal_id && `Linked to Deal`}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-300 mb-2">No notes yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Create your first note</button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Note</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea value={newContent} onChange={e => setNewContent(e.target.value)}
                  className="input-field" rows={5} placeholder="Write your note..." autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link to (optional)</label>
                <select value={linkType} onChange={e => { setLinkType(e.target.value); setLinkId('') }} className="input-field">
                  <option value="none">None</option>
                  <option value="contact">Contact</option>
                  <option value="company">Company</option>
                  <option value="deal">Deal</option>
                </select>
              </div>
              {linkType !== 'none' && (
                <select value={linkId} onChange={e => setLinkId(e.target.value)} className="input-field">
                  <option value="">Select {linkType}...</option>
                  {linkType === 'contact' && contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {linkType === 'company' && companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {linkType === 'deal' && deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleCreate} disabled={!newContent.trim()} className="btn-primary">Save Note</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirm open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete Note" message="Are you sure you want to delete this note?" />
    </div>
  )
}
