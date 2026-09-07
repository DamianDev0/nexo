import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { RecordDrawer } from '@/shared/ui/organisms/record-drawer'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

const LABELS = { title: 'Ver registro', prev: 'Anterior', next: 'Siguiente', close: 'Cerrar' }

function renderDrawer(pager = { index: 0, total: 3, hasPrev: false, hasNext: true }) {
  const next = vi.fn()
  const prev = vi.fn()
  const onOpenChange = vi.fn()
  const onAdd = vi.fn()
  render(
    <TooltipProvider>
      <RecordDrawer open onOpenChange={onOpenChange} label="Registro">
        <RecordDrawer.Header
          labels={LABELS}
          onClose={() => onOpenChange(false)}
          pager={{ ...pager, next, prev }}
        />
        <RecordDrawer.Body page={pager.index}>
          <RecordDrawer.Identity avatar={<span>AV</span>} name="Ana Guerrero" />
          <RecordDrawer.QuickActions
            label="Acciones"
            items={[{ id: 'call', label: 'Llamar', icon: <span>☎</span>, onClick: onAdd }]}
          />
          <RecordDrawer.Highlight label="Estado" value="Nuevo" meta="hace 1 día" />
          <RecordDrawer.Sections defaultOpen={['details']}>
            <RecordDrawer.Section id="details" title="Datos">
              <RecordDrawer.Fields rows={[{ key: 'email', label: 'Email', value: 'ana@x.co' }]} />
            </RecordDrawer.Section>
            <RecordDrawer.Section
              id="notes"
              title="Notas"
              meta={{ count: 2 }}
              action={{ label: 'Agregar nota', onClick: onAdd }}
            >
              <span>nota uno</span>
            </RecordDrawer.Section>
          </RecordDrawer.Sections>
        </RecordDrawer.Body>
      </RecordDrawer>
    </TooltipProvider>,
  )
  return { next, prev, onOpenChange, onAdd }
}

describe('RecordDrawer', () => {
  it('renders the pager position and pages forward', async () => {
    const { next, prev } = renderDrawer()
    expect(screen.getByText('1/3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(next).toHaveBeenCalledOnce()
    expect(prev).not.toHaveBeenCalled()
  })

  it('closes from the header', async () => {
    const { onOpenChange } = renderDrawer()
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('opens default sections and toggles the others', async () => {
    renderDrawer()
    expect(screen.getByText('ana@x.co')).toBeInTheDocument()
    expect(screen.queryByText('nota uno')).not.toBeInTheDocument()

    const notes = screen.getByRole('button', { name: /Notas/ })
    expect(notes).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(notes)
    await waitFor(() => expect(screen.getByText('nota uno')).toBeInTheDocument())
    expect(notes).toHaveAttribute('aria-expanded', 'true')
  })

  it('exposes the section action and quick actions as labelled buttons', async () => {
    const { onAdd } = renderDrawer()
    await userEvent.click(screen.getByRole('button', { name: 'Agregar nota' }))
    await userEvent.click(screen.getByRole('button', { name: 'Llamar' }))
    expect(onAdd).toHaveBeenCalledTimes(2)
  })
})

describe('RecordDrawer.Fields', () => {
  it('renders links for rows with an href and a placeholder for empty values', () => {
    render(
      <RecordDrawer.Fields
        rows={[
          { key: 'email', label: 'Email', value: 'ana@x.co', href: 'mailto:ana@x.co' },
          { key: 'phone', label: 'Teléfono', value: null },
        ]}
        emptyValue="—"
      />,
    )
    expect(screen.getByRole('link', { name: 'ana@x.co' })).toHaveAttribute(
      'href',
      'mailto:ana@x.co',
    )
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
