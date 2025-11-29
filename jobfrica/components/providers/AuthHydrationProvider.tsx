'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export function AuthHydrationProvider({ children }: { children: React.ReactNode }) {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus)

  useEffect(() => {
    // Rehydrate the auth store after the component mounts on the client
    useAuthStore.persist.rehydrate()

    // Check auth status after rehydration
    checkAuthStatus()
  }, [checkAuthStatus])

  return <>{children}</>
}