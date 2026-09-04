import { describe, expect, it } from 'vitest'

import { NOTE_BODY_MAX, NOTE_TITLE_MAX } from '@/features/add-contact-note/config/note.constants'
import { buildNotePayload, buildNoteSchema } from '@/features/add-contact-note/lib/note-form.schema'

const t = ((key: string) => key) as never

describe('buildNoteSchema', () => {
  const schema = buildNoteSchema(t)

  it('rejects an empty body', () => {
    expect(schema.safeParse({ body: '   ' }).success).toBe(false)
  })

  it('rejects bodies over the limit', () => {
    expect(schema.safeParse({ body: 'x'.repeat(NOTE_BODY_MAX + 1) }).success).toBe(false)
  })

  it('trims and accepts a valid body', () => {
    const result = schema.safeParse({ body: '  hola  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.body).toBe('hola')
  })
})

describe('buildNotePayload', () => {
  it('uses the first line as title and the full body as description', () => {
    const payload = buildNotePayload('c1', 'primera línea\nsegunda línea')
    expect(payload).toEqual({
      activityType: 'note',
      contactId: 'c1',
      title: 'primera línea',
      description: 'primera línea\nsegunda línea',
    })
  })

  it('caps the title length', () => {
    const payload = buildNotePayload('c1', 'x'.repeat(NOTE_TITLE_MAX + 50))
    expect(payload.title).toHaveLength(NOTE_TITLE_MAX)
  })
})
