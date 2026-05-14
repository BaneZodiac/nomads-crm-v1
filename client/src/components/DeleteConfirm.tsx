import Modal from './Modal'

interface DeleteConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}

export default function DeleteConfirm({ open, onClose, onConfirm, title, message }: DeleteConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} className="btn-danger">Delete</button>
      </div>
    </Modal>
  )
}
