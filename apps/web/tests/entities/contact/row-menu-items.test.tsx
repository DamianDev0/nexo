import { describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'

import type {
  ContactNameLabels,
  ContactRowActions,
} from '@/entities/contact/model/types/contact-cells.types'

import { buildRowMenuItems } from '@/entities/contact/lib/row-menu-items'

const LABELS = {
  preview: 'Vista rápida',
  addNote: 'Agregar nota',
  editTags: 'Editar etiquetas',
  restore: 'Restaurar',
  rowMenu: 'Acciones',
  missing: () => null,
  tags: { title: 'Etiquetas', count: (total: number) => `${total}` },
  notes: { title: 'Notas' },
  menu: {
    viewRecord: 'Ver registro',
    open: 'Abrir y editar',
    call: 'Llamar',
    sms: 'Enviar SMS',
    email: 'Escribir email',
    task: 'Crear tarea',
    meeting: 'Agendar reunión',
  },
} satisfies ContactNameLabels

const CONTACT = { ...CONTACTS_FIXTURE[0]!, phone: '3001234567', email: 'ana@nexo.test' }

function idsFor(actions: ContactRowActions, overrides = {}) {
  return buildRowMenuItems({ ...CONTACT, ...overrides }, LABELS, actions).map((item) => item.id)
}

describe('buildRowMenuItems', () => {
  it('offers nothing when the row has no handlers', () => {
    expect(idsFor({})).toEqual([])
  })

  it('lists every action the row can actually perform', () => {
    const actions: ContactRowActions = {
      onViewRecord: vi.fn(),
      onOpen: vi.fn(),
      onCall: vi.fn(),
      onCompose: vi.fn(),
      onLogActivity: vi.fn(),
    }

    expect(idsFor(actions)).toEqual([
      'viewRecord',
      'open',
      'call',
      'sms',
      'email',
      'task',
      'meeting',
    ])
  })

  it('drops channels the contact cannot be reached on', () => {
    const actions: ContactRowActions = { onCall: vi.fn(), onCompose: vi.fn() }

    expect(idsFor(actions, { phone: null, whatsapp: null, email: null })).toEqual([])
    expect(idsFor(actions, { phone: null, whatsapp: '3009998877', email: null })).toEqual(['call'])
    expect(idsFor(actions, { phone: null, whatsapp: null })).toEqual(['email'])
  })

  it('dials the normalised number', () => {
    const onCall = vi.fn()
    const [call] = buildRowMenuItems({ ...CONTACT, phone: '300 123 4567' }, LABELS, { onCall })

    call?.onClick?.()

    expect(onCall).toHaveBeenCalledWith('+573001234567')
  })

  it('routes compose actions to the right channel', () => {
    const onCompose = vi.fn()
    const items = buildRowMenuItems(CONTACT, LABELS, { onCompose })

    items.find((item) => item.id === 'sms')?.onClick?.()
    items.find((item) => item.id === 'email')?.onClick?.()

    expect(onCompose).toHaveBeenNthCalledWith(1, 'sms', CONTACT)
    expect(onCompose).toHaveBeenNthCalledWith(2, 'email', CONTACT)
  })
})
