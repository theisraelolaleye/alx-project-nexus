import { useState, useEffect } from 'react'

export function useNavbarHeight(selector: string = 'nav'): number {
  const [navbarHeight, setNavbarHeight] = useState(64) // Default fallback
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const updateHeight = () => {
      const navbar = document.querySelector(selector) as HTMLElement
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight)
      }
    }

    // Initial measurement after DOM is ready
    const timer = setTimeout(updateHeight, 100)

    // Listen for resize events
    window.addEventListener('resize', updateHeight)

    // Use ResizeObserver for more accurate tracking if available
    let resizeObserver: ResizeObserver | null = null
    const navbar = document.querySelector(selector) as HTMLElement

    if (navbar && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateHeight)
      resizeObserver.observe(navbar)
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateHeight)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [selector])

  // Return consistent height during SSR and initial client render
  return isMounted ? navbarHeight : 64
}