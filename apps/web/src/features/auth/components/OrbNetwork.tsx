'use client'

import { useTheme } from 'next-themes'
import { motion } from 'motion/react'
import {
  ORB_GRADIENT,
  ORB_SHADOW,
  ORB_SPECULAR,
  ORB_RIM_LIGHT,
  CONNECTOR_LINE_LIGHT,
  CONNECTOR_LINE_DARK,
} from '@/utils/effects'

const CENTER = { x: 50, y: 50 } as const

const NODES = [
  { x: 18, y: 18, label: 'Contacts' },
  { x: 82, y: 16, label: 'Pipeline' },
  { x: 8, y: 48, label: 'Tasks' },
  { x: 92, y: 48, label: 'Reports' },
  { x: 22, y: 80, label: 'Email' },
  { x: 78, y: 80, label: 'Auto' },
] as const

export function OrbNetwork() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const lineColor = isDark ? CONNECTOR_LINE_DARK : CONNECTOR_LINE_LIGHT
  const labelColor = isDark ? 'rgba(255,245,224,0.45)' : 'rgba(30,21,8,0.45)'

  return (
    <div className="relative flex size-full items-center justify-center">
      {/* SVG layer */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 z-0 size-full overflow-visible">
        {/* Dashed lines */}
        {NODES.map((n, i) => (
          <motion.path
            key={`line-${n.label}`}
            d={`M${CENTER.x},${CENTER.y} L${n.x},${n.y}`}
            stroke={lineColor}
            strokeWidth={0.3}
            strokeDasharray="1.2 1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.7, ease: 'easeOut' as const }}
          />
        ))}

        {/* Node dots */}
        {NODES.map((n, i) => (
          <motion.circle
            key={`dot-${n.label}`}
            cx={n.x}
            cy={n.y}
            r={2.2}
            fill="url(#nodeGrad)"
            stroke="rgba(212,160,48,0.35)"
            strokeWidth={0.15}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.5 + i * 0.13,
              duration: 0.4,
              type: 'spring' as const,
              stiffness: 220,
            }}
          />
        ))}

        {/* Labels */}
        {NODES.map((n, i) => (
          <motion.text
            key={`label-${n.label}`}
            x={n.x}
            y={n.y > 60 ? n.y + 4.5 : n.y - 4}
            textAnchor="middle"
            fill={labelColor}
            fontSize="2.8"
            fontWeight="600"
            letterSpacing="0.12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 + i * 0.13, duration: 0.4 }}
          >
            {n.label}
          </motion.text>
        ))}

        <defs>
          <radialGradient id="nodeGrad" cx="38%" cy="35%">
            <stop offset="0%" stopColor="#fff7e8" />
            <stop offset="55%" stopColor="#e5c07a" />
            <stop offset="100%" stopColor="#c49030" />
          </radialGradient>
        </defs>
      </svg>

      {/* Orb */}
      <motion.div
        className="absolute z-2 size-40 rounded-full lg:size-48"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' as const }}
        style={{ background: ORB_GRADIENT, boxShadow: ORB_SHADOW }}
      >
        <div
          className="pointer-events-none absolute left-[18%] top-[13%] h-[28%] w-[40%] rounded-full"
          style={{ background: ORB_SPECULAR }}
        />
        <div
          className="pointer-events-none absolute bottom-[12%] left-[30%] h-[8%] w-[40%] rounded-full"
          style={{ background: ORB_RIM_LIGHT, filter: 'blur(4px)' }}
        />
      </motion.div>
    </div>
  )
}
