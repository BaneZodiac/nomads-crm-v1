import { ReactNode } from 'react'

export default function ActionMenu({ open, children, className }: { open: boolean; children: ReactNode; className?: string }) {
  if (!open) return null
  return (
    <div className={`action-menu-dropdown bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 ${className || 'absolute right-0 top-full mt-1'}`}>
      {children}
    </div>
  )
}
