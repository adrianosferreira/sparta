import { apiLogin, apiRegister } from '@/lib/api'
import {
  clearSessionToken,
  getSessionEmail,
  getSessionToken,
  setSessionToken,
} from '@/lib/sessionToken'
import { create } from 'zustand'

interface AuthStore {
  token: string | null
  email: string | null
  setSession: (token: string, email: string) => void
  clearSession: () => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: getSessionToken(),
  email: getSessionEmail(),

  setSession: (token, email) => {
    setSessionToken(token, email)
    set({ token, email })
  },

  clearSession: () => {
    clearSessionToken()
    set({ token: null, email: null })
  },

  login: async (email, password) => {
    const { token, user } = await apiLogin(email, password)
    setSessionToken(token, user.email)
    set({ token, email: user.email })
  },

  register: async (email, password) => {
    const { token, user } = await apiRegister(email, password)
    setSessionToken(token, user.email)
    set({ token, email: user.email })
  },
}))
