import { expect, fn, userEvent, within } from 'storybook/test'

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
      description: 'Los negocios asociados quedarán sin etapa. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
    },
  },
  play: async ({ args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(body.getByRole('button', { name: 'Eliminar' }))
    await expect(args.onConfirm).toHaveBeenCalledOnce()
    await expect(args.onOpenChange).toHaveBeenCalledWith(false)
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
