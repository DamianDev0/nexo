import { beforeEach, describe, expect, it, vi } from 'vitest'

import { notifySaveFailed } from '@/shared/lib/notify-save-failed'

const error = vi.fn()

vi.mock('sileo', () => ({ sileo: { error: (...args: unknown[]) => error(...args) } }))
vi.mock('i18next', () => ({ t: (key: string) => key }))

describe('notifySaveFailed', () => {
  beforeEach(() => error.mockClear())

  it('lists every field error when the API returns details', () => {
    notifySaveFailed({
      message: 'Custom field validation failed',
      errors: [{ message: 'Unknown field "role"' }, { message: '"Cargo" must be text' }],
    })

    expect(error).toHaveBeenCalledWith({
      title: 'common.saveFailed',
      description: 'Unknown field "role"\n"Cargo" must be text',
    })
  })

  it('falls back to the message when there are no details', () => {
    notifySaveFailed({ message: 'Boom', errors: [] })
    expect(error).toHaveBeenCalledWith({ title: 'common.saveFailed', description: 'Boom' })

    notifySaveFailed()
    expect(error).toHaveBeenLastCalledWith({ title: 'common.saveFailed', description: undefined })
  })
})
