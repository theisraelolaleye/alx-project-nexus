/**
 * Core job interface used throughout the application
 */
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

/**
 * Job type enumeration
 */
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship'

/**
 * Experience level enumeration
 */
export type ExperienceLevel = 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead' | 'Executive'

/**
 * Job category enumeration
 */
export type JobCategory =
  | 'Design'
  | 'Engineering'
  | 'Marketing'
  | 'Sales'
  | 'Product'
  | 'Customer Support'
  | 'Finance'
  | 'Human Resources'

/**
 * Filter interface for job searching and filtering
 */
export interface JobFilters {
  search: string
  category: string
  location: string
  experienceLevel: string
}

/**
 * Pagination interface for job listings
 */
export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showLoadMore?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

/**
 * API response wrapper for consistent data handling
 */
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  error?: string
}

/**
 * Loading state interface for components
 */
export interface LoadingState {
  loading: boolean
  error?: string | null
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * User role enumeration
 */
export type UserRole = 'job_seeker' | 'employer' | 'admin'

/**
 * User interface for authenticated users
 */
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

/**
 * User profile interface for extended user information
 */
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

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Registration data interface
 */
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

/**
 * Authentication response interface
 */
export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
  message?: string
}

/**
 * Password reset interfaces
 */
export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

/**
 * Authentication error interface
 */
export interface AuthError {
  message: string
  field?: string
  code?: string
}

/**
 * Auth state interface for global state management
 */
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