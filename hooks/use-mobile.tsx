"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Check immediately
    checkMobile()

    // Add event listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Use the appropriate event listener based on browser support
    if (mql.addEventListener) {
      mql.addEventListener("change", checkMobile)
      return () => mql.removeEventListener("change", checkMobile)
    } else {
      // For older browsers
      window.addEventListener("resize", checkMobile)
      return () => window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return !!isMobile
}

// Export with both names for backward compatibility
export const useMobile = useIsMobile
