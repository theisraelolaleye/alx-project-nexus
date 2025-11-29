
import api from './api'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
  User
} from '@/types'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login/', {
      username: credentials.username,
      password: credentials.password,
      rememberMe: credentials.rememberMe || false
    })
    return response.data
  },

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

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me/')
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh/', {
      refreshToken
    })
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password/', {
      email: data.email
    })
    return response.data
  },

  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password/', {
      token: data.token,
      password: data.password
    })
    return response.data
  },

  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile/', profileData)
    return response.data
  },

  changePassword: async (data: {
    currentPassword: string
    newPassword: string
  }): Promise<{ message: string }> => {
    const response = await api.post('/auth/change-password/', data)
    return response.data
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/verify-email/', { token })
    return response.data
  },

  resendVerification: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/resend-verification/')
    return response.data
  }
}

export const jobsApi = {
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

  getJob: async (id: string) => {
    const response = await api.get(`/jobs/${id}`)
    return response.data
  },

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

  toggleSaveJob: async (jobId: string) => {
    const response = await api.post(`/jobs/${jobId}/toggle-save`)
    return response.data
  },

  getSavedJobs: async () => {
    const response = await api.get('/user/saved-jobs')
    return response.data
  },

  getApplications: async () => {
    const response = await api.get('/user/applications')
    return response.data
  },

  getApplicationStatus: async (applicationId: string) => {
    const response = await api.get(`/user/applications/${applicationId}`)
    return response.data
  },

  withdrawApplication: async (applicationId: string) => {
    const response = await api.delete(`/user/applications/${applicationId}`)
    return response.data
  }
}

export const employerApi = {
  getCompanyProfile: async () => {
    const response = await api.get('/employer/profile')
    return response.data
  },

  updateCompanyProfile: async (profileData: any) => {
    const response = await api.put('/employer/profile', profileData)
    return response.data
  },

  postJob: async (jobData: any) => {
    const response = await api.post('/employer/jobs', jobData)
    return response.data
  },

  getPostedJobs: async () => {
    const response = await api.get('/employer/jobs')
    return response.data
  },

  updateJob: async (jobId: string, jobData: any) => {
    const response = await api.put(`/employer/jobs/${jobId}`, jobData)
    return response.data
  },

  deleteJob: async (jobId: string) => {
    const response = await api.delete(`/employer/jobs/${jobId}`)
    return response.data
  },

  getJobApplications: async (jobId: string) => {
    const response = await api.get(`/employer/jobs/${jobId}/applications`)
    return response.data
  },

  updateApplicationStatus: async (applicationId: string, status: string) => {
    const response = await api.put(`/employer/applications/${applicationId}`, {
      status
    })
    return response.data
  }
}
