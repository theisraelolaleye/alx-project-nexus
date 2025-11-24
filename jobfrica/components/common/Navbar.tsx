'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Briefcase, User, LogOut, Settings, Heart, FileText } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const { isAuthenticated, user, logout } = useAuthStore()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen)

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">JobFrica</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group">
                <span className="relative z-10">Home</span>
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
              </Link>
              <Link href="/jobs" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group">
                <span className="relative z-10">Find Jobs</span>
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
              </Link>
              <Link href="/companies" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group">
                <span className="relative z-10">Companies</span>
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
              </Link>
              <Link href="/resources" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group">
                <span className="relative z-10">Career Resources</span>
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
              </Link>
              <Link href="/employers" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group">
                <span className="relative z-10">For Employers</span>
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
              </Link>
            </div>
          </div>

          {/* Auth Buttons or User Menu - Desktop */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-3 bg-gray-100 rounded-lg px-3 py-2 hover:bg-gray-200 transition-colors"
                >
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || 'User avatar'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {user?.name ? getUserInitials(user.name) : 'U'}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    {user?.role === 'jobseeker' && (
                      <>
                        <Link
                          href="/saved-jobs"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4 mr-3" />
                          Saved Jobs
                        </Link>
                        <Link
                          href="/applications"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FileText className="w-4 h-4 mr-3" />
                          Applications
                        </Link>
                      </>
                    )}
                    {user?.role === 'employer' && (
                      <Link
                        href="/employer/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Briefcase className="w-4 h-4 mr-3" />
                        Employer Dashboard
                      </Link>
                    )}
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link href="/" className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/jobs" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
              Find Jobs
            </Link>
            <Link href="/companies" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
              Companies
            </Link>
            <Link href="/resources" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
              Career Resources
            </Link>
            <Link href="/employers" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
              For Employers
            </Link>

            {/* Mobile Auth Section */}
            {isAuthenticated ? (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center px-3 py-2 mb-3">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || 'User avatar'}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium mr-3">
                      {user?.name ? getUserInitials(user.name) : 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-base font-medium text-gray-900">{user?.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{user?.role}</div>
                  </div>
                </div>

                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                  Dashboard
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                  Profile
                </Link>
                {user?.role === 'jobseeker' && (
                  <>
                    <Link href="/saved-jobs" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                      Saved Jobs
                    </Link>
                    <Link href="/applications" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                      Applications
                    </Link>
                  </>
                )}
                {user?.role === 'employer' && (
                  <Link href="/employer/dashboard" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                    Employer Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-600 hover:text-red-700 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                <Link
                  href="/auth/login"
                  className="w-full text-left text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full text-left bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}