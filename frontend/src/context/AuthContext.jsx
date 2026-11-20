import { createContext, useContext, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

const AuthContext = createContext(null)

/** Storefront customer session (httpOnly cookie managed by the API). */
export function AuthProvider({ children }) {
  const qc = useQueryClient()
  const me = useQuery({ queryKey: ['me'], queryFn: () => api.get('/account/me'), staleTime: 5 * 60_000 })

  const onAuthed = (data) => {
    qc.setQueryData(['me'], data)
    qc.invalidateQueries({ queryKey: ['account'] })
  }

  const login = useMutation({ mutationFn: (body) => api.post('/account/login', body), onSuccess: onAuthed })
  const register = useMutation({ mutationFn: (body) => api.post('/account/register', body), onSuccess: onAuthed })
  const logout = useMutation({
    mutationFn: () => api.post('/account/logout'),
    onSuccess: () => {
      qc.setQueryData(['me'], { user: null })
      qc.removeQueries({ queryKey: ['account'] })
    },
  })

  const value = useMemo(
    () => ({
      user: me.data?.user || null,
      isLoading: me.isLoading,
      login,
      register,
      logout,
      setUser: (user) => qc.setQueryData(['me'], { user }),
    }),
    [me.data, me.isLoading, login, register, logout, qc],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
