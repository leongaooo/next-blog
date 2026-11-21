'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggerItemProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function StaggerItem({ children, className = '', delay = 0 }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion()

  // 系统要求减少动效时，直接渲染终态，不做入场动画
  if (prefersReducedMotion) {
    return <div className={`enter-item enter-static ${className}`}>{children}</div>
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            delay,
            ease: [0.6, -0.05, 0.01, 0.99],
          },
        },
      }}
      className={`enter-item ${className}`}
    >
      {children}
    </motion.div>
  )
}
