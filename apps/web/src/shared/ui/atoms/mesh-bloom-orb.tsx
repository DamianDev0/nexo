'use client'

import { MESH_BLOOM } from '@/shared/config/tokens/effects'
import { cn } from '@/shared/lib'

const BLOBS = [
  {
    color: MESH_BLOOM.blobA,
    style: { left: '-16%', top: '-10%', width: '88%', height: '88%' },
    duration: '9s',
    reverse: false,
  },
  {
    color: MESH_BLOOM.blobB,
    style: { right: '-14%', top: '12%', width: '74%', height: '74%' },
    duration: '11s',
    reverse: true,
  },
  {
    color: MESH_BLOOM.blobC,
    style: { left: '18%', bottom: '-18%', width: '78%', height: '78%' },
    duration: '13s',
    reverse: false,
  },
] as const

interface MeshBloomOrbProps {
  readonly size?: number
  readonly className?: string
}

export function MeshBloomOrb({ size = 192, className }: Readonly<MeshBloomOrbProps>) {
  return (
    <div
      data-slot="mesh-bloom-orb"
      aria-hidden
      className={cn('relative overflow-hidden rounded-full', className)}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 bg-mesh-base" />
      {BLOBS.map((blob) => (
        <div
          key={blob.color}
          className="absolute rounded-full blur-[26px] motion-reduce:animate-none"
          style={{
            ...blob.style,
            background: blob.color,
            animation: `mesh-drift ${blob.duration} ease-in-out infinite ${blob.reverse ? 'reverse' : ''}`,
          }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: `radial-gradient(${MESH_BLOOM.dotInk} 0.6px, transparent 0.6px)`,
          backgroundSize: '5px 5px',
        }}
      />
    </div>
  )
}
