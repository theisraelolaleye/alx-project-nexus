import { useState, useEffect } from 'react'

/**
 * Custom hook to track the height of the navbar for sticky positioning
 * @param selector - CSS selector for the navbar element
 * @returns The current height of the navbar in pixels
 */
export function useNavbarHeight(selector: string = 'nav'): number {
  const [navbarHeight, setNavbarHeight] = useState(64) // Default fallback

  useEffect(() => {
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

  return navbarHeight
}