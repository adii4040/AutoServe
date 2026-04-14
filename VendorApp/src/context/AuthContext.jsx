import { createContext, useContext } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useFetchCurrentVendor } from '../hooks/useFetchCurrentVendor'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const vendorQuery = useFetchCurrentVendor()

  const vendor = vendorQuery.data?.data?.vendor ?? null
  const actor = vendor ? 'VENDOR' : null
  const profile = vendor || null
  const initialized = vendorQuery.isSuccess || vendorQuery.isError

  const refreshAuth = async () => {
    await queryClient.invalidateQueries({ queryKey: ['currentVendor'] })
  }

  if (!initialized) {
    return (
      <div className="loading-screen">
        Loading...
      </div>
    )
  }

  const value = {
    vendor,
    actor,
    profile,
    isAuthenticated: Boolean(profile),
    isLoading: vendorQuery.isLoading,
    refreshAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
