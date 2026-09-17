import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { ReactNode } from 'react'

import { CONTACT_DESCRIPTOR } from '@/entities/contact/config/contact-descriptor.constants'
import { ObjectDescriptorProvider, useObjectDescriptor } from '@/entities/object-descriptor'

describe('useObjectDescriptor', () => {
  it('reads the descriptor of the surrounding object board', () => {
    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <ObjectDescriptorProvider descriptor={CONTACT_DESCRIPTOR}>
        {children}
      </ObjectDescriptorProvider>
    )

    const { result } = renderHook(() => useObjectDescriptor(), { wrapper })

    expect(result.current.type).toBe('contact')
    expect(result.current.apiPath).toBe('/contacts')
  })

  it('fails loudly when a generic feature renders outside an object board', () => {
    expect(() => renderHook(() => useObjectDescriptor())).toThrow(/ObjectDescriptorProvider/)
  })
})
