import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { RecordLayout } from '@/shared/ui/organisms/record-layout'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

const RAIL = [
  { id: 'files', label: 'Archivos', icon: <span>F</span>, count: 2 },
  { id: 'notes', label: 'Notas', icon: <span>N</span>, attention: true },
]

function renderLayout(defaultPanel: string | null = 'files') {
  const onAdd = vi.fn()
  render(
    <TooltipProvider>
      <RecordLayout defaultPanel={defaultPanel}>
        <RecordLayout.Aside footer={<span>pie</span>}>
          <span>resumen</span>
        </RecordLayout.Aside>
        <RecordLayout.Main>
          <RecordLayout.Tabs end={<span>total</span>}>
            <span>pestañas</span>
          </RecordLayout.Tabs>
          <RecordLayout.Content>
            <span>cuerpo</span>
          </RecordLayout.Content>
        </RecordLayout.Main>
        <RecordLayout.Panel
          id="files"
          title="Adjuntos"
          closeLabel="Cerrar panel"
          action={{ label: 'Agregar adjunto', onClick: onAdd }}
        >
          <span>lista de archivos</span>
        </RecordLayout.Panel>
        <RecordLayout.Panel id="notes" title="Notas" closeLabel="Cerrar panel">
          <span>lista de notas</span>
        </RecordLayout.Panel>
        <RecordLayout.Rail items={RAIL} />
      </RecordLayout>
    </TooltipProvider>,
  )
  return { onAdd }
}

describe('RecordLayout', () => {
  it('renders every region it was composed with', () => {
    renderLayout()

    expect(screen.getByText('resumen')).toBeInTheDocument()
    expect(screen.getByText('pie')).toBeInTheDocument()
    expect(screen.getByText('pestañas')).toBeInTheDocument()
    expect(screen.getByText('total')).toBeInTheDocument()
    expect(screen.getByText('cuerpo')).toBeInTheDocument()
  })

  it('shows only the panel the layout opened with', () => {
    renderLayout()

    expect(screen.getByText('lista de archivos')).toBeInTheDocument()
    expect(screen.queryByText('lista de notas')).not.toBeInTheDocument()
  })

  it('opens no panel when none is requested', () => {
    renderLayout(null)

    expect(screen.queryByText('lista de archivos')).not.toBeInTheDocument()
  })

  it('swaps the open panel from the rail', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Notas' }))

    expect(screen.getByText('lista de notas')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('lista de archivos')).not.toBeInTheDocument())
  })

  it('marks the rail item of the open panel as pressed', async () => {
    const user = userEvent.setup()
    renderLayout()

    expect(screen.getByRole('button', { name: 'Archivos' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Notas' }))

    expect(screen.getByRole('button', { name: 'Archivos' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('closes the panel from its own header', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }))

    await waitFor(() => expect(screen.queryByText('lista de archivos')).not.toBeInTheDocument())
  })

  it('runs the panel action without closing the panel', async () => {
    const user = userEvent.setup()
    const { onAdd } = renderLayout()

    await user.click(screen.getByRole('button', { name: 'Agregar adjunto' }))

    expect(onAdd).toHaveBeenCalledOnce()
    expect(screen.getByText('lista de archivos')).toBeInTheDocument()
  })

  it('throws when a part is used outside the layout', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => render(<RecordLayout.Rail items={RAIL} />)).toThrow(
      /must be used within <RecordLayout>/,
    )

    quiet.mockRestore()
  })
})
