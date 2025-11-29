import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes (require authentication, accessible by all authenticated users)
const protectedRoutes = [
  '/dashboard'
]

// Define jobseeker-only routes
const jobseekerRoutes = [
  '/applications',
  '/saved-jobs'
]

// Public routes: /, /jobs, /jobs/[id], /companies, /resources, /employers
// Auth routes: /auth/login, /auth/register, /auth/forgot-password
// Protected routes require authentication and are listed above

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value

  // Get user data from cookies
  const userCookie = request.cookies.get('user')?.value
  let user = null

  if (userCookie) {
    try {
      user = JSON.parse(userCookie)
    } catch (error) {
      console.error('Failed to parse user cookie:', error)
    }
  }

  const isAuthenticated = !!token

  // Log middleware execution for debugging
  console.log('🔐 Proxy:', {
    pathname,
    isAuthenticated,
    userRole: user?.role
  })

  // 1. Redirect authenticated users away from auth pages (login, register, forgot-password)
  if (isAuthenticated && pathname.startsWith('/auth/')) {
    const allowedAuthPaths = ['/auth/verify-email']
    const isAllowedAuthPath = allowedAuthPaths.some(path => pathname.startsWith(path))

    if (!isAllowedAuthPath) {
      console.log('✅ Authenticated user accessing auth page, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // 2. Redirect /profile to /dashboard/profile
  if (pathname === '/profile') {
    console.log('↪️ Redirecting /profile to /dashboard/profile')
    return NextResponse.redirect(new URL('/dashboard/profile', request.url))
  }

  // 3. Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute && !isAuthenticated) {
    console.log('🚫 Protected route, not authenticated, redirecting to login')
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 4. Role-based route protection (jobseeker-only routes)
  if (isAuthenticated && user) {
    const isJobseekerRoute = jobseekerRoutes.some(route => pathname.startsWith(route))

    if (isJobseekerRoute && user.role !== 'job_seeker') {
      console.log('🚫 Jobseeker route accessed by non-jobseeker')
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 5. Allow the request to proceed
  console.log('✅ Request allowed to proceed')
  return NextResponse.next()
}

// Configure which routes proxy runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
}