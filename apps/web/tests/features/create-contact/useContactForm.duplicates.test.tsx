import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type {
  ContactDuplicateMatch,
  ContactDuplicatePayload,
  ContactTaxonomy,
} from '@repo/shared-types'

import { useContactForm } from '@/features/create-contact/model/useContactForm'

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
  types: [],
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

function match(field: ContactDuplicateMatch['field']): ContactDuplicateMatch {
  return {
    id: 'contact-9',
    firstName: 'Camila',
    lastName: 'Torres',
    email: 'camila@nexo.test',
    phone: '3001234567',
    documentNumber: '900123456',
    field,
  }
}

function conflictResponse(payload: ContactDuplicatePayload) {
  return HttpResponse.json(
    {
      statusCode: 409,
      error: 'Conflict',
      message: 'contact_duplicate',
      duplicate: payload,
    },
    { status: 409 },
  )
}

function renderContactForm(onDone: () => void) {
  return renderHook(
    () => {
      const hook = useContactForm(null, onDone)
      return { ...hook, errors: hook.form.formState.errors }
    },
    { wrapper },
  )
}

async function submitContact(result: {
  current: ReturnType<typeof useContactForm>
}): Promise<void> {
  await waitFor(() => expect(result.current.form.getValues('status')).toBe('new'))
  act(() => {
    result.current.form.setValue('firstName', 'Camila')
    result.current.form.setValue('phone', '3001234567')
  })
  await act(async () => {
    await result.current.handleSubmit()
  })
}

describe('useContactForm duplicates', () => {
  it('shows an inline email error on a hard duplicate and keeps the drawer open', async () => {
    server.use(
      taxonomyHandler(),
      customFieldsHandler(),
      http.post(`${API}/contacts`, () =>
        conflictResponse({
          severity: 'hard',
          field: 'email',
          matches: [match('email')],
          canForce: false,
        }),
      ),
    )
    const onDone = vi.fn()
    const { result } = renderContactForm(onDone)

    await submitContact(result)

    await waitFor(() =>
      expect(result.current.errors.email?.message).toBe('contacts.duplicates.emailTaken'),
    )
    expect(result.current.duplicateNotice).toBeNull()
    expect(onDone).not.toHaveBeenCalled()
  })

  it('offers force on a soft phone duplicate and retries the same mutation with force', async () => {
    const received: Array<{ force: string | null; body: Record<string, unknown> }> = []
    server.use(
      taxonomyHandler(),
      customFieldsHandler(),
      http.post(`${API}/contacts`, async ({ request }) => {
        const force = new URL(request.url).searchParams.get('force')
        received.push({ force, body: (await request.json()) as Record<string, unknown> })
        if (force !== 'true') {
          return conflictResponse({
            severity: 'soft',
            field: 'phone',
            matches: [match('phone')],
            canForce: true,
          })
        }
        return HttpResponse.json({ data: CONTACTS_FIXTURE[0] })
      }),
    )
    const onDone = vi.fn()
    const { result } = renderContactForm(onDone)

    await submitContact(result)

    await waitFor(() => expect(result.current.duplicateNotice).not.toBeNull())
    expect(result.current.duplicateNotice?.canForce).toBe(true)
    expect(result.current.duplicateNotice?.message).toBe('contacts.duplicates.phoneMatch')
    expect(result.current.errors.phone?.message).toBe('contacts.duplicates.phoneMatch')

    await act(async () => {
      result.current.confirmDuplicate()
    })

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1))
    expect(received.map((r) => r.force)).toEqual([null, 'true'])
    expect(received[1]?.body).toEqual(received[0]?.body)
    expect(result.current.duplicateNotice).toBeNull()
  })

  it('clears the duplicate notice when the user edits a value', async () => {
    server.use(
      taxonomyHandler(),
      customFieldsHandler(),
      http.post(`${API}/contacts`, () =>
        conflictResponse({
          severity: 'soft',
          field: 'phone',
          matches: [match('phone')],
          canForce: true,
        }),
      ),
    )
    const { result } = renderContactForm(vi.fn())

    await submitContact(result)
    await waitFor(() => expect(result.current.duplicateNotice).not.toBeNull())

    act(() => {
      result.current.form.setValue('phone', '3119876543')
    })

    await waitFor(() => expect(result.current.duplicateNotice).toBeNull())
  })

  it('surfaces a hard document duplicate as a form-level notice without force', async () => {
    server.use(
      taxonomyHandler(),
      customFieldsHandler(),
      http.post(`${API}/contacts`, () =>
        conflictResponse({
          severity: 'hard',
          field: 'documentNumber',
          matches: [match('documentNumber')],
          canForce: false,
        }),
      ),
    )
    const onDone = vi.fn()
    const { result } = renderContactForm(onDone)

    await submitContact(result)

    await waitFor(() => expect(result.current.duplicateNotice).not.toBeNull())
    expect(result.current.duplicateNotice?.canForce).toBe(false)
    expect(result.current.duplicateNotice?.message).toBe('contacts.duplicates.documentTaken')
    expect(result.current.errors.email).toBeUndefined()
    expect(onDone).not.toHaveBeenCalled()
  })

  it('keeps the duplicate state untouched on non-duplicate errors', async () => {
    server.use(
      taxonomyHandler(),
      customFieldsHandler(),
      http.post(`${API}/contacts`, () =>
        HttpResponse.json(
          { statusCode: 500, error: 'Internal Server Error', message: 'boom' },
          { status: 500 },
        ),
      ),
    )
    const onDone = vi.fn()
    const { result } = renderContactForm(onDone)

    await submitContact(result)

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.duplicateNotice).toBeNull()
    expect(result.current.errors.email).toBeUndefined()
    expect(onDone).not.toHaveBeenCalled()
  })
})
