import { ReactNode } from 'react'

export default function ActionMenu({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className={`bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 ${className || 'absolute right-0 top-full mt-1'}`}>
        {children}
      </div>
    </>
  )
}
