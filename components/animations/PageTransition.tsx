'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
}

const pageTransition = {
  type: 'tween' as const,
  ease: [0.6, -0.05, 0.01, 0.99] as const,
  duration: 0.4,
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion()

  // 系统开启「减少动效」时直接呈现终态，避免页面长时间半透明
  if (prefersReducedMotion) {
    return <div className={`page-transition ${className}`}>{children}</div>
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={`page-transition ${className}`}
    >
      {children}
    </motion.div>
  )
}
