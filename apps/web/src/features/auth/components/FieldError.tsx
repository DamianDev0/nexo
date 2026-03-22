'use client'

import { motion, AnimatePresence } from 'motion/react'

interface FieldErrorProps {
  readonly message?: string
}

export function FieldError({ message }: FieldErrorProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          className="mt-1 text-xs text-destructive/80"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
