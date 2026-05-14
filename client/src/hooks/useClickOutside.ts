import { useEffect, useRef } from 'react'

export function useMenuClose(menuOpen: string | null, setMenuOpen: (v: string | null) => void) {
  const timerRef = useRef<number | null>(null)
  useEffect(() => {
    if (timerRef.current !== null) { clearTimeout(timerRef.current); timerRef.current = null }
    if (!menuOpen) return
    const close = () => {
      timerRef.current = window.setTimeout(() => { setMenuOpen(null); timerRef.current = null }, 0)
    }
    document.addEventListener('mousedown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      if (timerRef.current !== null) { clearTimeout(timerRef.current); timerRef.current = null }
    }
  }, [menuOpen, setMenuOpen])
}
