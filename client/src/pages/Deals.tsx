import { useEffect, useState } from 'react'
import { useData } from '../context/DataContext'
import { Plus, MoreHorizontal, Edit2, Trash2, DollarSign } from 'lucide-react'
import Modal from '../components/Modal'
import DeleteConfirm from '../components/DeleteConfirm'
import { Deal, STAGE_LABELS, STAGE_COLORS } from '../types'

const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

export default function Deals() {
  const { deals: allDeals, contacts, companies, fetchDeals, fetchContacts, fetchCompanies, createDeal, updateDeal, updateDealStage, deleteDeal } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Deal | null>(null)
  const [deleting, setDeleting] = useState<Deal | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', value: 0, stage: 'lead', probability: 10, contact_id: '', company_id: '', notes: '', expected_close_date: '' })
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null)

  useEffect(() => { fetchDeals(); fetchContacts(); fetchCompanies() }, [])

  const grouped: Record<string, Deal[]> = {}
  STAGES.forEach(s => grouped[s] = [])
  allDeals.forEach(d => { if (grouped[d.stage]) grouped[d.stage].push(d) })

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', value: 0, stage: 'lead', probability: 10, contact_id: '', company_id: '', notes: '', expected_close_date: '' })
    setShowForm(true)
  }

  const openEdit = (d: Deal) => {
    setEditing(d)
    setForm({ title: d.title, value: d.value, stage: d.stage, probability: d.probability, contact_id: d.contact_id || '', company_id: d.company_id || '', notes: d.notes || '', expected_close_date: d.expected_close_date || '' })
    setShowForm(true)
    setMenuOpen(null)
  }

  const handleSave = async () => {
    if (editing) await updateDeal(editing.id, form)
    else await createDeal(form)
    setShowForm(false)
    fetchDeals()
  }

  const handleDelete = async () => {
    if (deleting) { await deleteDeal(deleting.id); setDeleting(null); fetchDeals() }
  }

  const handleDrop = async (dealId: string, newStage: string) => {
    await updateDealStage(dealId, newStage)
    fetchDeals()
  }

  return (
    <div>
      <div className="page-header">
        <h3 className="text-lg text-gray-500">
          Pipeline: <span className="font-semibold text-gray-900">${allDeals.reduce((s, d) => s + d.value, 0).toLocaleString()}</span>
        </h3>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Deal
        </button>
      </div>

      <div className="grid grid-cols-6 gap-4 min-h-[600px]">
        {STAGES.map(stage => (
          <div key={stage} className="bg-gray-50 rounded-xl p-3"
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              const id = e.dataTransfer.getData('dealId')
              if (id) handleDrop(id, stage)
            }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-semibold text-gray-700">{STAGE_LABELS[stage]}</h3>
              <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">{grouped[stage]?.length || 0}</span>
            </div>
            <div className="space-y-2">
              {grouped[stage]?.map(deal => (
                <div key={deal.id}
                  className="card p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative group"
                  draggable
                  onDragStart={e => e.dataTransfer.setData('dealId', deal.id)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{deal.title}</h4>
                    <button onClick={() => setMenuOpen(menuOpen === deal.id ? null : deal.id)} className="p-0.5 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={14} className="text-gray-400" />
                    </button>
                  </div>
                  {menuOpen === deal.id && (
                    <div className="absolute right-8 top-0 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                      <button onClick={() => openEdit(deal)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => { setDeleting(deal); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <DollarSign size={14} />
                    <span className="font-medium text-gray-700">{deal.value.toLocaleString()}</span>
                  </div>
                  {deal.company_name && <p className="text-xs text-gray-400 mt-1">{deal.company_name}</p>}
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-400 rounded-full transition-all" style={{ width: `${deal.probability}%` }} />
                  </div>
                  <span className={`${STAGE_COLORS[deal.stage]} mt-1 inline-block`}>{STAGE_LABELS[deal.stage]}</span>
                </div>
              ))}
              {(!grouped[stage] || grouped[stage].length === 0) && (
                <div className="text-center py-6 text-xs text-gray-300 border-2 border-dashed border-gray-200 rounded-lg">
                  Drop deals here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Deal' : 'New Deal'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="input-field">
                {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
              <input type="number" min={0} max={100} value={form.probability} onChange={e => setForm(f => ({ ...f, probability: Number(e.target.value) }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close</label>
              <input type="date" value={form.expected_close_date} onChange={e => setForm(f => ({ ...f, expected_close_date: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <select value={form.contact_id} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))} className="input-field">
                <option value="">No contact</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <select value={form.company_id} onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))} className="input-field">
                <option value="">No company</option>
                {companies.map(co => <option key={co.id} value={co.id}>{co.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field" rows={3} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={!form.title} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <DeleteConfirm open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete Deal" message={`Are you sure you want to delete ${deleting?.title}?`} />
    </div>
  )
}
