/**
 * Next.js Middleware for authentication and route protection
 * Handles authentication checks before pages load
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': null, // Any authenticated user
  '/profile': null, // Any authenticated user
  '/applications': 'jobseeker', // Only job seekers
  '/saved-jobs': 'jobseeker', // Only job seekers
  '/employer': 'employer', // Only employers
  '/employer/dashboard': 'employer',
  '/employer/jobs': 'employer',
  '/employer/applications': 'employer',
  '/admin': 'admin', // Only admin users
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/jobs',
  '/companies',
  '/about',
  '/contact',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  // Check if the route is protected
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  )

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If it's a protected route and user is not authenticated
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For authenticated users accessing auth pages, redirect to dashboard
  if (token && pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // TODO: Add role-based access control
  // This would require decoding the JWT token to get user role
  // For now, we'll handle role-based access in the ProtectedRoute component

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}