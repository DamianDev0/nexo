'use client'

import { motion } from 'motion/react'
import { useTheme } from 'next-themes'

import {
  SIRI_ORB,
  CONNECTOR_LINE_LIGHT,
  CONNECTOR_LINE_DARK,
  ORB_LABEL_DARK,
  ORB_LABEL_LIGHT,
  ORB_GRID_DARK,
  ORB_GRID_LIGHT,
  ORB_LINK_STROKE,
  NODE_GRADIENT_STOPS,
} from '@/shared/config/tokens/effects'
import { SiriOrb } from '@/shared/ui/atoms/siri-orb'

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
  const labelColor = isDark ? ORB_LABEL_DARK : ORB_LABEL_LIGHT
  const gridColor = isDark ? ORB_GRID_DARK : ORB_GRID_LIGHT

  return (
    <div className="relative flex size-full items-center justify-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 0.5px, transparent 0.5px),
            linear-gradient(to bottom, ${gridColor} 0.5px, transparent 0.5px)
          `,
          backgroundSize: '70px 70px',
        }}
      />

      <svg viewBox="0 0 100 100" className="absolute inset-0 z-0 size-full overflow-visible">
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

        {NODES.map((n, i) => (
          <motion.circle
            key={`dot-${n.label}`}
            cx={n.x}
            cy={n.y}
            r={2.2}
            fill="url(#nodeGrad)"
            stroke={ORB_LINK_STROKE}
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
            {NODE_GRADIENT_STOPS.map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </radialGradient>
        </defs>
      </svg>

      <motion.div
        className="absolute z-2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' as const }}
      >
        <SiriOrb size={192} colors={isDark ? SIRI_ORB.dark : SIRI_ORB.light} />
      </motion.div>
    </div>
  )
}
