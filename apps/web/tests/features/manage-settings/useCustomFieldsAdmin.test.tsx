import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FieldDef } from '@repo/shared-types'
import type { ReactNode } from 'react'

import { useCustomFieldsAdmin } from '@/features/manage-settings/query/useCustomFieldsAdmin'
import { QUERY_KEYS } from '@/shared/query/query-keys'

vi.mock('i18next', () => ({ t: (key: string) => key }))
vi.mock('sileo', () => ({ sileo: { error: vi.fn(), success: vi.fn() } }))

const { getCustomFields, replaceCustomFields } = vi.hoisted(() => ({
  getCustomFields: vi.fn(),
  replaceCustomFields: vi.fn(),
}))

vi.mock('@/shared/api/services/settings.service', () => ({
  default: { getCustomFields, replaceCustomFields },
}))

function buildField(key: string, order: number): FieldDef {
  return { key, label: key, type: 'text', required: false, unique: false, order, isActive: true }
}

const INITIAL = [buildField('ciudad', 1), buildField('barrio', 2)]
const REORDERED = [buildField('barrio', 1), buildField('ciudad', 2)]
const KEY = QUERY_KEYS.settings.customFields('contacts')

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  getCustomFields.mockResolvedValue(INITIAL)
  const hook = renderHook(() => useCustomFieldsAdmin('contacts'), { wrapper })
  return { client, hook }
}

describe('useCustomFieldsAdmin.replace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('writes the new order to the cache immediately (optimistic)', async () => {
    let resolveReplace: () => void = () => {}
    replaceCustomFields.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveReplace = resolve
        }),
    )
    const { client, hook } = setup()
    await waitFor(() => expect(hook.result.current.isPending).toBe(false))

    hook.result.current.replace(REORDERED)

    await waitFor(() => expect(client.getQueryData(KEY)).toEqual(REORDERED))
    resolveReplace()
  })

  it('rolls the cache back to the previous list when the server rejects', async () => {
    replaceCustomFields.mockRejectedValue({ message: 'boom' })
    const { client, hook } = setup()
    await waitFor(() => expect(hook.result.current.isPending).toBe(false))
    getCustomFields.mockReturnValue(new Promise(() => {}))

    hook.result.current.replace(REORDERED)

    await waitFor(() => expect(client.getQueryData(KEY)).toEqual(INITIAL))
    expect(replaceCustomFields).toHaveBeenCalledTimes(1)
  })
})
