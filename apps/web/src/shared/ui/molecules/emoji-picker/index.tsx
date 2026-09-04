'use client'

import dynamic from 'next/dynamic'

import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import type { EmojiPickerPanelProps } from './picker'

const LazyPanel = dynamic(() => import('./picker').then((m) => m.EmojiPickerPanel), {
  ssr: false,
  loading: () => <Skeleton className="h-108 w-88 rounded-lg" />,
})

export function EmojiPicker(props: Readonly<EmojiPickerPanelProps>) {
  return <LazyPanel {...props} />
}
