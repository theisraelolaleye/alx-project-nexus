/**
 * Secure token storage utilities for JobFrica platform
 * Handles authentication tokens with secure storage methods
 */

import Cookies from 'js-cookie'
import type { User } from '@/types'

// Token storage keys
const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_data'

/**
 * Cookie configuration for production security
 */
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  expires: 7, // 7 days
}

/**
 * Set authentication token
 * Uses localStorage for development and secure cookies for production
 */
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS)
    }
  }
}

/**
 * Get authentication token
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      return localStorage.getItem(TOKEN_KEY)
    } else {
      return Cookies.get(TOKEN_KEY) || null
    }
  }
  return null
}

/**
 * Set refresh token
 */
export const setRefreshToken = (refreshToken: string): void => {
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    } else {
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
        ...COOKIE_OPTIONS,
        expires: 30, // 30 days for refresh token
      })
    }
  }
}

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    } else {
      return Cookies.get(REFRESH_TOKEN_KEY) || null
    }
  }
  return null
}

/**
 * Remove all authentication tokens
 */
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } else {
      Cookies.remove(TOKEN_KEY)
      Cookies.remove(REFRESH_TOKEN_KEY)
      Cookies.remove(USER_KEY)
    }
  }
}

/**
 * Store user data
 */
export const setUserData = (userData: User): void => {
  if (typeof window !== 'undefined') {
    const userString = JSON.stringify(userData)
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem(USER_KEY, userString)
    } else {
      Cookies.set(USER_KEY, userString, COOKIE_OPTIONS)
    }
  }
}

/**
 * Get user data
 */
export const getUserData = (): User | null => {
  if (typeof window !== 'undefined') {
    let userString: string | null = null

    if (process.env.NODE_ENV === 'development') {
      userString = localStorage.getItem(USER_KEY)
    } else {
      userString = Cookies.get(USER_KEY) || null
    }

    if (userString) {
      try {
        return JSON.parse(userString) as User
      } catch (error) {
        console.error('Error parsing user data:', error)
        return null
      }
    }
  }
  return null
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken()
}

/**
 * Clear all stored data (logout)
 */
export const clearAllData = (): void => {
  removeToken()
}
