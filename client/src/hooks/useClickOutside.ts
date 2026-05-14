import { useEffect } from 'react'

export function useMenuClose(menuOpen: string | null, setMenuOpen: (v: string | null) => void) {
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(null)
    document.addEventListener('click', close)
    return () => {
      document.removeEventListener('click', close)
    }
  }, [menuOpen, setMenuOpen])
}
