import { DocumentType, LifecycleStage } from '@repo/shared-types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactListItem, ContactTaxonomy } from '@repo/shared-types'

import { useContactForm } from '@/features/create-contact/model/useContactForm'

const EXISTING_CONTACT: ContactListItem = {
  id: 'contact-1',
  firstName: 'Maria',
  lastName: 'Lopez',
  email: 'maria@nexo.test',
  phone: '3001234567',
  whatsapp: '3001234567',
  documentType: DocumentType.CC,
  documentNumber: '123456789',
  city: 'Bogota',
  municipioCode: '11001',
  status: 'qualified',
  statusChangedAt: '2026-08-01T00:00:00.000Z',
  avatarUrl: null,
  lifecycleStage: LifecycleStage.LEAD,
  source: 'manual',
  lastContactedAt: null,
  tags: [],
  companyId: null,
  assignedToId: null,
  isActive: true,
  createdById: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  noteCount: 0,
  optedOutChannels: [],
  customFields: { address: 'Calle 100 #7-21' },
}

const EMPTY_TAXONOMY: ContactTaxonomy = {
  statuses: [
    {
      key: 'new',
      label: null,
      description: null,
      color: '#60A5FA',
      order: 1,
      isSystem: true,
      enabled: true,
    },
  ],
  sources: [],
  lifecycleStages: [],
}

const server = createMswServer()

function taxonomyHandler() {
  return http.get(`${API}/settings/contact-taxonomy`, () =>
    HttpResponse.json({ data: EMPTY_TAXONOMY }),
  )
}

function customFieldsHandler() {
  return http.get(`${API}/settings/custom-fields/contacts`, () => HttpResponse.json({ data: [] }))
}

describe('useContactForm', () => {
  it('populates the form with the contact values in edit mode', async () => {
    server.use(taxonomyHandler(), customFieldsHandler(), customFieldsHandler())

    const { result } = renderHook(() => useContactForm(EXISTING_CONTACT, vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.form.getValues('firstName')).toBe('Maria'))
    expect(result.current.form.getValues('status')).toBe('qualified')
    expect(result.current.form.getValues('source')).toBe('manual')
    expect(result.current.form.getValues('address')).toBe('Calle 100 #7-21')
    expect(result.current.form.getValues('whatsappSameAsPhone')).toBe(true)
    expect(result.current.isEdit).toBe(true)
  })

  it('derives whatsappSameAsPhone as false when the numbers differ', async () => {
    server.use(taxonomyHandler(), customFieldsHandler(), customFieldsHandler())
    const contact = { ...EXISTING_CONTACT, whatsapp: '3009999999' }

    const { result } = renderHook(() => useContactForm(contact, vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.form.getValues('firstName')).toBe('Maria'))
    expect(result.current.form.getValues('whatsappSameAsPhone')).toBe(false)
  })

  it('maps null contact fields to empty form strings', async () => {
    server.use(taxonomyHandler(), customFieldsHandler(), customFieldsHandler())
    const contact: ContactListItem = {
      ...EXISTING_CONTACT,
      lastName: null,
      email: null,
      phone: null,
      whatsapp: null,
      city: null,
      municipioCode: null,
      source: null,
      customFields: {},
    }

    const { result } = renderHook(() => useContactForm(contact, vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.form.getValues('firstName')).toBe('Maria'))
    expect(result.current.form.getValues()).toMatchObject({
      lastName: '',
      email: '',
      phone: '',
      whatsapp: '',
      whatsappSameAsPhone: false,
      address: '',
      city: '',
      municipioCode: '',
      source: '',
    })
  })

  it('serializes the full payload and resolves whatsapp from the phone', async () => {
    server.use(taxonomyHandler(), customFieldsHandler(), customFieldsHandler())
    let receivedBody: Record<string, unknown> | null = null
    server.use(
      http.post(`${API}/contacts`, async ({ request }) => {
        receivedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: EXISTING_CONTACT })
      }),
    )

    const onDone = vi.fn()
    const { result } = renderHook(() => useContactForm(null, onDone), { wrapper })
    await waitFor(() => expect(result.current.form.getValues('status')).toBe('new'))

    act(() => {
      result.current.form.reset({
        firstName: 'Valentina',
        lastName: 'Restrepo',
        email: 'valentina@nexo.test',
        phone: '3001234567',
        whatsapp: '',
        whatsappSameAsPhone: true,
        address: 'Calle 100 #7-21',
        city: 'Bogotá',
        municipioCode: '11001',
        status: 'new',
        avatarUrl: '',
        source: 'manual',
        lifecycleStage: '',
      })
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    await waitFor(() => expect(onDone).toHaveBeenCalled())
    expect(receivedBody).toEqual({
      firstName: 'Valentina',
      lastName: 'Restrepo',
      email: 'valentina@nexo.test',
      phone: '3001234567',
      whatsapp: '3001234567',
      city: 'Bogotá',
      municipioCode: '11001',
      status: 'new',
      source: 'manual',
      customFields: { address: 'Calle 100 #7-21' },
    })
  })

  it('patches the existing contact in edit mode', async () => {
    server.use(taxonomyHandler(), customFieldsHandler(), customFieldsHandler())
    let patchedUrl: string | null = null
    server.use(
      http.patch(`${API}/contacts/:id`, ({ request }) => {
        patchedUrl = request.url
        return HttpResponse.json({ data: EXISTING_CONTACT })
      }),
    )

    const onDone = vi.fn()
    const { result } = renderHook(() => useContactForm(EXISTING_CONTACT, onDone), { wrapper })
    await waitFor(() => expect(result.current.form.getValues('firstName')).toBe('Maria'))

    await act(async () => {
      await result.current.handleSubmit()
    })

    await waitFor(() => expect(onDone).toHaveBeenCalled())
    expect(patchedUrl).toContain('/contacts/contact-1')
  })

  it('posts a ContactInput with source undefined when the form value is empty', async () => {
    server.use(taxonomyHandler(), customFieldsHandler(), customFieldsHandler())
    let receivedBody: Record<string, unknown> | null = null
    server.use(
      http.post(`${API}/contacts`, async ({ request }) => {
        receivedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: EXISTING_CONTACT })
      }),
    )

    const onDone = vi.fn()
    const { result } = renderHook(() => useContactForm(null, onDone), { wrapper })

    await waitFor(() => expect(result.current.form.getValues('status')).toBe('new'))

    act(() => {
      result.current.form.setValue('firstName', 'Carlos')
      result.current.form.setValue('source', '')
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    await waitFor(() => expect(onDone).toHaveBeenCalled())
    expect(receivedBody).toMatchObject({ firstName: 'Carlos' })
    expect(receivedBody).not.toHaveProperty('source')
  })
})
