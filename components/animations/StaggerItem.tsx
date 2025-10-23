'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggerItemProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function StaggerItem({ children, className = '', delay = 0 }: StaggerItemProps) {
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
      className={className}
    >
      {children}
    </motion.div>
  )
}
