import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { contactObjectWrapper } from '../../object-wrapper'
import { queryWrapper } from '../../query-wrapper'

import type { ReactNode } from 'react'

import { CONTACT_DESCRIPTOR } from '@/entities/contact/config/contact-descriptor.constants'
import { ObjectDescriptorProvider } from '@/entities/object-descriptor'
import { useImportDescriptor } from '@/features/import-records/model/useImportDescriptor'

describe('useImportDescriptor', () => {
  it('exposes the import configuration of the surrounding record type', () => {
    const { result } = renderHook(() => useImportDescriptor(), { wrapper: contactObjectWrapper })

    expect(result.current.config.fieldLabelKey).toBe('contacts.import.fields')
    expect(result.current.descriptor.type).toBe('contact')
    expect(result.current.terms.plural).toBeTruthy()
  })

  it('refuses a record type that ships without an importer', () => {
    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) =>
      queryWrapper({
        children: (
          <ObjectDescriptorProvider descriptor={{ ...CONTACT_DESCRIPTOR, imports: null }}>
            {children}
          </ObjectDescriptorProvider>
        ),
      })

    expect(() => renderHook(() => useImportDescriptor(), { wrapper })).toThrow(/cannot be imported/)
  })
})
