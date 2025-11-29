'use client'

import { useEffect, useState } from 'react'

interface ClientOnlyDateProps {
  dateString: string
  className?: string
}

export function ClientOnlyDate({ dateString, className = '' }: ClientOnlyDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Only format the date on the client side to avoid hydration mismatches
    const formatRelativeTime = (dateStr: string): string => {
      try {
        const date = new Date(dateStr)
        const now = new Date()
        const diffInMs = now.getTime() - date.getTime()
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

        if (diffInDays === 0) return 'Today'
        if (diffInDays === 1) return '1 day ago'
        if (diffInDays < 7) return `${diffInDays} days ago`
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
        return `${Math.floor(diffInDays / 30)} months ago`
      } catch {
        return 'Recently'
      }
    }

    setFormattedDate(formatRelativeTime(dateString))
  }, [dateString])

  // Show a static placeholder during SSR to avoid hydration mismatch
  if (!isMounted) {
    return <span className={className}>Recently</span>
  }

  return <span className={className}>{formattedDate}</span>
}

// Alternative simpler approach - just show static date during SSR
interface SafeDateDisplayProps {
  dateString: string
  className?: string
}

export function SafeDateDisplay({ dateString, className = '' }: SafeDateDisplayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Show static placeholder during SSR
    return <span className={className}>Recently</span>
  }

  // Show formatted date on client
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    let displayText = 'Recently'
    if (diffInDays === 0) displayText = 'Today'
    else if (diffInDays === 1) displayText = '1 day ago'
    else if (diffInDays < 7) displayText = `${diffInDays} days ago`
    else if (diffInDays < 30) displayText = `${Math.floor(diffInDays / 7)} weeks ago`
    else displayText = `${Math.floor(diffInDays / 30)} months ago`

    return <span className={className}>{displayText}</span>
  } catch {
    return <span className={className}>Recently</span>
  }
}