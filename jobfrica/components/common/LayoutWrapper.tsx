'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { AuthHydrationProvider } from '@/components/providers/AuthHydrationProvider'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide Navbar and Footer on auth pages
  const isAuthPage = pathname?.startsWith('/auth')

  return (
    <AuthHydrationProvider>
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? '' : 'min-h-screen'}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </AuthHydrationProvider>
  )
}
