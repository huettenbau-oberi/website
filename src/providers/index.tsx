import React from 'react'
import { MotionConfig } from 'framer-motion'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        {/* `reducedMotion="user"` makes every <motion.*> component honour the OS-level
            reduced-motion preference automatically — transitions collapse, layout shifts
            still apply. Imperative `animate()` calls (e.g. CampFacts CountUp) must opt in
            separately via useReducedMotion(). */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
