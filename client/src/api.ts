const API_BASE = import.meta.env.VITE_API_URL || ''

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}

export async function fetchWithRetry(url: string, options?: RequestInit, retries = 2, delay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 70000)
    try {
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeout)
      return res
    } catch (err) {
      clearTimeout(timeout)
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
  throw new Error('Request failed')
}
