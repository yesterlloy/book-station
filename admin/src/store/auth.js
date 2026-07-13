import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { login, getCurrentUser } from '@/api/auth'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      permissions: [],

      login: async (credentials) => {
        const data = await login(credentials)
        set({ token: data.token, user: data.user })
        return data
      },

      logout: () => {
        set({ token: null, user: null, permissions: [] })
      },

      checkAuth: async () => {
        try {
          const user = await getCurrentUser()
          set({ user })
          return user
        } catch (error) {
          set({ token: null, user: null })
          throw error
        }
      },

      hasPermission: (permission) => {
        const { permissions, user } = get()
        if (user?.role === 'admin') return true
        return permissions.includes(permission)
      },
    }),
    {
      name: 'bookstation-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
