import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiUrl } from '../api'
import { Comment } from '../types'
import { Send, Trash2, User } from 'lucide-react'

interface CommentsProps {
  contactId?: string
  dealId?: string
}

export default function Comments({ contactId, dealId }: CommentsProps) {
  const { token } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })

  useEffect(() => {
    if (!contactId && !dealId) return
    const params = contactId ? `contact_id=${contactId}` : `deal_id=${dealId}`
    fetch(apiUrl(`/api/comments?${params}`), { headers: headers() })
      .then(r => r.json())
      .then(setComments)
      .finally(() => setLoading(false))
  }, [contactId, dealId])

  const addComment = async () => {
    if (!content.trim()) return
    const res = await fetch(apiUrl('/api/comments'), {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ content: content.trim(), contact_id: contactId, deal_id: dealId }),
    })
    const comment = await res.json()
    setComments(c => [...c, comment])
    setContent('')
  }

  const deleteComment = async (id: string) => {
    await fetch(apiUrl(`/api/comments/${id}`), { method: 'DELETE', headers: headers() })
    setComments(c => c.filter(c => c.id !== id))
  }

  return (
    <div>
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {comments.length === 0 && !loading && (
          <p className="text-sm text-gray-400 text-center py-4">No comments yet</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 text-xs font-semibold flex-shrink-0">
              {c.created_by_name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-900">{c.created_by_name}</span>
                <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
            </div>
            <button onClick={() => deleteComment(c.id)} className="p-1 hover:bg-red-50 rounded self-start opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={12} className="text-red-400" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={content} onChange={e => setContent(e.target.value)}
          placeholder="Add a comment..." className="input-field flex-1"
          onKeyDown={e => e.key === 'Enter' && addComment()} />
        <button onClick={addComment} disabled={!content.trim()} className="btn-primary px-3">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
