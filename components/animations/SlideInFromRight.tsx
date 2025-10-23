'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SlideInFromRightProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export default function SlideInFromRight({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}: SlideInFromRightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.6, -0.05, 0.01, 0.99],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
