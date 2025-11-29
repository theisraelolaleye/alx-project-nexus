import Cookies from 'js-cookie'
import type { User } from '@/types'

// Token storage keys
const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

export const setToken = (token: string): void => {
  console.log('🔐 Setting auth token in cookie')
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
}


export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return Cookies.get(TOKEN_KEY) || null
}

export const setRefreshToken = (refreshToken: string): void => {
  console.log('🔐 Setting refresh token in cookie')
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    expires: 30,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return Cookies.get(REFRESH_TOKEN_KEY) || null
}

export const removeToken = (): void => {
  console.log('🗑️ Removing all auth cookies')
  Cookies.remove(TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
  Cookies.remove(USER_KEY)
}

export const setUserData = (userData: User): void => {
  console.log('👤 Setting user data in cookie')
  const userString = JSON.stringify(userData)
  Cookies.set(USER_KEY, userString, {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
}

export const getUserData = (): User | null => {
  if (typeof window === 'undefined') return null

  const userString = Cookies.get(USER_KEY)

  if (userString) {
    try {
      return JSON.parse(userString) as User
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  }

  return null
}

export const isAuthenticated = (): boolean => {
  return !!getToken()
}

export const clearAllData = (): void => {
  removeToken()
}
