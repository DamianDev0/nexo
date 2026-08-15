import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type {
  ContactDuplicateMatch,
  ContactDuplicatePayload,
  ContactListItem,
  ContactTaxonomy,
} from '@repo/shared-types'

import { useContactForm } from '@/features/create-contact/model/useContactForm'

const EMPTY_TAXONOMY: ContactTaxonomy = { statuses: [], sources: [], types: [] }

const server = createMswServer()

function taxonomyHandler() {
  return http.get(`${API}/settings/contact-taxonomy`, () =>
    HttpResponse.json({ data: EMPTY_TAXONOMY }),
  )
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

function probeHandler(duplicate: ContactDuplicatePayload | null, onRequest?: (url: URL) => void) {
  return http.get(`${API}/contacts/duplicates/probe`, ({ request }) => {
    onRequest?.(new URL(request.url))
    return HttpResponse.json({ data: { duplicate } })
  })
}

function renderContactForm(contact: ContactListItem | null = null) {
  return renderHook(
    () => {
      const hook = useContactForm(contact, vi.fn())
      return { ...hook, errors: hook.form.formState.errors }
    },
    { wrapper },
  )
}

async function waitForTaxonomy(result: { current: ReturnType<typeof useContactForm> }) {
  await waitFor(() => expect(result.current.taxonomy.statuses).toBeDefined())
}

describe('useContactForm probeField', () => {
  it('sets an inline email error on blur probe when a hard duplicate exists, without submitting', async () => {
    const urls: URL[] = []
    server.use(
      taxonomyHandler(),
      probeHandler(
        { severity: 'hard', field: 'email', matches: [match('email')], canForce: false },
        (url) => urls.push(url),
      ),
    )
    const { result } = renderContactForm()
    await waitForTaxonomy(result)

    act(() => {
      result.current.form.setValue('email', 'camila@nexo.test')
    })
    await act(async () => {
      await result.current.probeField('email')
    })

    expect(urls).toHaveLength(1)
    expect(urls[0]?.searchParams.get('email')).toBe('camila@nexo.test')
    expect(urls[0]?.searchParams.get('excludeId')).toBeNull()
    expect(result.current.errors.email?.message).toBe('contacts.duplicates.emailTaken')
    expect(result.current.duplicateNotice).toBeNull()
  })

  it('does not call the endpoint when the value is empty or matches the original contact', async () => {
    const urls: URL[] = []
    server.use(
      taxonomyHandler(),
      probeHandler(null, (url) => urls.push(url)),
    )
    const contact = CONTACTS_FIXTURE[0] as ContactListItem
    const { result } = renderContactForm(contact)
    await waitForTaxonomy(result)
    await waitFor(() => expect(result.current.form.getValues('email')).toBe(contact.email))

    await act(async () => {
      await result.current.probeField('email')
    })

    act(() => {
      result.current.form.setValue('phone', '')
    })
    await act(async () => {
      await result.current.probeField('phone')
    })

    expect(urls).toHaveLength(0)
    expect(result.current.errors.email).toBeUndefined()
  })

  it('sends excludeId when probing a changed value in edit mode', async () => {
    const urls: URL[] = []
    server.use(
      taxonomyHandler(),
      probeHandler(null, (url) => urls.push(url)),
    )
    const contact = CONTACTS_FIXTURE[0] as ContactListItem
    const { result } = renderContactForm(contact)
    await waitForTaxonomy(result)
    await waitFor(() => expect(result.current.form.getValues('email')).toBe(contact.email))

    act(() => {
      result.current.form.setValue('email', 'nueva@nexo.test')
    })
    await act(async () => {
      await result.current.probeField('email')
    })

    expect(urls).toHaveLength(1)
    expect(urls[0]?.searchParams.get('email')).toBe('nueva@nexo.test')
    expect(urls[0]?.searchParams.get('excludeId')).toBe(contact.id)
    expect(result.current.errors.email).toBeUndefined()
  })

  it('sets a phone error on a soft phone duplicate', async () => {
    server.use(
      taxonomyHandler(),
      probeHandler({ severity: 'soft', field: 'phone', matches: [match('phone')], canForce: true }),
    )
    const { result } = renderContactForm()
    await waitForTaxonomy(result)

    act(() => {
      result.current.form.setValue('phone', '3001234567')
    })
    await act(async () => {
      await result.current.probeField('phone')
    })

    expect(result.current.errors.phone?.message).toBe('contacts.duplicates.phoneMatch')
    expect(result.current.duplicateNotice).toBeNull()
  })

  it('stays silent when the probe request fails', async () => {
    server.use(
      taxonomyHandler(),
      http.get(`${API}/contacts/duplicates/probe`, () => HttpResponse.error()),
    )
    const { result } = renderContactForm()
    await waitForTaxonomy(result)

    act(() => {
      result.current.form.setValue('email', 'camila@nexo.test')
    })
    await act(async () => {
      await result.current.probeField('email')
    })

    expect(result.current.errors.email).toBeUndefined()
  })

  it('clears the duplicate error as soon as the field is edited again', async () => {
    server.use(
      taxonomyHandler(),
      probeHandler({
        severity: 'hard',
        field: 'email',
        matches: [match('email')],
        canForce: false,
      }),
    )
    const { result } = renderContactForm()
    await waitForTaxonomy(result)

    act(() => {
      result.current.form.setValue('email', 'camila@nexo.test')
    })
    await act(async () => {
      await result.current.probeField('email')
    })
    expect(result.current.errors.email?.message).toBe('contacts.duplicates.emailTaken')

    act(() => {
      result.current.form.setValue('email', 'camila.torres@nexo.test')
    })

    await waitFor(() => expect(result.current.errors.email).toBeUndefined())
  })

  it('discards a probe result once the field moved on to another value', async () => {
    const releases: Array<() => void> = []
    server.use(
      taxonomyHandler(),
      http.get(`${API}/contacts/duplicates/probe`, async () => {
        await new Promise<void>((resolve) => releases.push(resolve))
        return HttpResponse.json({
          data: {
            duplicate: {
              severity: 'hard',
              field: 'email',
              matches: [match('email')],
              canForce: false,
            },
          },
        })
      }),
    )
    const { result } = renderContactForm()
    await waitForTaxonomy(result)

    act(() => result.current.form.setValue('email', 'camila@nexo.test'))
    const probe = act(async () => {
      await result.current.probeField('email')
    })

    await waitFor(() => expect(releases).toHaveLength(1))
    act(() => result.current.form.setValue('email', 'otra@nexo.test'))
    releases[0]?.()
    await probe

    expect(result.current.errors.email).toBeUndefined()
  })
})
