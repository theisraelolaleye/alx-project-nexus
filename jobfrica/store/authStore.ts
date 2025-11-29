import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi } from '@/lib/auth'
import { setToken, removeToken, setRefreshToken, setUserData, getUserData, getToken } from '@/lib/storage'
import { getErrorMessage } from '@/lib/api'
import type {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  AuthError
} from '@/types'

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  getCurrentUser: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  checkAuthStatus: () => void
  refreshToken: () => Promise<boolean>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,

      // Login action
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authApi.login(credentials)

          // Store tokens (backend returns tokens.access and tokens.refresh)
          setToken(response.tokens.access)
          setRefreshToken(response.tokens.refresh)

          // Store user data
          setUserData(response.user)
          set({
            user: response.user,
            token: response.tokens.access,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          const errorMessage = getErrorMessage(error)
          const authError: AuthError = {
            message: errorMessage,
            code: error.response?.status?.toString()
          }

          set({
            error: authError,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          })

          throw error
        }
      },

      // Register action
      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authApi.register(data)

          // Store tokens (backend returns tokens.access and tokens.refresh)
          setToken(response.tokens.access)
          setRefreshToken(response.tokens.refresh)

          // Store user data
          setUserData(response.user)

          set({
            user: response.user,
            token: response.tokens.access,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          const errorMessage = getErrorMessage(error)
          const authError: AuthError = {
            message: errorMessage,
            code: error.response?.status?.toString()
          }

          set({
            error: authError,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          })

          throw error
        }
      },

      // Logout action
      logout: () => {
        // Call backend logout (don't wait for response)
        authApi.logout().catch(console.error)

        // Clear local storage
        removeToken()

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      // Get current user
      getCurrentUser: async () => {
        try {
          set({ isLoading: true, error: null })

          const user = await authApi.getCurrentUser()
          setUserData(user)

          set({
            user,
            isAuthenticated: true,
            isLoading: false
          })
        } catch {
          // If getCurrentUser fails, user might not be authenticated
          removeToken()

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      // Update profile
      updateProfile: async (data: Partial<User>) => {
        try {
          set({ isLoading: true, error: null })

          const updatedUser = await authApi.updateProfile(data)
          setUserData(updatedUser)

          set({
            user: updatedUser,
            isLoading: false
          })
        } catch (error: any) {
          const errorMessage = getErrorMessage(error)
          const authError: AuthError = {
            message: errorMessage
          }

          set({
            error: authError,
            isLoading: false
          })

          throw error
        }
      },

      // Forgot password
      forgotPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null })

          await authApi.forgotPassword({ email })

          set({
            isLoading: false
          })
        } catch (error: any) {
          const errorMessage = getErrorMessage(error)
          const authError: AuthError = {
            message: errorMessage
          }

          set({
            error: authError,
            isLoading: false
          })

          throw error
        }
      },

      // Reset password
      resetPassword: async (token: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          await authApi.resetPassword({ token, password, confirmPassword: password })

          set({
            isLoading: false
          })
        } catch (error: any) {
          const errorMessage = getErrorMessage(error)
          const authError: AuthError = {
            message: errorMessage
          }

          set({
            error: authError,
            isLoading: false
          })

          throw error
        }
      },

      // Refresh token
      refreshToken: async (): Promise<boolean> => {
        try {
          const currentToken = get().token || getToken()
          if (!currentToken) return false

          const response = await authApi.refreshToken(currentToken)

          // Backend returns tokens.access and tokens.refresh
          setToken(response.tokens.access)
          setRefreshToken(response.tokens.refresh)

          set({
            token: response.tokens.access,
            user: response.user
          })

          return true
        } catch {
          get().logout()
          return false
        }
      },

      // Check auth status on app start
      checkAuthStatus: () => {
        const savedUser = getUserData()
        const token = get().token

        if (savedUser && token) {
          set({
            user: savedUser,
            isAuthenticated: true,
            token
          })

          // Verify token is still valid
          get().getCurrentUser()
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage if we're on the client
        if (typeof window !== 'undefined') {
          return localStorage
        }
        // Return a no-op storage for server-side rendering
        return {
          getItem: () => null,
          setItem: () => { },
          removeItem: () => { }
        }
      }),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      // Skip hydration on initial load to avoid mismatches
      skipHydration: true
    }
  )
)

// Selectors for easier state access
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    clearError
  } = useAuthStore()

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    clearError
  }
}
