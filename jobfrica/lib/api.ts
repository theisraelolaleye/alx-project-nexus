import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { getToken, removeToken, getRefreshToken } from './storage'

// API base URL - configure based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
})

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

export interface ApiError {
  message: string
  status?: number
  field?: string
  code?: string
}

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

export const isNetworkError = (error: AxiosError | Error): boolean => {
  if (axios.isAxiosError(error)) {
    return !error.response && error.code === 'NETWORK_ERROR'
  }
  return false
}

// External Jobs API for client-side usage
export const externalJobsApi = {
  async getJobs(params?: { query?: string; location?: string; page?: string }) {
    try {
      const query = new URLSearchParams({
        ...(params?.query ? { query: params.query } : {}),
        ...(params?.location ? { location: params.location } : {}),
        ...(params?.page ? { page: params.page } : {}),
      }).toString()
      const response = await axios.get(`/api/jobs${query ? `?${query}` : ''}`)
      const data = response.data
      // Support either an array response or an object with jobs array
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.jobs)) return data.jobs
      if (Array.isArray(data?.data)) return data.data
      return []
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      throw new Error('Failed to fetch jobs')
    }
  },

  async searchJobs(filters: {
    search?: string
    category?: string
    location?: string
    experienceLevel?: string
  }) {
    try {
      const response = await axios.post('/api/jobs', filters)
      return response.data.data || []
    } catch (error) {
      console.error('Failed to search jobs:', error)
      throw new Error('Failed to search jobs')
    }
  },

  async getJobDetails(id: string) {
    try {
      const response = await axios.get(`/api/job-details`, { params: { id } })
      const data = response.data
      if (data?.job) return data.job
      return data
    } catch (error) {
      console.error('Failed to fetch job details:', error)
      throw new Error('Failed to fetch job details')
    }
  }
}

export default api