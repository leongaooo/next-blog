'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeInUpProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export default function FadeInUp({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}: FadeInUpProps) {
  const prefersReducedMotion = useReducedMotion()

  // 系统要求减少动效时，直接渲染终态，不做入场动画
  if (prefersReducedMotion) {
    return <div className={`enter-item enter-static ${className}`}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.6, -0.05, 0.01, 0.99],
      }}
      className={`enter-item ${className}`}
    >
      {children}
    </motion.div>
  )
}
