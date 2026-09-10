import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Avatar } from '@/shared/ui/atoms/avatar'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import {
  CalendarBlankIcon,
  CheckSquareIcon,
  ClockIcon,
  NotePencilIcon,
  PaperclipIcon,
} from '@/shared/ui/icons'
import { SectionTabs } from '@/shared/ui/molecules/section-tabs'
import { SegmentedControl } from '@/shared/ui/molecules/segmented-control'
import { RecordDrawer } from '@/shared/ui/organisms/record-drawer'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { RecordLayout } from './index'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const onAction = fn()

const RAIL = [
  { id: 'notes', label: 'Notas', icon: <NotePencilIcon className="size-4" />, count: 2 },
  { id: 'tasks', label: 'Tareas', icon: <CheckSquareIcon className="size-4" />, count: 2 },
  { id: 'agenda', label: 'Agenda', icon: <CalendarBlankIcon className="size-4" />, count: 4 },
  { id: 'files', label: 'Archivos', icon: <PaperclipIcon className="size-4" />, count: 2 },
  { id: 'history', label: 'Historial', icon: <ClockIcon className="size-4" />, attention: true },
]

const WORKSPACES = [
  { value: 'opportunity', label: 'Oportunidad' },
  { value: 'activity', label: 'Actividad' },
  { value: 'internal', label: 'Interno' },
]

const SUB_TABS = [
  { key: 'details', label: 'Detalles' },
  { key: 'inspection', label: 'Inspección' },
  { key: 'measurements', label: 'Medidas' },
  { key: 'proposals', label: 'Propuestas' },
]

function Demo() {
  const [workspace, setWorkspace] = useState('opportunity')
  const [tab, setTab] = useState('details')

  return (
    <TooltipProvider>
      <div className="flex h-svh flex-col">
        <RecordLayout defaultPanel="files">
          <RecordLayout.Aside
            footer={
              <PillButton size="sm" onClick={onAction}>
                Editar registro
              </PillButton>
            }
          >
            <RecordDrawer.Identity
              avatar={
                <Avatar
                  size="lg"
                  variant="soft"
                  className="rounded-xl border border-border bg-card"
                >
                  <Avatar.Fallback aria-label="Hannah Weiss">HW</Avatar.Fallback>
                </Avatar>
              }
              name="Hannah Weiss"
              badge={<BadgeSoft tone="outline">Propietaria</BadgeSoft>}
            />
            <RecordDrawer.Sections defaultOpen={['contacts']}>
              <RecordDrawer.Section id="contacts" title="Contactos" meta={{ count: 5 }}>
                <RecordDrawer.Fields
                  rows={[
                    { key: 'dana', label: 'Dana Kim', value: 'dana@weiss.co' },
                    { key: 'maria', label: 'María Torres', value: 'maria@weiss.co' },
                  ]}
                />
              </RecordDrawer.Section>
              <RecordDrawer.Section
                id="engagement"
                title="Interacción"
                meta={{ badge: <BadgeSoft tone="warning">tibio</BadgeSoft> }}
              >
                <RecordDrawer.Empty label="Sin interacción reciente" />
              </RecordDrawer.Section>
              <RecordDrawer.Section id="attribution" title="Atribución">
                <RecordDrawer.Fields
                  rows={[{ key: 'source', label: 'Origen', value: 'Formulario web' }]}
                />
              </RecordDrawer.Section>
            </RecordDrawer.Sections>
          </RecordLayout.Aside>

          <RecordLayout.Main>
            <RecordLayout.Tabs end={<BadgeSoft tone="info">$16.750</BadgeSoft>}>
              <SegmentedControl
                value={workspace}
                onValueChange={setWorkspace}
                options={WORKSPACES}
                className="w-full max-w-md"
              />
            </RecordLayout.Tabs>
            <SectionTabs tabs={SUB_TABS} active={tab} onChange={setTab} className="px-4" />
            <RecordLayout.Content>
              <RecordDrawer.Fields
                rows={[
                  { key: 'close', label: 'Fecha de cierre', value: null },
                  { key: 'value', label: 'Valor del trabajo', value: '$16.750,00' },
                  { key: 'source', label: 'Origen', value: 'Formulario web' },
                ]}
              />
            </RecordLayout.Content>
          </RecordLayout.Main>

          <RecordLayout.Panel
            id="files"
            title="Adjuntos"
            closeLabel="Cerrar panel"
            action={{ label: 'Agregar adjunto', onClick: onAction }}
          >
            <div className="px-4 py-3">
              <RecordDrawer.Fields
                rows={[
                  { key: 'report', label: 'Roof_Inspection_Report.pdf', value: '2,4 MB' },
                  { key: 'photos', label: 'Property_Photos.jpg', value: '1,8 MB' },
                ]}
              />
            </div>
          </RecordLayout.Panel>

          <RecordLayout.Panel id="notes" title="Notas" closeLabel="Cerrar panel">
            <div className="px-4 py-3">
              <RecordDrawer.Empty label="Sin notas todavía" />
            </div>
          </RecordLayout.Panel>

          <RecordLayout.Rail items={RAIL} />
        </RecordLayout>
      </div>
    </TooltipProvider>
  )
}

const meta = {
  title: 'Organisms/RecordLayout',
  component: Demo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const JobRecord: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    await expect(await body.findByText('Adjuntos')).toBeInTheDocument()

    await userEvent.click(body.getByRole('button', { name: 'Notas' }))
    await expect(await body.findByText('Sin notas todavía')).toBeInTheDocument()

    await userEvent.click(body.getByRole('button', { name: 'Notas' }))
    await waitFor(() => expect(body.queryByText('Sin notas todavía')).not.toBeInTheDocument())
  },
}
