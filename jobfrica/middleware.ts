import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/jobs/saved',
  '/jobs/applied',
  '/applications'
]

// Define employer-only routes
const employerRoutes = [
  '/employer/dashboard',
  '/employer/post-job',
  '/employer/applications',
  '/employer/company'
]

// Define jobseeker-only routes
const jobseekerRoutes = [
  '/applications',
  '/jobs/saved',
  '/resume'
]

// Define public routes (no auth needed)
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/jobs',
  '/companies',
  '/resources',
  '/employers',
  '/unauthorized'
]

export function middleware(request: NextRequest) {
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

  console.log('🔐 Middleware:', { pathname, isAuthenticated, userRole: user?.role, isVerified: user?.isVerified })

  // 1. Redirect authenticated users away from auth pages
  if (isAuthenticated && pathname.startsWith('/auth')) {
    // Allow access to verify-email page if not verified
    if (!user?.isVerified && pathname.startsWith('/auth/verify-email')) {
      return NextResponse.next()
    }

    // If verified, redirect away from auth pages
    if (user?.isVerified) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If not verified and not on verify page, go to verify page
    if (!pathname.startsWith('/auth/verify-email')) {
      return NextResponse.redirect(new URL('/auth/verify-email', request.url))
    }
  }

  // 2. Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !isAuthenticated) {
    // Store the original URL to redirect after login
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 3. Check if user is verified for protected routes
  if (isAuthenticated && isProtectedRoute && user && !user.isVerified) {
    // Unverified users can only access verification page
    if (!pathname.startsWith('/auth/verify-email')) {
      return NextResponse.redirect(new URL('/auth/verify-email', request.url))
    }
  }

  // 4. Role-based route protection
  if (isAuthenticated && user) {
    // Check employer-only routes
    const isEmployerRoute = employerRoutes.some(route =>
      pathname.startsWith(route)
    )

    if (isEmployerRoute && user.role !== 'employer') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Check jobseeker-only routes
    const isJobseekerRoute = jobseekerRoutes.some(route =>
      pathname.startsWith(route)
    )

    if (isJobseekerRoute && user.role !== 'jobseeker') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // 5. Allow the request to proceed
  return NextResponse.next()
}

// Configure which routes middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (optional)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
}