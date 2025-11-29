'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallbackPath?: string
  loadingComponent?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/auth/login',
  loadingComponent
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, checkAuthStatus } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Check auth status on mount
    checkAuthStatus()
  }, [checkAuthStatus])

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Store the intended destination
        const currentPath = window.location.pathname + window.location.search
        sessionStorage.setItem('redirectAfterLogin', currentPath)
        router.push(fallbackPath)
        return
      }

      if (requiredRole && user?.role !== requiredRole) {
        // User doesn't have required role
        router.push('/unauthorized')
        return
      }
    }
  }, [isAuthenticated, user, isLoading, router, fallbackPath, requiredRole])

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}

export function useProtectedAccess(requiredRole?: UserRole) {
  const { isAuthenticated, user } = useAuthStore()

  const hasAccess = isAuthenticated && (!requiredRole || user?.role === requiredRole)

  return {
    hasAccess,
    isAuthenticated,
    user,
    userRole: user?.role
  }
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}