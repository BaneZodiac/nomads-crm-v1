import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { apiUrl } from '../api'
import { Notification } from '../types'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const headers = () => ({ Authorization: `Bearer ${token}` })

  const fetchNotifications = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(apiUrl('/api/notifications'), { headers: headers() })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
      const countRes = await fetch(apiUrl('/api/notifications/unread-count'), { headers: headers() })
      if (countRes.ok) {
        const { count } = await countRes.json()
        setUnreadCount(count)
      }
    } catch { /* ignore */ }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [token, fetchNotifications])

  const markRead = async (id: string) => {
    await fetch(apiUrl(`/api/notifications/${id}/read`), { method: 'PATCH', headers: headers() })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
    setUnreadCount(c => Math.max(0, c - 1))
  }

  const markAllRead = async () => {
    await fetch(apiUrl('/api/notifications/read-all'), { method: 'PATCH', headers: headers() })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
