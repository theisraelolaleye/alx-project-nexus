
import api from './api'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
  User
} from '@/types'

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * User login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login/', {
      email: credentials.email,
      password: credentials.password,
      rememberMe: credentials.rememberMe || false
    })
    return response.data
  },

  /**
   * User registration
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/', {
      fname: data.fname,
      lname: data.lname,
      username: data.username,
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm,
      role: data.role
    })
    return response.data
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me/')
    return response.data
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh/', {
      refreshToken
    })
    return response.data
  },

  /**
   * User logout
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  /**
   * Forgot password - send reset email
   */
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password/', {
      email: data.email
    })
    return response.data
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password/', {
      token: data.token,
      password: data.password
    })
    return response.data
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile/', profileData)
    return response.data
  },

  /**
   * Change password
   */
  changePassword: async (data: {
    currentPassword: string
    newPassword: string
  }): Promise<{ message: string }> => {
    const response = await api.post('/auth/change-password/', data)
    return response.data
  },

  /**
   * Verify email address
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/verify-email/', { token })
    return response.data
  },

  /**
   * Resend email verification
   */
  resendVerification: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/resend-verification/')
    return response.data
  }
}

/**
 * Jobs API endpoints (for authenticated users)
 */
export const jobsApi = {
  /**
   * Get all jobs with optional filters
   */
  getJobs: async (filters?: {
    search?: string
    category?: string
    location?: string
    experienceLevel?: string
    page?: number
    limit?: number
  }) => {
    const response = await api.get('/jobs', { params: filters })
    return response.data
  },

  /**
   * Get single job by ID
   */
  getJob: async (id: string) => {
    const response = await api.get(`/jobs/${id}`)
    return response.data
  },

  /**
   * Apply to a job
   */
  applyToJob: async (jobId: string, applicationData: {
    coverLetter?: string
    resume?: File
    additionalInfo?: string
  }) => {
    const formData = new FormData()

    if (applicationData.coverLetter) {
      formData.append('coverLetter', applicationData.coverLetter)
    }

    if (applicationData.resume) {
      formData.append('resume', applicationData.resume)
    }

    if (applicationData.additionalInfo) {
      formData.append('additionalInfo', applicationData.additionalInfo)
    }

    const response = await api.post(`/jobs/${jobId}/apply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * Save/unsave a job
   */
  toggleSaveJob: async (jobId: string) => {
    const response = await api.post(`/jobs/${jobId}/toggle-save`)
    return response.data
  },

  /**
   * Get user's saved jobs
   */
  getSavedJobs: async () => {
    const response = await api.get('/user/saved-jobs')
    return response.data
  },

  /**
   * Get user's job applications
   */
  getApplications: async () => {
    const response = await api.get('/user/applications')
    return response.data
  },

  /**
   * Get application status
   */
  getApplicationStatus: async (applicationId: string) => {
    const response = await api.get(`/user/applications/${applicationId}`)
    return response.data
  },

  /**
   * Withdraw job application
   */
  withdrawApplication: async (applicationId: string) => {
    const response = await api.delete(`/user/applications/${applicationId}`)
    return response.data
  }
}

/**
 * Company/Employer API endpoints (for employer users)
 */
export const employerApi = {
  /**
   * Get company profile
   */
  getCompanyProfile: async () => {
    const response = await api.get('/employer/profile')
    return response.data
  },

  /**
   * Update company profile
   */
  updateCompanyProfile: async (profileData: any) => {
    const response = await api.put('/employer/profile', profileData)
    return response.data
  },

  /**
   * Post a new job
   */
  postJob: async (jobData: any) => {
    const response = await api.post('/employer/jobs', jobData)
    return response.data
  },

  /**
   * Get posted jobs
   */
  getPostedJobs: async () => {
    const response = await api.get('/employer/jobs')
    return response.data
  },

  /**
   * Update job posting
   */
  updateJob: async (jobId: string, jobData: any) => {
    const response = await api.put(`/employer/jobs/${jobId}`, jobData)
    return response.data
  },

  /**
   * Delete job posting
   */
  deleteJob: async (jobId: string) => {
    const response = await api.delete(`/employer/jobs/${jobId}`)
    return response.data
  },

  /**
   * Get job applications for a specific job
   */
  getJobApplications: async (jobId: string) => {
    const response = await api.get(`/employer/jobs/${jobId}/applications`)
    return response.data
  },

  /**
   * Update application status
   */
  updateApplicationStatus: async (applicationId: string, status: string) => {
    const response = await api.put(`/employer/applications/${applicationId}`, {
      status
    })
    return response.data
  }
}
