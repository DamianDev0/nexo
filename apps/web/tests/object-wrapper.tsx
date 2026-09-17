import { queryWrapper } from './query-wrapper'

import type { ReactNode } from 'react'

import { CONTACT_DESCRIPTOR } from '@/entities/contact/config/contact-descriptor.constants'
import { ObjectDescriptorProvider } from '@/entities/object-descriptor'

export function contactObjectWrapper({ children }: Readonly<{ children: ReactNode }>) {
  return queryWrapper({
    children: (
      <ObjectDescriptorProvider descriptor={CONTACT_DESCRIPTOR}>
        {children}
      </ObjectDescriptorProvider>
    ),
  })
}
