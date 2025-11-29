export interface Job {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  type: JobType
  experienceLevel: ExperienceLevel
  salary?: string //min sal & max salary
  description?: string
  requirements?: string[]
  responsibilities?: string[]
  benefits?: string[]
  logo?: string
  tags: string[]
  postedDate: string
  category?: JobCategory
  isRemote?: boolean
}

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship'

export type ExperienceLevel = 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead' | 'Executive'

export type JobCategory =
  | 'Design'
  | 'Engineering'
  | 'Marketing'
  | 'Sales'
  | 'Product'
  | 'Customer Support'
  | 'Finance'
  | 'Human Resources'

export interface JobFilters {
  search: string
  category: string
  location: string
  experienceLevel: string
}

export interface JobApplication {
  id: string
  jobId: string
  applicantId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  resume: string // URL or base64
  coverLetter: string
  portfolio?: string
  linkedIn?: string
  github?: string
  availableStartDate: string
  expectedSalary?: string
  workAuthorization: WorkAuthorizationType
  isWillingToRelocate: boolean
  appliedDate: string
  status: ApplicationStatus
}

export type WorkAuthorizationType =
  | 'Citizen'
  | 'Permanent Resident'
  | 'Work Visa'
  | 'Student Visa'
  | 'Requires Sponsorship'

export type ApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'interviewing'
  | 'rejected'
  | 'accepted'

export interface ApplicationFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  resume: File | null
  coverLetter: string
  portfolio?: string
  linkedIn?: string
  github?: string
  availableStartDate: string
  expectedSalary?: string
  workAuthorization: WorkAuthorizationType
  isWillingToRelocate: boolean
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showLoadMore?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  error?: string
}

export interface LoadingState {
  loading: boolean
  error?: string | null
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export type UserRole = 'job_seeker' | 'employer' | 'admin'

export interface User {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
  role: UserRole
  avatar?: string
  companyName?: string
  profile?: UserProfile
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  bio?: string
  phone?: string
  location?: string
  website?: string
  skills?: string[]
  experience?: string
  education?: string
  resume?: string
  company?: string
  companySize?: string
  industry?: string
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  fname: string
  lname: string
  username: string
  email: string
  password: string
  password_confirm: string
  role: UserRole
  acceptTerms: boolean
}

export interface AuthResponse {
  user: User
  tokens: {
    access: string
    refresh: string
  }
  message?: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

export interface AuthError {
  message: string
  field?: string
  code?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AuthError | null
  token: string | null
}

// ============================================================================
// VIEW MODE TYPES (for job listing views)
// ============================================================================

/**
 * View mode for job listings (grid or list)
 */
export type ViewMode = 'grid' | 'list'