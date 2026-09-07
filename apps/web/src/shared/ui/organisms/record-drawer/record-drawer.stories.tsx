import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Avatar } from '@/shared/ui/atoms/avatar'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import {
  CalendarBlankIcon,
  CheckSquareIcon,
  EnvelopeSimpleIcon,
  NotePencilIcon,
  PhoneIcon,
  PlusIcon,
  TagIcon,
  WhatsappLogoIcon,
} from '@/shared/ui/icons'

import { useRecordPager } from './model/use-record-pager'

import { RecordDrawer } from './index'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const LABELS = { title: 'Ver registro', prev: 'Anterior', next: 'Siguiente', close: 'Cerrar' }

const BLUE = 'var(--info)'
const GREEN = 'var(--positive)'
const AMBER = 'var(--warning)'

const RECORDS = [
  {
    id: '1',
    name: 'William Anderson',
    status: 'Trabajo creado',
    color: BLUE,
    email: 'will@acme.co',
  },
  { id: '2', name: 'Ana Guerrero', status: 'Nuevo', color: GREEN, email: 'ana@neptuno.com' },
  { id: '3', name: 'Carlos Pérez', status: 'Calificado', color: AMBER, email: 'carlos@sol.co' },
]

const onAction = fn()

const QUICK_ACTIONS = [
  { id: 'call', label: 'Llamar', icon: <PhoneIcon />, onClick: onAction },
  { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsappLogoIcon />, onClick: onAction },
  { id: 'email', label: 'Enviar email', icon: <EnvelopeSimpleIcon />, onClick: onAction },
  { id: 'note', label: 'Agregar nota', icon: <NotePencilIcon />, onClick: onAction },
  { id: 'task', label: 'Crear tarea', icon: <CheckSquareIcon />, onClick: onAction },
  { id: 'tag', label: 'Editar etiquetas', icon: <TagIcon />, onClick: onAction },
  { id: 'meeting', label: 'Agendar reunión', icon: <CalendarBlankIcon />, onClick: onAction },
]

function Demo() {
  const [open, setOpen] = useState(true)
  const [current, setCurrent] = useState(RECORDS[0] ?? null)
  const pager = useRecordPager({
    items: RECORDS,
    current,
    getId: (record) => record.id,
    onSelect: setCurrent,
    enabled: open,
  })
  if (!current) return null

  return (
    <div className="h-svh bg-muted/30 p-6">
      <PillButton size="sm" onClick={() => setOpen(true)}>
        Abrir registro
      </PillButton>
      <RecordDrawer open={open} onOpenChange={setOpen} label={LABELS.title}>
        <RecordDrawer.Header labels={LABELS} pager={pager} onClose={() => setOpen(false)} />
        <RecordDrawer.Body page={pager?.index ?? 0}>
          <RecordDrawer.Identity
            avatar={
              <Avatar size="lg" variant="soft" className="rounded-xl border border-border bg-card">
                <Avatar.Fallback aria-label={current.name}>
                  {current.name.slice(0, 2)}
                </Avatar.Fallback>
              </Avatar>
            }
            name={current.name}
            badge={<BadgeSoft tone="outline">Cliente</BadgeSoft>}
          />
          <RecordDrawer.QuickActions
            label="Acciones rápidas"
            items={QUICK_ACTIONS}
            primary={{
              id: 'more',
              label: 'Más acciones',
              icon: <PlusIcon />,
              menu: [{ id: 'sms', label: 'Enviar SMS', onClick: onAction }],
            }}
          />
          <RecordDrawer.Highlight
            label="Estado"
            value={
              <>
                <ColorDot color={current.color} />
                {current.status}
              </>
            }
            meta="hace 1 día"
          />
          <RecordDrawer.Sections defaultOpen={['details']}>
            <RecordDrawer.Section id="details" title="Datos del contacto">
              <RecordDrawer.Fields
                rows={[
                  {
                    key: 'email',
                    label: 'Email',
                    value: current.email,
                    href: `mailto:${current.email}`,
                  },
                  { key: 'phone', label: 'Teléfono', value: null },
                  { key: 'city', label: 'Ciudad', value: 'Medellín' },
                ]}
              />
            </RecordDrawer.Section>
            <RecordDrawer.Section id="activity" title="Actividad">
              <RecordDrawer.Empty label="Sin actividad registrada" />
            </RecordDrawer.Section>
            <RecordDrawer.Section
              id="notes"
              title="Notas"
              meta={{ count: 0 }}
              action={{ label: 'Agregar nota', onClick: onAction }}
            >
              <RecordDrawer.Empty
                label="Sin notas todavía"
                action={{ label: 'Agregar nota', onClick: onAction }}
              />
            </RecordDrawer.Section>
            <RecordDrawer.Section
              id="tags"
              title="Etiquetas"
              meta={{ count: 1, badge: <BadgeSoft tone="info">frío</BadgeSoft> }}
              action={{ label: 'Editar etiquetas', onClick: onAction }}
            >
              <BadgeSoft color={BLUE}>VIP</BadgeSoft>
            </RecordDrawer.Section>
          </RecordDrawer.Sections>
        </RecordDrawer.Body>
        <RecordDrawer.Footer>
          <PillButton size="sm" onClick={onAction}>
            Editar contacto
          </PillButton>
        </RecordDrawer.Footer>
      </RecordDrawer>
    </div>
  )
}

const meta = {
  title: 'Organisms/RecordDrawer',
  component: Demo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const ContactRecord: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    await expect(await body.findByText('1/3')).toBeInTheDocument()
    await userEvent.click(body.getByRole('button', { name: 'Siguiente' }))
    await expect(await body.findByText('2/3')).toBeInTheDocument()
    await expect(await body.findByText('Ana Guerrero')).toBeInTheDocument()
    await userEvent.click(body.getByRole('button', { name: /Notas/ }))
    await expect(await body.findByText('Sin notas todavía')).toBeInTheDocument()
  },
}
