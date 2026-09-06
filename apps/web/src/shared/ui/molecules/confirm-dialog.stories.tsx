import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { ConfirmDialog } from './confirm-dialog'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Molecules/ConfirmDialog',
  component: ConfirmDialog,
  parameters: { layout: 'centered', chromatic: { disableSnapshot: true } },
  args: {
    open: true,
    onOpenChange: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    copy: {
      title: 'Cambiar de sector',
      description: 'Esto ajustará la configuración sugerida para tu empresa.',
      confirmLabel: 'Cambiar sector',
      cancelLabel: 'Cancelar',
    },
  },
}

export const Destructive: Story = {
  args: {
    tone: 'destructive',
    copy: {
      title: 'Eliminar pipeline',
      description: 'Los negocios asociados quedarán sin etapa.',
      confirmLabel: 'Desliza para eliminar',
      confirmedLabel: 'Eliminado',
      cancelLabel: 'Cancelar',
    },
  },
  play: async ({ args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    await waitFor(() => expect(body.getByRole('note')).toBeVisible())
    await expect(body.getByText('Desliza para eliminar')).toBeVisible()
    await userEvent.click(body.getByRole('button', { name: 'Cancelar' }))
    await expect(args.onOpenChange).toHaveBeenCalledWith(false)
    await expect(args.onConfirm).not.toHaveBeenCalled()
  },
}

export const DestructiveKeyboardConfirm: Story = {
  args: Destructive.args,
  play: async ({ args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    body.getByRole('button', { name: 'Desliza para eliminar' }).focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(args.onConfirm).toHaveBeenCalledTimes(1))
    await expect(body.getByText('Eliminado')).toBeVisible()
  },
}

export const WorstCase: Story = {
  args: {
    tone: 'destructive',
    copy: {
      title:
        'Eliminar la vista guardada con un nombre absurdamente largo que nadie debería escribir jamás en un campo de texto',
      description: 'Descripción extremadamente larga que se repite. '.repeat(12),
      confirmLabel: 'Eliminar definitivamente todos los registros',
      cancelLabel: 'No, mejor cancelar esta operación',
    },
  },
}
