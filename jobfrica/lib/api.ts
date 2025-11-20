/**
 * Axios API configuration and interceptors for JobFrica platform
 * Handles authentication, request/response interceptors, and error handling
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { getToken, removeToken, getRefreshToken } from './storage'

// API base URL - configure based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

/**
 * Main API instance with authentication and error handling
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
})

/**
 * Request interceptor to add authentication token
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor to handle authentication errors and token refresh
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          })

          const { token } = response.data
          localStorage.setItem('auth_token', token)

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        }
      } catch {
        // Refresh failed, redirect to login
        removeToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      }
    }

    // Handle other error status codes
    if (error.response?.status === 403) {
      console.error('Forbidden: You don\'t have permission to access this resource')
    }

    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error: Please try again later')
    }

    return Promise.reject(error)
  }
)

/**
 * API error interface for consistent error handling
 */
export interface ApiError {
  message: string
  status?: number
  field?: string
  code?: string
}

/**
 * Helper function to extract error message from API response
 */
export const getErrorMessage = (error: AxiosError | Error): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message
    }
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

/**
 * Helper function to check if error is network related
 */
export const isNetworkError = (error: AxiosError | Error): boolean => {
  if (axios.isAxiosError(error)) {
    return !error.response && error.code === 'NETWORK_ERROR'
  }
  return false
}

export default api
