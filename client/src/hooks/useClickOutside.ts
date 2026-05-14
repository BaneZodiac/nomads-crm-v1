import { useEffect } from 'react'

export function useMenuClose(menuOpen: string | null, setMenuOpen: (v: string | null) => void) {
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(null)
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [menuOpen, setMenuOpen])
}
