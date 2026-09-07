import { Text } from '@/shared/ui/atoms/text'

import type { ReactNode } from 'react'

type RecordDrawerIdentityProps = {
  readonly avatar: ReactNode
  readonly name: string
  readonly badge?: ReactNode
  readonly menu?: ReactNode
  readonly end?: ReactNode
}

export function RecordDrawerIdentity({
  avatar,
  name,
  badge,
  menu,
  end,
}: Readonly<RecordDrawerIdentityProps>) {
  return (
    <div data-slot="record-drawer-identity" className="flex flex-col gap-2 px-4 pt-4">
      <div className="flex items-center gap-3">
        <span className="relative shrink-0">{avatar}</span>
        <span className="flex min-w-0 flex-1 items-center gap-1">
          <Text variant="strong" className="truncate text-lg font-bold tracking-tight" title={name}>
            {name}
          </Text>
          {menu}
        </span>
        {end ? <span className="flex shrink-0 items-center">{end}</span> : null}
      </div>
      {badge ? <div className="flex flex-wrap items-center gap-1.5">{badge}</div> : null}
    </div>
  )
}
