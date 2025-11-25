'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Mail, Lock, User, Briefcase, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { registerSchema, type RegisterFormData } from '@/lib/validations'

interface RegisterFormProps {
  onSuccess?: () => void
  redirectPath?: string
}

export function RegisterForm({ onSuccess, redirectPath = '/dashboard' }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser, isLoading, error, clearError } = useAuthStore()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError()
      console.log(data)
      await registerUser(data)

      if (onSuccess) {
        onSuccess()
      }

      reset()
    } catch (error) {
      // Error is handled by the store
      console.error('Registration failed:', error)
    }
  }
console.log('Rendering RegisterForm, isValid:', isValid)
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-600">
            Join JobFrica and start your career journey
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`
                relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors
                ${selectedRole === 'job_seeker'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'}
              `}>
                <input
                  {...register('role')}
                  type="radio"
                  value="job_seeker"
                  className="sr-only"
                />
                <Briefcase className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Job Seeker</div>
                  <div className="text-xs text-gray-500">Find opportunities</div>
                </div>
              </label>

              <label className={`
                relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors
                ${selectedRole === 'employer'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'}
              `}>
                <input
                  {...register('role')}
                  type="radio"
                  value="employer"
                  className="sr-only"
                />
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Employer</div>
                  <div className="text-xs text-gray-500">Hire talent</div>
                </div>
              </label>
            </div>
            {errors.role && (
              <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* First Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('fname')}
                type="text"
                id="fname"
                autoComplete="fname"
                className={`
                  block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.fname ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Enter your first name"
              />
            </div>
            {errors.fname && (
              <p className="mt-2 text-sm text-red-600">{errors.fname.message}</p>
            )}
          </div>

          {/* Last Name Field */}
          <div>
            <label htmlFor="lname" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('lname')}
                type="text"
                id="lname"
                autoComplete="lname"
                className={`
                  block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.lname ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Enter your last name"
              />
            </div>
            {errors.lname && (
              <p className="mt-2 text-sm text-red-600">{errors.lname.message}</p>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('username')}
                type="text"
                id="username"
                autoComplete="username"
                className={`
        block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${errors.username ? 'border-red-300' : 'border-gray-300'}
      `}
                placeholder="Choose a username"
              />
            </div>
            {errors.username && (
              <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                className={`
                  block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.email ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                className={`
                  block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.password ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Create a password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password_confirm')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                className={`
                  block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.password_confirm ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password_confirm && (
              <p className="mt-2 text-sm text-red-600">{errors.password_confirm.message}</p>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('acceptTerms')}
                id="acceptTerms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="acceptTerms" className="text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm
              text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}