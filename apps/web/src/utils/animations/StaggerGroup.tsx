'use client'

import { motion, type Variants } from 'motion/react'
import { cn } from '@/utils/cn'
import { staggerContainer, staggerChild, smoothEase } from './variants'

interface StaggerGroupProps {
  readonly children: React.ReactNode
  readonly className?: string
  readonly containerVariants?: Variants
  readonly as?: 'div' | 'ul' | 'section'
}

export function StaggerGroup({
  children,
  className,
  containerVariants = staggerContainer,
  as = 'div',
}: StaggerGroupProps) {
  const Component = motion.create(as)

  return (
    <Component
      initial="initial"
      animate="animate"
      variants={containerVariants}
      className={className}
    >
      {children}
    </Component>
  )
}

interface StaggerItemProps {
  readonly children: React.ReactNode
  readonly className?: string
  readonly variants?: Variants
}

export function StaggerItem({ children, className, variants = staggerChild }: StaggerItemProps) {
  return (
    <motion.div variants={variants} transition={smoothEase} className={cn(className)}>
      {children}
    </motion.div>
  )
}
