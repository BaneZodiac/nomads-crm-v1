import { useEffect } from 'react'

export function useMenuClose(menuOpen: string | null, setMenuOpen: (v: string | null) => void) {
  useEffect(() => {
    if (!menuOpen) return
    const handle = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.action-menu-dropdown')) {
        setMenuOpen(null)
      }
    }
    document.addEventListener('click', handle)
    return () => document.removeEventListener('click', handle)
  }, [menuOpen, setMenuOpen])
}
