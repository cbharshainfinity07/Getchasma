/**
 * Tiny fetch wrapper for the GetChasma REST API.
 * - Same-origin requests (Vite proxies /api in dev; Express serves the SPA in production)
 * - Sends cookies for session auth
 * - Normalises errors into ApiError { status, message, fields, problems }
 */
export class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message)
    this.status = status
    this.fields = data.fields || {}
    this.problems = data.problems || []
    this.data = data
  }
}

const BASE = import.meta.env.VITE_API_URL || ''

async function request(path, { method = 'GET', body, query, signal, headers } = {}) {
  let url = `${BASE}/api${path}`
  if (query) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) continue
      qs.set(k, Array.isArray(v) ? v.join(',') : String(v))
    }
    const s = qs.toString()
    if (s) url += `?${s}`
  }
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  let res
  try {
    res = await fetch(url, {
      method,
      credentials: 'include',
      signal,
      headers: { ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const e = data.error || {}
    throw new ApiError(res.status, e.message || `Request failed (${res.status})`, e)
  }
  return data
}

export const api = {
  get: (path, query, opts) => request(path, { ...opts, query }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
  upload: (path, files) => {
    const fd = new FormData()
    for (const f of files) fd.append('images', f)
    return request(path, { method: 'POST', body: fd })
  },
}
