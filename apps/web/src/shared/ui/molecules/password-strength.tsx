'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { assessPassword } from '@/shared/lib/password-strength'
import { CheckIcon, XIcon } from '@/shared/ui/icons'

const BAR_COLORS: readonly [
  { min: number; className: string },
  ...{ min: number; className: string }[],
] = [
  { min: 5, className: 'bg-positive' },
  { min: 3, className: 'bg-warning' },
  { min: 1, className: 'bg-destructive' },
  { min: 0, className: 'bg-border' },
]

const LEVEL_KEYS: readonly [{ min: number; key: string }, ...{ min: number; key: string }[]] = [
  { min: 5, key: 'veryStrong' },
  { min: 4, key: 'strong' },
  { min: 3, key: 'medium' },
  { min: 1, key: 'weak' },
]

function forScore<T extends { min: number }>(entries: readonly [T, ...T[]], score: number): T {
  return entries.find((entry) => score >= entry.min) ?? entries[0]
}

interface PasswordStrengthMeterProps {
  readonly value: string
}

export function PasswordStrengthMeter({ value }: Readonly<PasswordStrengthMeterProps>) {
  const { t } = useTranslation()
  const { score, total, requirements } = assessPassword(value)

  return (
    <AnimatePresence initial={false}>
      {value.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div
            className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={t('auth.strength.label')}
          >
            <motion.div
              className={cn('h-full rounded-full', forScore(BAR_COLORS, score).className)}
              initial={false}
              animate={{ width: `${(score / total) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ transition: 'background-color 0.4s' }}
            />
          </div>

          <p className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>{t('auth.strength.label')}</span>
            <span className="font-medium">
              {t(`auth.strength.${forScore(LEVEL_KEYS, score).key}`)}
            </span>
          </p>

          <ul className="mt-1.5 flex flex-col gap-1" aria-label={t('auth.strength.label')}>
            {requirements.map((req) => (
              <li key={req.key} className="flex items-center gap-2">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={req.met ? 'met' : 'unmet'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    className="flex"
                  >
                    {req.met ? (
                      <CheckIcon className="size-3.5 text-positive" />
                    ) : (
                      <XIcon className="size-3.5 text-muted-foreground/60" />
                    )}
                  </motion.span>
                </AnimatePresence>
                <span
                  className={cn(
                    'text-xs transition-colors duration-300',
                    req.met ? 'text-positive-text dark:text-positive' : 'text-muted-foreground',
                  )}
                >
                  {t(`auth.strength.requirements.${req.key}`)}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
