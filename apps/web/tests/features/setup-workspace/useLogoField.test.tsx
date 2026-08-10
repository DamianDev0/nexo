import { act, renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AppearanceFormValues } from '@/features/setup-workspace/model/types'

import { useLogoField } from '@/features/setup-workspace/model/useLogoField'

const uploadLogo = vi.fn()

vi.mock('@/shared/api/services/settings.service', () => ({
  default: { uploadLogo: (file: File) => uploadLogo(file) },
}))

const DEFAULT_VALUES: AppearanceFormValues = {
  primaryColor: '#000000',
  colorOverrides: {},
  grainIntensity: 0,
  darkMode: 'system',
  fontFamily: 'inter',
  borderRadius: 'sm',
  density: 'comfortable',
  productName: '',
  tagline: '',
  logoUrl: 'https://cdn.acme.co/old-logo.png',
  logoPreview: 'old-preview',
  logoFileName: 'old-name.png',
}

function setup() {
  const { result: form } = renderHook(() => {
    const methods = useForm<AppearanceFormValues>({ defaultValues: DEFAULT_VALUES })
    return {
      ...methods,
      isDirty: methods.formState.isDirty,
      dirtyFields: methods.formState.dirtyFields,
    }
  })
  const { result: logoField } = renderHook(() =>
    useLogoField({ setValue: form.current.setValue, getValues: form.current.getValues }),
  )
  return { form, logoField }
}

beforeEach(() => {
  uploadLogo.mockReset()
  URL.createObjectURL = vi.fn(() => 'blob:new-preview')
})

describe('useLogoField', () => {
  it('optimistically previews the file and persists the uploaded url', async () => {
    uploadLogo.mockResolvedValue({ url: 'https://cdn.acme.co/logo.png' })
    const { form, logoField } = setup()

    const file = new File(['content'], 'brand.png', { type: 'image/png' })
    await act(async () => {
      await logoField.current.handleLogoUpload(file)
    })

    expect(form.current.getValues('logoPreview')).toBe('blob:new-preview')
    expect(form.current.getValues('logoFileName')).toBe('brand.png')
    expect(form.current.getValues('logoUrl')).toBe('https://cdn.acme.co/logo.png')
    expect(form.current.isDirty).toBe(true)
    expect(form.current.dirtyFields.logoPreview).toBe(true)
    expect(form.current.dirtyFields.logoFileName).toBe(true)
    expect(form.current.dirtyFields.logoUrl).toBe(true)
    expect(uploadLogo).toHaveBeenCalledWith(file)
  })

  it('rolls back the preview and file name when the upload rejects, and rethrows', async () => {
    uploadLogo.mockRejectedValue(new Error('network down'))
    const { form, logoField } = setup()

    const file = new File(['content'], 'brand.png', { type: 'image/png' })
    let thrown: unknown
    await act(async () => {
      try {
        await logoField.current.handleLogoUpload(file)
      } catch (error) {
        thrown = error
      }
    })

    expect(thrown).toBeInstanceOf(Error)
    expect((thrown as Error).message).toBe('network down')
    expect(form.current.getValues('logoPreview')).toBe('old-preview')
    expect(form.current.getValues('logoFileName')).toBe('old-name.png')
    expect(form.current.getValues('logoUrl')).toBe('https://cdn.acme.co/old-logo.png')
    expect(form.current.isDirty).toBe(false)
    expect(form.current.dirtyFields.logoPreview).toBeUndefined()
    expect(form.current.dirtyFields.logoFileName).toBeUndefined()
  })

  it('clears the logo url, preview and file name on remove', () => {
    const { form, logoField } = setup()

    act(() => logoField.current.handleLogoRemove())

    expect(form.current.getValues('logoUrl')).toBeNull()
    expect(form.current.getValues('logoPreview')).toBeNull()
    expect(form.current.getValues('logoFileName')).toBeNull()
    expect(form.current.isDirty).toBe(true)
    expect(form.current.dirtyFields.logoUrl).toBe(true)
    expect(form.current.dirtyFields.logoPreview).toBe(true)
    expect(form.current.dirtyFields.logoFileName).toBe(true)
  })
})
