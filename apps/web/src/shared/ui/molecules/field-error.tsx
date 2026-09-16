'use client'

import { motion, AnimatePresence } from 'motion/react'

interface FieldErrorProps {
  readonly message?: string
  readonly id?: string
}

export function FieldError({ message, id }: Readonly<FieldErrorProps>) {
  return (
    <span className="mt-0.5 block min-h-4 text-xs leading-4" id={id}>
      <AnimatePresence>
        {message && (
          <motion.span
            className="block text-negative-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {message}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
